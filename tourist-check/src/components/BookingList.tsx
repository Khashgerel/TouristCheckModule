'use client';

import { useState, useMemo } from 'react';
import type { Booking } from '@/lib/types';
import DailySummary from './DailySummary';
import { formatDate } from '@/lib/format';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  completed: 'bg-slate-100 text-slate-600 border-slate-300',
};

const statusLabels: Record<string, string> = {
  pending: 'Хүлээгдэж буй',
  confirmed: 'Баталгаажсан',
  completed: 'Дууссан',
};

interface Props {
  bookings: Booking[];
  onEdit?: (booking: Booking) => void;
}

export default function BookingList({ bookings, onEdit }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        !search ||
        b.groupName.toLowerCase().includes(search.toLowerCase()) ||
        b.guideName.toLowerCase().includes(search.toLowerCase()) ||
        b.guide.firstName.toLowerCase().includes(search.toLowerCase()) ||
        b.guide.lastName.toLowerCase().includes(search.toLowerCase()) ||
        b.busNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dateA = new Date(`${a.arrivalDate}T${a.arrivalTime}`);
      const dateB = new Date(`${b.arrivalDate}T${b.arrivalTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filtered]);

  return (
    <div className="space-y-4">
      <DailySummary bookings={sorted} />

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Хайх (бүлэг, нэр, овог, автобус)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
        >
          <option value="all">Бүх төлөв</option>
          <option value="pending">Хүлээгдэж буй</option>
          <option value="confirmed">Баталгаажсан</option>
          <option value="completed">Дууссан</option>
        </select>
      </div>

      {sorted.length === 0 && (
        <p className="text-center text-slate-400 py-8 text-sm">Илэрц олдсонгүй</p>
      )}

      <div className="space-y-2">
        {sorted.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-xl border border-emerald-100 p-4 hover:border-emerald-300 transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800">{b.groupName}</span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="font-medium text-slate-700">{b.guideName}</span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-sm text-slate-500">{formatDate(b.arrivalDate)}</span>
                  <span className="text-sm text-slate-500">{b.arrivalTime}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[b.status]}`}>
                    {statusLabels[b.status]}
                  </span>
                </div>
                <div className="text-sm text-slate-500 flex gap-3 flex-wrap">
                  <span>Нийт: <strong>{b.maleTourists + b.femaleTourists}</strong></span>
                  <span>♂ {b.maleTourists}</span>
                  <span>♀ {b.femaleTourists}</span>
                  <span>Бариа: ♂{b.saunaMale} ♀{b.saunaFemale}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {b.guide.lastName} {b.guide.firstName} | {b.guide.phone}
                  {b.busNumber ? ` | Автобус: ${b.busNumber}` : ''}
                </div>
              </div>
              <button
                onClick={() => onEdit?.(b)}
                className="shrink-0 text-sm text-emerald-600 hover:text-emerald-500 font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Засах
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
