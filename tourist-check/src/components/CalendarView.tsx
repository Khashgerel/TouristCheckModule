'use client';

import { useState, useMemo } from 'react';
import type { Booking } from '@/lib/types';
import DailySummary from './DailySummary';
import { formatDate } from '@/lib/format';

const MONTHS_MN = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];
const DAYS_MN = ['Ням', 'Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям'];

const statusColors: Record<string, string> = {
  pending: 'bg-gold/10 border-gold/40 text-amber-800',
  confirmed: 'bg-primary/10 border-primary/40 text-primary-dark',
  completed: 'bg-slate-100 border-slate-300 text-slate-500',
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
      <div className="bg-white rounded-xl shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors text-sm font-medium"
          >
            Өмнөх
          </button>
          <h3 className="text-lg font-bold text-foreground tracking-wide">
            {currentYear} {MONTHS_MN[currentMonth]}
          </h3>
          <button
            onClick={nextMonth}
            className="px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary transition-colors text-sm font-medium"
          >
            Дараах
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS_MN.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted py-2">
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
                    ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                    : dayBookings.length > 0
                      ? 'border-border bg-primary/[0.02] hover:border-primary/30'
                      : 'border-transparent hover:bg-white/60'
                } ${isToday(day) ? 'font-bold' : ''}`}
              >
                <span
                  className={`text-xs ${isToday(day) ? 'bg-accent text-white w-5 h-5 flex items-center justify-center rounded-full' : ''}`}
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
        <div className="bg-white rounded-xl shadow-sm border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground">
              {selectedDate === todayStr ? 'Өнөөдөр' : formatDate(selectedDate)}
            </h3>
            <span className="text-sm text-muted">{selectedBookings.length} захиалга</span>
          </div>

          <DailySummary bookings={selectedBookings} />

          <div className="mt-3 space-y-2">
            {selectedBookings.length === 0 && (
              <p className="text-sm text-muted text-center py-4">Энэ өдөр захиалга байхгүй</p>
            )}
            {selectedBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-start justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onEdit?.(b)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{b.groupName}</span>
                    <span className="text-xs text-muted">|</span>
                    <span className="text-xs text-muted">{b.guideName}</span>
                    <span className="text-xs text-muted">|</span>
                    <span className="text-xs text-muted">{b.arrivalTime}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[b.status]}`}
                    >
                      {b.status === 'pending' ? 'Хүлээгдэж буй' : b.status === 'confirmed' ? 'Баталгаажсан' : 'Дууссан'}
                    </span>
                  </div>
                  <div className="text-xs text-muted flex gap-3 flex-wrap">
                    <span>Жуулчид: {b.maleTourists + b.femaleTourists}</span>
                    <span>♂{b.maleTourists} ♀{b.femaleTourists}</span>
                    <span>Бариа: ♂{b.saunaMale} ♀{b.saunaFemale}</span>
                  </div>
                  <div className="text-xs text-muted/70">
                    {b.guide.lastName} {b.guide.firstName} | {b.guide.phone} {b.busNumber ? `| Автобус: ${b.busNumber}` : ''}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(b);
                  }}
                  className="text-primary hover:text-primary-light text-sm font-medium shrink-0"
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
