'use client';

import type { Booking } from '@/lib/types';

interface Props {
  bookings: Booking[];
}

export default function DailySummary({ bookings }: Props) {
  const totals = bookings.reduce(
    (acc, b) => ({
      total: acc.total + b.maleTourists + b.femaleTourists,
      male: acc.male + b.maleTourists,
      female: acc.female + b.femaleTourists,
      saunaMale: acc.saunaMale + b.saunaMale,
      saunaFemale: acc.saunaFemale + b.saunaFemale,
      bookings: acc.bookings + 1,
    }),
    { total: 0, male: 0, female: 0, saunaMale: 0, saunaFemale: 0, bookings: 0 }
  );

  if (bookings.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      <SummaryCard label="Нийт" value={`${totals.total}`} color="bg-emerald-50 text-emerald-700 border-emerald-200" />
      <SummaryCard label="Эрэгтэй" value={`♂ ${totals.male}`} color="bg-blue-50 text-blue-700 border-blue-200" />
      <SummaryCard label="Эмэгтэй" value={`♀ ${totals.female}`} color="bg-pink-50 text-pink-700 border-pink-200" />
      <SummaryCard label="Бариа (Эр)" value={`♂ ${totals.saunaMale}`} color="bg-cyan-50 text-cyan-700 border-cyan-200" />
      <SummaryCard label="Бариа (Эм)" value={`♀ ${totals.saunaFemale}`} color="bg-rose-50 text-rose-700 border-rose-200" />
      <SummaryCard label="Захиалга" value={`${totals.bookings}`} color="bg-amber-50 text-amber-700 border-amber-200" />
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${color}`}>
      <div className="text-xs font-medium opacity-75">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
