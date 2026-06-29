'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import CalendarView from '@/components/CalendarView';
import BookingList from '@/components/BookingList';
import GuideBookingForm from '@/components/GuideBookingForm';
import type { Booking } from '@/lib/types';

export default function StaffPage() {
  const { state, loadBookings } = useStore();
  const router = useRouter();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!state.user || state.user.role !== 'staff') {
      router.push('/');
      return;
    }
    loadBookings();
  }, [state.user, router, loadBookings]);

  if (!state.user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {state.loading && (
        <div className="text-center py-2 text-sm text-primary animate-pulse">Өгөгдөл татаж байна...</div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="w-12 h-0.5 bg-accent mb-3" />
          <h1 className="text-2xl font-bold tracking-wide text-primary-dark">Ажилтны хянах самбар</h1>
          <p className="text-sm text-muted mt-1">Нийт {state.bookings.length} захиалга</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'calendar'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-foreground border border-border hover:bg-primary/5'
            }`}
          >
            Календар харах
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'list'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-foreground border border-border hover:bg-primary/5'
            }`}
          >
            Жагсаалт харах
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {view === 'calendar' ? (
            <CalendarView
              bookings={state.bookings}
              onEdit={(b) => setEditingBooking(b)}
            />
          ) : (
            <BookingList
              bookings={state.bookings}
              onEdit={(b) => setEditingBooking(b)}
            />
          )}
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-md border border-border p-5 sticky top-6 border-t-4 border-t-accent">
            <h2 className="text-lg font-semibold text-foreground mb-4 tracking-wide">
              {editingBooking ? 'Захиалга засах' : 'Шинэ захиалга'}
            </h2>
            <GuideBookingForm
              key={editingBooking?.id ?? 'new'}
              existingBooking={editingBooking ?? undefined}
              onSuccess={() => setEditingBooking(null)}
            />

            {editingBooking && (
              <button
                onClick={() => setEditingBooking(null)}
                className="mt-3 w-full text-sm text-muted hover:text-foreground py-2 transition-colors"
              >
                Цуцлах
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
