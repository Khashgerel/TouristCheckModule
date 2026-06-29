'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';

export default function Navigation() {
  const { state, logout } = useStore();
  const { user } = state;

  return (
    <nav className="nav-diamond text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wide">
          Аялал Чек Модуль
        </Link>
        <div className="flex items-center gap-3">
          {!user && (
            <Link
              href="/guide"
              className="text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-all"
            >
              Бүртгэл
            </Link>
          )}
          {user?.role === 'staff' && (
            <>
              <Link
                href="/staff"
                className="text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-all"
              >
                Хянах самбар
              </Link>
              <span className="text-sm text-white/70 hidden sm:inline">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm font-medium bg-accent hover:bg-accent-light px-3 py-1.5 rounded-md transition-all"
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
