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
      <SummaryCard label="Нийт" value={`${totals.total}`} color="bg-primary/5 text-primary-dark border-primary/20" />
      <SummaryCard label="Эрэгтэй" value={`${totals.male}`} color="bg-accent/5 text-accent border-accent/20" />
      <SummaryCard label="Эмэгтэй" value={`${totals.female}`} color="bg-gold/5 text-amber-800 border-gold/20" />
      <SummaryCard label="Бариа (Эр)" value={`${totals.saunaMale}`} color="bg-primary/5 text-primary-dark border-primary/20" />
      <SummaryCard label="Бариа (Эм)" value={`${totals.saunaFemale}`} color="bg-accent/5 text-accent border-accent/20" />
      <SummaryCard label="Захиалга" value={`${totals.bookings}`} color="bg-gold/5 text-amber-800 border-gold/20" />
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
