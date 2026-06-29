'use client';

import GuideBookingForm from '@/components/GuideBookingForm';

export default function GuidePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-12 h-0.5 bg-accent mx-auto mb-4" />
        <h1 className="text-2xl font-bold tracking-wide text-primary-dark">Хөтөчийн бүртгэлийн хэсэг</h1>
        <p className="text-sm text-muted mt-1.5">Шинэ захиалга бүртгэх</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-border p-6 border-t-4 border-t-accent">
        <GuideBookingForm />
      </div>
    </div>
  );
}
