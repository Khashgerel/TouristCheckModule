'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStore, canEdit } from '@/lib/store';
import GuideBookingForm from '@/components/GuideBookingForm';

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { state, getBookingById } = useStore();
  const booking = getBookingById(params.id as string);

  useEffect(() => {
    if (!state.user) router.push('/');
  }, [state.user, router]);

  if (!state.user || !booking) {
    return (
      <div className="text-center py-12 text-muted">
        {!booking ? 'Захиалга олдсонгүй' : 'Түр хүлээгээрэй...'}
      </div>
    );
  }

  if (!canEdit(booking, state.user)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-red-700 mb-2">Хандах эрхгүй байна</h2>
          <p className="text-sm text-red-600">
            Энэ захиалгыг засах боломжгүй. 24 цагийн хугацаа дууссан эсвэл таны захиалга биш байна.
          </p>
          <button
            onClick={() => router.push('/guide')}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-12 h-0.5 bg-accent mx-auto mb-4" />
        <h1 className="text-2xl font-bold tracking-wide text-primary-dark">Захиалга засах</h1>
        <p className="text-sm text-muted mt-1.5">{booking.arrivalDate} {booking.arrivalTime}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-border p-6 border-t-4 border-t-accent">
        <GuideBookingForm existingBooking={booking} onSuccess={() => router.push('/guide')} />
      </div>
    </div>
  );
}
