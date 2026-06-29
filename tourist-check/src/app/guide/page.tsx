'use client';

import GuideBookingForm from '@/components/GuideBookingForm';

export default function GuidePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-800">Хөтөчийн бүртгэлийн хэсэг</h1>
        <p className="text-sm text-slate-500 mt-1">Шинэ захиалга бүртгэх</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5">
        <GuideBookingForm />
      </div>
    </div>
  );
}
