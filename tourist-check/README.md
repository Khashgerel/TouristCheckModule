# Аялал Чек Модуль (Tourist Check Module)

Дотоод захиалгын бүртгэлийн систем — Mongolian internal tour booking management system.

Built with [Next.js](https://nextjs.org) (App Router), React, TypeScript, Tailwind CSS v4, and PostgreSQL (Neon).

## Getting Started

```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_STRING

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_STRING` | Yes | PostgreSQL connection string (Neon) |

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Set the `DATABASE_STRING` environment variable in Vercel dashboard
4. Deploy — no additional configuration needed
