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
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
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
          <h1 className="text-3xl font-bold text-emerald-800">🏔️ Аялал Чек Модуль</h1>
          <p className="text-slate-500 mt-2">Дотоод захиалгын бүртгэлийн систем</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 text-center">Ажилтны нэвтрэх</h2>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Нэвтрэх нэр</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full px-3 py-2.5 rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-base"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Нууц үг</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-3 py-2.5 rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-base"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-lg"
            >
              Нэвтрэх
            </button>
          </form>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 space-y-0.5">
            <p className="font-semibold">🔑 Демо нэвтрэх:</p>
            <p>Нэр: <span className="font-mono font-bold">admin</span></p>
            <p>Нууц үг: <span className="font-mono font-bold">admin123</span></p>
          </div>

          <div className="text-center text-sm text-slate-400 pt-2 border-t border-slate-100">
            Хөтөч нар <Link href="/guide" className="text-emerald-600 hover:text-emerald-500 font-medium">бүртгэлийн хуудас</Link> руу орно уу
          </div>
        </div>
      </div>
    </div>
  );
}
