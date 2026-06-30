'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

export default function Home() {
  const { state, login } = useStore();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (state.user) {
      router.push('/staff');
    }
  }, [state.user, router]);

  if (state.user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(username, password);
    if (!ok) setError('Нэвтрэх нэр эсвэл нууц үг буруу байна');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-0.5 bg-accent mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-wide text-primary-dark">Аялал Чек Модуль</h1>
          <p className="text-muted mt-2">Дотоод захиалгын бүртгэлийн систем</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-border p-6 space-y-4 border-t-4 border-t-accent">
          <h2 className="text-lg font-semibold text-foreground text-center tracking-wide">Ажилтны нэвтрэх</h2>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Нэвтрэх нэр</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary text-base"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Нууц үг</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary text-base"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-lg tracking-wide"
            >
              Нэвтрэх
            </button>
          </form>
          <div className="text-center text-sm text-muted pt-2 border-t border-border">
            Хөтөч нар <Link href="/guide" className="text-accent hover:text-accent-light font-medium">бүртгэлийн хуудас</Link> руу орно уу
          </div>
        </div>
      </div>
    </div>
  );
}
