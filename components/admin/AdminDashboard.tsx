'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowRightFromBracket,
  FaHouse,
  FaCheck,
} from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { nightsInRange } from '@/lib/villas';
import type { Reservation } from '@/lib/wp/availability';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function toISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function MiniCalendar({
  monthDate,
  pending,
  confirmed,
  highlighted,
}: {
  monthDate: Date;
  pending: Set<string>;
  confirmed: Set<string>;
  highlighted: Set<string>;
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
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="text-text-muted mt-4 grid grid-cols-7 text-center text-xs">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="h-9" />;
          const iso = toISO(date);
          const isPending = pending.has(iso);
          const isConfirmed = confirmed.has(iso);
          const isHighlighted = highlighted.has(iso);
          return (
            <div key={i} className="flex h-9 items-center justify-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-shadow ${
                  isConfirmed
                    ? 'bg-border/60 text-text-muted'
                    : isPending
                      ? 'bg-accent/40 text-text'
                      : 'text-text-muted'
                } ${isHighlighted ? 'ring-primary ring-2 ring-offset-2' : ''}`}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminDashboard({ initialReservations }: { initialReservations: Reservation[] }) {
  const router = useRouter();
  const [reservations, setReservations] = useState(initialReservations);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [hoveredReservationId, setHoveredReservationId] = useState<string | null>(null);

  const villas = useMemo(() => {
    const map = new Map<string, string>();
    reservations.forEach((r) => map.set(r.villaKey, r.villaTitle));
    return Array.from(map.entries());
  }, [reservations]);

  const [selectedVilla, setSelectedVilla] = useState(villas[0]?.[0] ?? '');
  const activeVilla = selectedVilla || villas[0]?.[0] || '';

  const villaReservations = reservations
    .filter((r) => r.villaKey === activeVilla)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const pendingList = villaReservations.filter((r) => r.status === 'pending');
  const confirmedList = villaReservations.filter((r) => r.status === 'confirmed');

  const pendingDates = useMemo(() => {
    const set = new Set<string>();
    pendingList.forEach((r) => nightsInRange(r.checkIn, r.checkOut).forEach((n) => set.add(n)));
    return set;
  }, [pendingList]);
  const confirmedDates = useMemo(() => {
    const set = new Set<string>();
    confirmedList.forEach((r) => nightsInRange(r.checkIn, r.checkOut).forEach((n) => set.add(n)));
    return set;
  }, [confirmedList]);

  // Días de la reserva sobre la que está el mouse en este momento — para
  // marcarlos aparte en el calendario cuando hay varias reservas
  // superpuestas o cercanas y no se distingue de quién es cada una.
  const highlightedDates = useMemo(() => {
    const hovered = villaReservations.find((r) => r.id === hoveredReservationId);
    if (!hovered) return new Set<string>();
    return new Set(nightsInRange(hovered.checkIn, hovered.checkOut));
  }, [hoveredReservationId, villaReservations]);

  async function handleConfirm(reservation: Reservation) {
    setConfirmingId(reservation.id);
    try {
      const response = await fetch('/api/admin/reservations/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ villaKey: reservation.villaKey, id: reservation.id }),
      });
      if (response.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === reservation.id ? { ...r, status: 'confirmed' } : r)),
        );
      }
    } finally {
      setConfirmingId(null);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    // Directo al home en vez de /admin/login (esa página sirve solo como
    // respaldo si alguien entra a /admin de forma directa) — mismo salto
    // del splash que "Ver sitio", para no repetir la intro completa acá.
    sessionStorage.setItem('coco-b-skip-splash', '1');
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo width={110} height={21} alt="Coco B Isla" />
          <span className="text-text-muted text-xs font-medium tracking-widest uppercase">
            Panel de reservas
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/"
            onClick={() => sessionStorage.setItem('coco-b-skip-splash', '1')}
            className="text-text-muted hover:text-text flex items-center gap-2 text-sm"
          >
            <FaHouse size={12} />
            Ver sitio
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-text-muted hover:text-text flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <FaArrowRightFromBracket size={13} />
            Salir
          </button>
        </div>
      </div>

      {villas.length === 0 ? (
        <div className="border-border bg-background mt-8 rounded-2xl border p-10 text-center">
          <p className="text-text-muted">Todavía no hay solicitudes de reserva.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap gap-2">
            {villas.map(([key, title]) => (
              <button
                key={key}
                onClick={() => setSelectedVilla(key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  activeVilla === key
                    ? 'bg-primary border-primary text-background'
                    : 'border-border text-text hover:bg-background-alt'
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-[320px_1fr]">
            <div className="border-border bg-background mx-auto h-fit w-full max-w-sm rounded-2xl border p-6 md:mx-0 md:max-w-none">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setViewMonth((m) => addMonths(m, -1))}
                  aria-label="Mes anterior"
                  className="text-text-muted hover:text-text flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setViewMonth((m) => addMonths(m, 1))}
                  aria-label="Mes siguiente"
                  className="text-text-muted hover:text-text flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
              <MiniCalendar
                monthDate={viewMonth}
                pending={pendingDates}
                confirmed={confirmedDates}
                highlighted={highlightedDates}
              />

              <div className="border-border mt-4 flex flex-col gap-2 border-t pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-accent/40 h-3 w-3 rounded-full" />
                  <span className="text-text-muted">Pendiente de confirmar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-border/60 h-3 w-3 rounded-full" />
                  <span className="text-text-muted">Confirmada</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <p className="text-text text-sm font-semibold tracking-wide uppercase">
                  Pendientes {pendingList.length > 0 && `(${pendingList.length})`}
                </p>
                {pendingList.length === 0 ? (
                  <p className="text-text-muted mt-3 text-sm">No hay solicitudes pendientes.</p>
                ) : (
                  <div className="mt-3 flex flex-col gap-3">
                    {pendingList.map((reservation) => (
                      <div
                        key={reservation.id}
                        tabIndex={0}
                        onMouseEnter={() => setHoveredReservationId(reservation.id)}
                        onMouseLeave={() => setHoveredReservationId(null)}
                        onFocus={() => setHoveredReservationId(reservation.id)}
                        onBlur={() => setHoveredReservationId(null)}
                        className={`bg-background focus-visible:ring-primary flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition-colors focus:outline-none focus-visible:ring-2 ${
                          hoveredReservationId === reservation.id
                            ? 'border-primary'
                            : 'border-border'
                        }`}
                      >
                        <div>
                          <p className="text-text font-medium">
                            {reservation.firstName} {reservation.lastName}
                          </p>
                          <p className="text-text-muted text-sm">{reservation.email}</p>
                          <p className="text-text-muted mt-1 text-sm">
                            {formatDate(reservation.checkIn)} – {formatDate(reservation.checkOut)}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => handleConfirm(reservation)}
                          disabled={confirmingId === reservation.id}
                          className="disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {confirmingId === reservation.id ? 'Confirmando…' : 'Confirmar'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {confirmedList.length > 0 && (
                <div>
                  <p className="text-text text-sm font-semibold tracking-wide uppercase">
                    Confirmadas ({confirmedList.length})
                  </p>
                  <div className="mt-3 flex flex-col gap-3">
                    {confirmedList.map((reservation) => (
                      <div
                        key={reservation.id}
                        onMouseEnter={() => setHoveredReservationId(reservation.id)}
                        onMouseLeave={() => setHoveredReservationId(null)}
                        className={`bg-background-alt flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
                          hoveredReservationId === reservation.id
                            ? 'border-primary'
                            : 'border-border'
                        }`}
                      >
                        <div>
                          <p className="text-text font-medium">
                            {reservation.firstName} {reservation.lastName}
                          </p>
                          <p className="text-text-muted text-sm">{reservation.email}</p>
                          <p className="text-text-muted mt-1 text-sm">
                            {formatDate(reservation.checkIn)} – {formatDate(reservation.checkOut)}
                          </p>
                        </div>
                        <span className="text-primary flex items-center gap-1.5 text-sm font-medium">
                          <FaCheck size={12} />
                          Confirmada
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
