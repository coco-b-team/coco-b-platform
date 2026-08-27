'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { useLocale, useTranslations } from 'next-intl';

// Nombres de mes/día según el locale activo — antes eran arrays fijos en
// inglés. `weekdays` arranca en domingo (1970-01-04 es domingo) para que el
// orden coincida con `getDay()`, usado en el resto del componente.
function useCalendarLabels(locale: string) {
  return useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const monthNames = Array.from({ length: 12 }, (_, i) =>
      monthFormatter.format(new Date(2000, i, 1)),
    );
    const weekdays = Array.from({ length: 7 }, (_, i) =>
      weekdayFormatter.format(new Date(2000, 0, 2 + i)),
    );
    return { monthNames, weekdays };
  }, [locale]);
}

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

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

// No hay un PMS real conectado (Sirvoy quedó fuera del alcance de este
// hackathon) — estas son noches con una *solicitud* encima, no reservas
// confirmadas por el equipo. Ver lib/wp/availability.ts para el detalle de
// esa limitación. Si no hay `villaKey` (ej. otros usos futuros de este
// componente sin una villa puntual todavía), no se bloquea nada.
function useBookedDates(villaKey: string | undefined) {
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Sin villaKey no hay nada que traer — el estado ya arranca en un Set
    // vacío, no hace falta volver a setearlo.
    if (!villaKey) return;
    let cancelled = false;
    fetch(`/api/availability/${encodeURIComponent(villaKey)}`)
      .then((res) => (res.ok ? res.json() : { bookedDates: [] }))
      .then((data: { bookedDates?: string[] }) => {
        if (!cancelled) setBookedDates(new Set(data.bookedDates ?? []));
      })
      .catch(() => {
        // Falla silenciosa — mejor mostrar el calendario sin fechas
        // bloqueadas que romper el paso 1 de la reserva por esto.
        if (!cancelled) setBookedDates(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [villaKey]);

  return bookedDates;
}

type Range = { start: Date | null; end: Date | null };

function MonthGrid({
  monthDate,
  today,
  bookedDates,
  range,
  onSelect,
  monthNames,
  weekdays,
}: {
  monthDate: Date;
  today: Date;
  bookedDates: Set<string>;
  range: Range;
  onSelect: (date: Date) => void;
  monthNames: string[];
  weekdays: string[];
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
      <p className="text-center text-sm font-semibold tracking-wide capitalize">
        {monthNames[month]} {year}
      </p>
      <div className="text-text-muted mt-4 grid grid-cols-7 text-center text-xs">
        {weekdays.map((w, i) => (
          <div key={i} className="py-2 capitalize">
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
                  className={`bg-background-tint absolute inset-x-0 inset-y-1 ${
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
                    ? 'bg-primary text-background font-semibold'
                    : isDisabled
                      ? 'text-text-muted/40 cursor-not-allowed'
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

function GuestStepper({
  value,
  onChange,
  min = 1,
  max = 30,
  decreaseAriaLabel,
  increaseAriaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  decreaseAriaLabel: string;
  increaseAriaLabel: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={decreaseAriaLabel}
        className="border-border text-text flex h-9 w-9 items-center justify-center rounded-full border text-lg disabled:opacity-30"
      >
        −
      </button>
      <span className="w-6 text-center font-medium">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={increaseAriaLabel}
        className="border-border text-text flex h-9 w-9 items-center justify-center rounded-full border text-lg disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

export function DateRangePicker({
  villaKey,
  guestMax = 30,
  initialGuests = 2,
  onRangeChange,
  onGuestsChange,
}: {
  // Identifica de qué villa/paquete traer las fechas ya solicitadas (ver
  // useBookedDates). Sin esto, el calendario no bloquea ninguna fecha.
  villaKey?: string;
  guestMax?: number;
  initialGuests?: number;
  // Opcionales — solo las usa el modal de reserva, para saber si ya hay un
  // rango completo (habilitar "Next") y calcular el precio estimado. El
  // resto de los usos de este componente (ej. el formulario de paquetes)
  // no las necesita.
  onRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
  onGuestsChange?: (guests: number) => void;
}) {
  const t = useTranslations('dateRangePicker');
  const locale = useLocale();
  const { monthNames, weekdays } = useCalendarLabels(locale);
  const today = useMemo(() => startOfDay(new Date()), []);
  const bookedDates = useBookedDates(villaKey);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [range, setRange] = useState<Range>({ start: null, end: null });
  const [flexible, setFlexible] = useState(false);
  const [guests, setGuests] = useState(initialGuests);

  const secondMonth = addMonths(viewMonth, 1);
  const atEarliestMonth =
    viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();

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
      <p className="text-text text-sm font-medium">
        {range.start && !range.end ? t('checkOutDate') : t('checkInDate')}
      </p>

      <div className="border-border mt-3 rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            disabled={atEarliestMonth}
            aria-label={t('previousMonth')}
            className="text-text-muted hover:text-text flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label={t('nextMonth')}
            className="text-text-muted hover:text-text flex h-8 w-8 items-center justify-center rounded-full sm:hidden"
          >
            <FaChevronRight size={14} />
          </button>
          <div className="hidden flex-1 sm:block" />
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label={t('nextMonth')}
            className="text-text-muted hover:text-text hidden h-8 w-8 items-center justify-center rounded-full sm:flex"
          >
            <FaChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <MonthGrid
            monthDate={viewMonth}
            today={today}
            bookedDates={bookedDates}
            range={range}
            onSelect={handleSelect}
            monthNames={monthNames}
            weekdays={weekdays}
          />
          <div className="hidden sm:block">
            <MonthGrid
              monthDate={secondMonth}
              today={today}
              bookedDates={bookedDates}
              range={range}
              onSelect={handleSelect}
              monthNames={monthNames}
              weekdays={weekdays}
            />
          </div>
        </div>
      </div>

      <input type="hidden" name="check_in_date" value={range.start ? toISO(range.start) : ''} />
      <input type="hidden" name="check_out_date" value={range.end ? toISO(range.end) : ''} />

      <label className="mt-6 flex cursor-pointer items-center justify-between">
        <span className="text-text text-sm">{t('flexibleDates')}</span>
        <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
          <input
            type="checkbox"
            name="flexible_dates"
            checked={flexible}
            onChange={(e) => setFlexible(e.target.checked)}
            className="peer sr-only"
          />
          <span className="bg-border peer-checked:bg-primary absolute inset-0 rounded-full transition-colors" />
          <span className="bg-background absolute left-1 h-4 w-4 rounded-full transition-transform peer-checked:translate-x-5" />
        </span>
      </label>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-text text-sm font-medium">{t('numberOfGuests')}</p>
        <GuestStepper
          value={guests}
          onChange={handleGuestsChange}
          max={guestMax}
          decreaseAriaLabel={t('decreaseGuests')}
          increaseAriaLabel={t('increaseGuests')}
        />
      </div>
      <input type="hidden" name="guest_count" value={guests} />
    </div>
  );
}
