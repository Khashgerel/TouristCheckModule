'use client';

import { useState } from 'react';
import { useStore, isEditable } from '@/lib/store';
import type { Booking, BookingFormData, GuideInfo } from '@/lib/types';

interface Props {
  existingBooking?: Booking;
  onSuccess?: () => void;
}

const emptyForm: BookingFormData = {
  groupName: '',
  arrivalDate: '',
  arrivalTime: '',
  maleTourists: 0,
  femaleTourists: 0,
  saunaMale: 0,
  saunaFemale: 0,
  guide: { lastName: '', firstName: '', phone: '' },
  busNumber: '',
};

export default function GuideBookingForm({ existingBooking, onSuccess }: Props) {
  const { addBooking, updateBooking } = useStore();
  const [form, setForm] = useState<BookingFormData>(
    existingBooking
      ? {
          groupName: existingBooking.groupName,
          arrivalDate: existingBooking.arrivalDate,
          arrivalTime: existingBooking.arrivalTime,
          maleTourists: existingBooking.maleTourists,
          femaleTourists: existingBooking.femaleTourists,
          saunaMale: existingBooking.saunaMale,
          saunaFemale: existingBooking.saunaFemale,
          guide: { ...existingBooking.guide },
          busNumber: existingBooking.busNumber,
        }
      : { ...emptyForm }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData | keyof GuideInfo, string>>>({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [editStatus, setEditStatus] = useState<Booking['status']>(existingBooking?.status ?? 'pending');

  const editWindowExpired = existingBooking ? !isEditable(existingBooking) : false;

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.groupName.trim()) errs.groupName = 'Аяллын бүлгийн нэр оруулна уу';
    if (!form.arrivalDate) errs.arrivalDate = 'Ирэх өдрөө сонгоно уу';
    if (!form.arrivalTime) errs.arrivalTime = 'Ирэх цагаа сонгоно уу';
    if (form.maleTourists < 0) errs.maleTourists = 'Зөв тоо оруулна уу';
    if (form.femaleTourists < 0) errs.femaleTourists = 'Зөв тоо оруулна уу';
    if (form.saunaMale < 0) errs.saunaMale = 'Зөв тоо оруулна уу';
    if (form.saunaFemale < 0) errs.saunaFemale = 'Зөв тоо оруулна уу';
    if (form.maleTourists + form.femaleTourists === 0) {
      errs.maleTourists = 'Нийт жуулчдын тоо 0-ээс их байх ёстой';
    }
    if (!form.guide.lastName.trim()) errs.lastName = 'Овгоо оруулна уу';
    if (!form.guide.firstName.trim()) errs.firstName = 'Нэрээ оруулна уу';
    if (!form.guide.phone.trim()) {
      errs.phone = 'Утасны дугаараа оруулна уу';
    } else if (!/^\d{8,}$/.test(form.guide.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Утасны дугаар буруу байна';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setApiError('');
    if (!validate()) return;

    if (editWindowExpired) {
      setApiError('24 цагийн хугацаа дууссан тул захиалгыг шинэчлэх боломжгүй');
      return;
    }

    const result = existingBooking
      ? await updateBooking({ ...existingBooking, ...form, status: editStatus })
      : await addBooking(form);

    if (!result.ok) {
      setApiError(result.error);
      return;
    }
    setSuccess(true);
    setApiError('');
    if (!existingBooking) setForm({ ...emptyForm });
    setTimeout(() => setSuccess(false), 4000);
    onSuccess?.();
  };

  const updateField = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const updateGuideField = (key: keyof typeof form.guide, value: string) => {
    setForm((prev) => ({ ...prev, guide: { ...prev.guide, [key]: value } }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const inputClass = (field: keyof typeof errors) =>
    `w-full px-3 py-2.5 rounded-lg border ${errors[field] ? 'border-red-400 ring-2 ring-red-200' : 'border-border'} bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="bg-primary/5 border border-primary/20 text-primary-dark px-4 py-3 rounded-lg text-sm font-medium">
          Амжилттай хадгалагдлаа
        </div>
      )}
      {apiError && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
          {apiError}
        </div>
      )}
      {editWindowExpired && (
        <div className="bg-gold/10 border border-gold/30 text-amber-800 px-4 py-3 rounded-lg text-sm">
          24 цагийн хугацаа дууссан. Энэ захиалгыг шинэчлэх боломжгүй.
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Аяллын бүлгийн нэр</label>
        <input
          type="text"
          value={form.groupName}
          onChange={(e) => updateField('groupName', e.target.value)}
          className={inputClass('groupName')}
          placeholder="Говийн аялал"
        />
        {errors.groupName && <p className="text-red-500 text-xs mt-1">{errors.groupName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ирэх өдөр, цаг</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="date"
              value={form.arrivalDate}
              onChange={(e) => updateField('arrivalDate', e.target.value)}
              className={inputClass('arrivalDate')}
            />
            {errors.arrivalDate && <p className="text-red-500 text-xs mt-1">{errors.arrivalDate}</p>}
          </div>
          <div>
            <input
              type="time"
              value={form.arrivalTime}
              onChange={(e) => updateField('arrivalTime', e.target.value)}
              className={inputClass('arrivalTime')}
            />
            {errors.arrivalTime && <p className="text-red-500 text-xs mt-1">{errors.arrivalTime}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Жуулчдын тоо</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Эрэгтэй</label>
            <input
              type="number"
              min={0}
              value={form.maleTourists}
              onChange={(e) => updateField('maleTourists', Math.max(0, parseInt(e.target.value) || 0))}
              className={inputClass('maleTourists')}
            />
            {errors.maleTourists && <p className="text-red-500 text-xs mt-1">{errors.maleTourists}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Эмэгтэй</label>
            <input
              type="number"
              min={0}
              value={form.femaleTourists}
              onChange={(e) => updateField('femaleTourists', Math.max(0, parseInt(e.target.value) || 0))}
              className={inputClass('femaleTourists')}
            />
            {errors.femaleTourists && <p className="text-red-500 text-xs mt-1">{errors.femaleTourists}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Барианд орох хүний тоо</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Эрэгтэй</label>
            <input
              type="number"
              min={0}
              value={form.saunaMale}
              onChange={(e) => updateField('saunaMale', Math.max(0, parseInt(e.target.value) || 0))}
              className={inputClass('saunaMale')}
            />
            {errors.saunaMale && <p className="text-red-500 text-xs mt-1">{errors.saunaMale}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Эмэгтэй</label>
            <input
              type="number"
              min={0}
              value={form.saunaFemale}
              onChange={(e) => updateField('saunaFemale', Math.max(0, parseInt(e.target.value) || 0))}
              className={inputClass('saunaFemale')}
            />
            {errors.saunaFemale && <p className="text-red-500 text-xs mt-1">{errors.saunaFemale}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Хөтөчийн мэдээлэл</label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Овог</label>
            <input
              type="text"
              value={form.guide.lastName}
              onChange={(e) => updateGuideField('lastName', e.target.value)}
              className={inputClass('lastName')}
              placeholder="Овог"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Нэр</label>
            <input
              type="text"
              value={form.guide.firstName}
              onChange={(e) => updateGuideField('firstName', e.target.value)}
              className={inputClass('firstName')}
              placeholder="Нэр"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-0.5">Утасны дугаар</label>
          <input
            type="tel"
            value={form.guide.phone}
            onChange={(e) => updateGuideField('phone', e.target.value)}
            className={inputClass('phone')}
            placeholder="99112233"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Автобусны дугаар <span className="text-slate-400 font-normal">(Заавал биш)</span>
        </label>
        <input
          type="text"
          value={form.busNumber}
          onChange={(e) => updateField('busNumber', e.target.value)}
          className={inputClass('busNumber')}
          placeholder="5678УНБ"
        />
      </div>

      {existingBooking && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Төлөв</label>
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as Booking['status'])}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary text-base"
          >
            <option value="pending">Хүлээгдэж буй</option>
            <option value="confirmed">Баталгаажсан</option>
            <option value="completed">Дууссан</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={editWindowExpired}
        className={`w-full font-semibold py-3 px-6 rounded-xl shadow-md transition-all text-lg tracking-wide ${
          editWindowExpired
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-accent hover:bg-accent-light text-white hover:shadow-lg active:scale-[0.98]'
        }`}
      >
        {existingBooking ? 'Шинэчлэх' : 'Хадгалах'}
      </button>
    </form>
  );
}
