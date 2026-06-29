## Code Review — Tourist Check Module

### 1. Data Layer (`src/lib/db.ts`, `src/lib/queries.ts`)

**Race condition in schema init** (`db.ts:33-43`)
`getPool()` checks `initialized` flag outside a mutex. Under concurrent requests (common in serverless), multiple calls can attempt `CREATE TABLE IF NOT EXISTS` simultaneously. While `IF NOT EXISTS` makes this benign, a more robust pattern would use a module-level promise:

```ts
let initPromise: Promise<void> | null = null;
export async function getPool(): Promise<Pool> {
  if (!initPromise) {
    initPromise = pool.query(SCHEMA_SQL).then(() => {});
  }
  await initPromise;
  return pool;
}
```

**Misleading function name** (`queries.ts:58-71`)
`checkDuplicate` returns `true` when there is **no** duplicate (i.e., it's safe to proceed). The caller reads `!dupOk` as "not OK if duplicate", which is correct but the name suggests it checks **for** duplicates. Rename to `isDuplicate` (and invert the return), or rename to `noDuplicateExists`.

**Side effect in getter** (`queries.ts:107-113`)
`getAllBookings()` calls `autoCompleteExpired()` as a side effect. A GET request unexpectedly mutates data. Move this to a scheduled job or trigger it explicitly from a separate endpoint.

**Code duplication** (`queries.ts:93-97` vs `store.tsx:163-168`)
`isWithinEditWindow` in queries.ts is identical to `isEditable` in store.tsx. DRY — export from queries and import in store.

**Missing parseInt radix** (`GuideBookingForm.tsx:173,184,201,212`)
`parseInt(e.target.value)` — should be `parseInt(e.target.value, 10)` to avoid octal interpretation in older environments.

**Dead validation checks** (`GuideBookingForm.tsx:53-56`)
Checks for `maleTourists < 0`, `femaleTourists < 0`, `saunaMale < 0`, `saunaFemale < 0` can never fire because the `onChange` handler clamps values with `Math.max(0, ...)`. Remove dead code or add explicit negative checks before clamping.

**Missing phone search** (`BookingList.tsx:29-41`)
Search filters group name, guide name, bus number — but not `guide.phone`. Can be useful when a guide calls to check their booking.

### 2. API Layer (`src/app/api/bookings/`)

**Duplicated error handling** (`route.ts:33-49` and `[id]/route.ts:48-67`)
Both POST and PUT handlers have identical `DUPLICATE`/`TIME_GAP` error handling. Extract into a shared helper:

```ts
function handleBookingError(err: unknown) {
  if (err instanceof Error) {
    if (err.message === 'DUPLICATE') return NextResponse.json({...}, {status: 409});
    if (err.message.startsWith('TIME_GAP:')) return NextResponse.json({...}, {status: 409});
    if (err.message === 'EDIT_WINDOW_EXPIRED') return NextResponse.json({...}, {status: 403});
  }
  return null;
}
```

**No input validation** (`route.ts:14-31`)
POST accepts whatever JSON is sent. If `body.groupName` is missing, it passes `undefined` to the DB which coerces to `NULL` which violates `NOT NULL`. Add early validation:

```ts
if (!body.groupName?.trim()) return NextResponse.json({ error: 'groupName required' }, { status: 400 });
```

### 3. State Management (`src/lib/store.tsx`)

**Silent fetch failure** (`store.tsx:85-95`)
`loadBookings` catches errors without surfacing them. The loading spinner just disappears and the user sees an empty state — with no indication something went wrong. Add an `error` field to state and surface it in the UI.

**Unused default export** (`db.ts:51`)
`export default pool` is never imported by any file. Only `query` is used. Remove.

### 4. UI Components

**Mixed color tokens** (`GuideBookingForm.tsx`, `DailySummary.tsx`, etc.)
Some files use custom theme tokens (`text-foreground`, `text-muted`, `border-border`) while others use raw Tailwind colors (`text-slate-...`, `border-slate-...`). After your frontend-design pass, the new tokens (`text-foreground`, `text-muted`) are used in most places but `text-slate-*` still appears in a few spots — specifically `errors.lastName`-related text in GuideBookingForm (`text-red-500`), and in DailySummary's `text-xs font-medium opacity-75`. Inconsistent; standardize on theme tokens.

**Status color constant duplication** (`CalendarView.tsx:11-15`, `BookingList.tsx:8-12`)
Both files define identical `statusColors` maps. Extract to a shared constants file (`src/lib/constants.ts`).

### 5. Security

**No authentication on API routes** — Critical. Any HTTP client can POST/PUT/DELETE `/api/bookings` without any credential check. The guide page is intentionally public (anonymous guide registration), but staff operations (PUT, DELETE, listing all bookings) should be protected.

**Fix: API key or bearer token on protected operations**

```ts
// src/lib/auth.ts
export function isStaffRequest(request: Request): boolean {
  const key = request.headers.get('x-api-key');
  return key === process.env.STAFF_API_KEY;
}
```

Then guard in the route handlers:

```ts
// src/app/api/bookings/route.ts
export async function GET(request: Request) {
  if (!isStaffRequest(request)) {
    return NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 401 });
  }
  // ...
}
```

The guide-facing POST (anonymous booking) can remain open. Staff-only operations (GET all, PUT, DELETE) require the key. Store `STAFF_API_KEY` in `.env.local` and send it from the staff client after login.

**No rate limiting** — Low risk for an internal tool. If exposed to a wider network, add a simple rate limiter via middleware:

```ts
// src/middleware.ts (new file)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateMap = new Map<string, number>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/') && request.method !== 'GET') {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const last = rateMap.get(ip) ?? 0;
    if (now - last < 1000) {
      return NextResponse.json({ error: 'Хэт олон хүсэлт' }, { status: 429 });
    }
    rateMap.set(ip, now);
  }
}
```

**No CSRF protection** — Not actionable for a SPA that consumes its own API. CSRF tokens don't apply when the API is called from client-side JS on the same origin. The browser's Same-Origin Policy already protects against external form submissions reading responses. No action needed.

### 6. TypeScript & Configuration

- `tsconfig.json` has `strict: true` ✓
- `next.config.ts` is empty — fine for this project
- Missing environment variable validation — `DATABASE_STRING` is used without a check. If undefined, the Pool constructor silently fails later. Add a startup guard.

### 7. Positive Highlights

- Clean component separation, single responsibility throughout
- Good use of `useMemo` for derived data (CalendarView booking map, BookingList filtering)
- Context + useReducer pattern is appropriate for this scale
- Mongolian i18n throughout is consistent
- Duplicate/time-gap detection is robust and well-tested (confirmed via Playwright earlier)
- The frontend-design pass gave the app a distinctive, non-template visual identity
- The 24-hour edit window is checked on both client and server — defense in depth
- No dependency bloat — only Next.js, React, pg, and Tailwind
