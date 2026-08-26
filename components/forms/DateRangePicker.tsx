'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function toISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

// No hay todavía una fuente real de disponibilidad conectada (ni
// WordPress ni HubSpot la modelan) — se simulan algunas fechas ya
// reservadas, relativas a hoy, para que el calendario se vea completo.
function useMockBookedDates() {
  return useMemo(() => {
    const today = startOfDay(new Date());
    return new Set([3, 4, 5, 14, 15, 22, 23].map((n) => toISO(addDays(today, n))));
  }, []);
}

type Range = { start: Date | null; end: Date | null };

function MonthGrid({
  monthDate,
  today,
  bookedDates,
  range,
  onSelect,
}: {
  monthDate: Date;
  today: Date;
  bookedDates: Set<string>;
  range: Range;
  onSelect: (date: Date) => void;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const leadingBlanks: (Date | null)[] = Array.from({ length: startWeekday }, () => null);
  const cells: (Date | null)[] = leadingBlanks.concat(
    Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  );

  return (
    <div>
      <p className="text-center text-sm font-semibold tracking-wide">
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="mt-4 grid grid-cols-7 text-center text-xs text-text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;

          const iso = toISO(date);
          const isDisabled = date < today || bookedDates.has(iso);
          const isStart = range.start ? iso === toISO(range.start) : false;
          const isEnd = range.end ? iso === toISO(range.end) : false;
          const inSpan = range.start && range.end && date >= range.start && date <= range.end;
          const isWeekStart = date.getDay() === 0;
          const isWeekEnd = date.getDay() === 6;

          return (
            <div key={i} className="relative flex h-10 items-center justify-center">
              {inSpan && (
                <div
                  className={`absolute inset-y-1 inset-x-0 bg-background-tint ${
                    isStart || isWeekStart ? 'rounded-l-full' : ''
                  } ${isEnd || isWeekEnd ? 'rounded-r-full' : ''}`}
                />
              )}
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => onSelect(date)}
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                  isStart || isEnd
                    ? 'bg-primary font-semibold text-background'
                    : isDisabled
                      ? 'cursor-not-allowed text-text-muted/40'
                      : 'text-text hover:bg-background-alt'
                }`}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GuestStepper({ value, onChange, min = 1, max = 30 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Menos huéspedes"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg text-text disabled:opacity-30"
      >
        −
      </button>
      <span className="w-6 text-center font-medium">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Más huéspedes"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg text-text disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

export function DateRangePicker({
  guestMax = 30,
  initialGuests = 2,
  onRangeChange,
  onGuestsChange,
}: {
  guestMax?: number;
  initialGuests?: number;
  // Opcionales — solo las usa el modal de reserva, para saber si ya hay un
  // rango completo (habilitar "Next") y calcular el precio estimado. El
  // resto de los usos de este componente (ej. el formulario de paquetes)
  // no las necesita.
  onRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
  onGuestsChange?: (guests: number) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const bookedDates = useMockBookedDates();
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [range, setRange] = useState<Range>({ start: null, end: null });
  const [flexible, setFlexible] = useState(false);
  const [guests, setGuests] = useState(initialGuests);

  const secondMonth = addMonths(viewMonth, 1);
  const atEarliestMonth = viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();

  function handleSelect(date: Date) {
    setRange((prev) =>
      !prev.start || (prev.start && prev.end)
        ? { start: date, end: null }
        : date <= prev.start
          ? { start: date, end: null }
          : { start: prev.start, end: date },
    );
  }

  function handleGuestsChange(next: number) {
    setGuests(next);
  }

  // Notificar al padre después de que el estado ya se actualizó acá adentro
  // — llamar el setState del padre desde dentro del updater de setRange
  // (mientras React todavía está procesando el render de este componente)
  // dispara "Cannot update a component while rendering a different
  // component"; con un efecto, se difiere al momento correcto.
  useEffect(() => {
    onRangeChange?.(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  useEffect(() => {
    onGuestsChange?.(guests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests]);

  return (
    <div>
      <p className="text-sm font-medium text-text">
        {range.start && !range.end ? 'Check-out date' : 'Check-in date'}
      </p>

      <div className="mt-3 rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            disabled={atEarliestMonth}
            aria-label="Mes anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text disabled:opacity-30"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="Mes siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text sm:hidden"
          >
            <FaChevronRight size={14} />
          </button>
          <div className="hidden flex-1 sm:block" />
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="Mes siguiente"
            className="hidden h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-text sm:flex"
          >
            <FaChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <MonthGrid monthDate={viewMonth} today={today} bookedDates={bookedDates} range={range} onSelect={handleSelect} />
          <div className="hidden sm:block">
            <MonthGrid monthDate={secondMonth} today={today} bookedDates={bookedDates} range={range} onSelect={handleSelect} />
          </div>
        </div>
      </div>

      <input type="hidden" name="check_in_date" value={range.start ? toISO(range.start) : ''} />
      <input type="hidden" name="check_out_date" value={range.end ? toISO(range.end) : ''} />

      <label className="mt-6 flex cursor-pointer items-center justify-between">
        <span className="text-sm text-text">Flexible dates?</span>
        <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
          <input
            type="checkbox"
            name="flexible_dates"
            checked={flexible}
            onChange={(e) => setFlexible(e.target.checked)}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full bg-border transition-colors peer-checked:bg-primary" />
          <span className="absolute left-1 h-4 w-4 rounded-full bg-background transition-transform peer-checked:translate-x-5" />
        </span>
      </label>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm font-medium text-text">Number of guests</p>
        <GuestStepper value={guests} onChange={handleGuestsChange} max={guestMax} />
      </div>
      <input type="hidden" name="guest_count" value={guests} />
    </div>
  );
}
