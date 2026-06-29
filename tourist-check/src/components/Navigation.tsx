'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';

export default function Navigation() {
  const { state, logout } = useStore();
  const { user } = state;

  return (
    <nav className="bg-emerald-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🏔️ Аялал Чек Модуль
        </Link>
        <div className="flex items-center gap-4">
          {!user && (
            <Link
              href="/guide"
              className="text-sm bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-md transition-colors"
            >
              📝 Бүртгэл
            </Link>
          )}
          {user?.role === 'staff' && (
            <>
              <Link
                href="/staff"
                className="text-sm bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-md transition-colors"
              >
                📊 Хянах самбар
              </Link>
              <span className="text-sm text-emerald-100">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md transition-colors"
              >
                Гарах
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
