'use client';

import { useState, useMemo } from 'react';
import type { Booking } from '@/lib/types';
import DailySummary from './DailySummary';
import { formatDate } from '@/lib/format';

const MONTHS_MN = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
const DAYS_MN = ['Ням', 'Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям'];

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 border-amber-400 text-amber-800',
  confirmed: 'bg-emerald-100 border-emerald-400 text-emerald-800',
  completed: 'bg-slate-100 border-slate-400 text-slate-600',
};

interface Props {
  bookings: Booking[];
  onEdit?: (booking: Booking) => void;
}

export default function CalendarView({ bookings, onEdit }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((b) => {
      const existing = map.get(b.arrivalDate) || [];
      existing.push(b);
      map.set(b.arrivalDate, existing);
    });
    return map;
  }, [bookings]);

  const selectedBookings = selectedDate ? bookingMap.get(selectedDate) || [] : [];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const dayToStr = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number) => {
    const d = new Date();
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
  };

  const todayStr = dayToStr(today.getDate());

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-sm font-medium"
          >
            ← Өмнөх
          </button>
          <h3 className="text-lg font-bold text-slate-800">
            {currentYear} {MONTHS_MN[currentMonth]}
          </h3>
          <button
            onClick={nextMonth}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-sm font-medium"
          >
            Дараах →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS_MN.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">
              {d}
            </div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = dayToStr(day);
            const dayBookings = bookingMap.get(dateStr) || [];
            const isSel = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSel ? null : dateStr)}
                className={`relative min-h-[60px] p-1 rounded-lg border text-left transition-all text-sm ${
                  isSel
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                    : dayBookings.length > 0
                      ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300'
                      : 'border-transparent hover:bg-slate-50'
                } ${isToday(day) ? 'font-bold' : ''}`}
              >
                <span
                  className={`text-xs ${isToday(day) ? 'bg-emerald-600 text-white w-5 h-5 flex items-center justify-center rounded-full' : ''}`}
                >
                  {day}
                </span>
                {dayBookings.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className={`text-[10px] leading-tight px-1 py-0.5 rounded border ${statusColors[b.status]}`}
                      >
                        {b.arrivalTime.slice(0, 5)} {b.maleTourists + b.femaleTourists}хүн
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-[10px] text-slate-400">+{dayBookings.length - 2} илүү</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800">
              {selectedDate === todayStr ? 'Өнөөдөр' : formatDate(selectedDate)}
            </h3>
            <span className="text-sm text-slate-500">{selectedBookings.length} захиалга</span>
          </div>

          <DailySummary bookings={selectedBookings} />

          <div className="mt-3 space-y-2">
            {selectedBookings.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Энэ өдөр захиалга байхгүй</p>
            )}
            {selectedBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer"
                onClick={() => onEdit?.(b)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-800">{b.groupName}</span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-500">{b.guideName}</span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-500">{b.arrivalTime}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[b.status]}`}
                    >
                      {b.status === 'pending' ? 'Хүлээгдэж буй' : b.status === 'confirmed' ? 'Баталгаажсан' : 'Дууссан'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex gap-3 flex-wrap">
                    <span>Жуулчид: {b.maleTourists + b.femaleTourists}</span>
                    <span>♂{b.maleTourists} ♀{b.femaleTourists}</span>
                    <span>Бариа: ♂{b.saunaMale} ♀{b.saunaFemale}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {b.guide.lastName} {b.guide.firstName} | {b.guide.phone} {b.busNumber ? `| Автобус: ${b.busNumber}` : ''}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(b);
                  }}
                  className="text-emerald-600 hover:text-emerald-500 text-sm font-medium shrink-0"
                >
                  Засах
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
