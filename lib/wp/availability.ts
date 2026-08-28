// Reservas por villa — cada solicitud queda como un registro propio (no solo
// una fecha marcada), con estado pendiente/confirmada y los datos del
// huésped. El panel de administración (/admin) lista estos registros y deja
// confirmarlos; el calendario público (DateRangePicker) pinta pendiente vs
// confirmada distinto, pero bloquea ambos por igual.
//
// No hay un PMS real conectado (Sirvoy quedó fuera del alcance de este
// hackathon) — "confirmada" acá significa que alguien del equipo la marcó
// como tal en /admin, no que hay una integración real con el sistema de
// reservas del hotel. Si el equipo rechaza una solicitud, ese registro queda
// igual como "pending" salvo que alguien lo libere a mano (no hay una acción
// de rechazo todavía).
//
// Mismo patrón de almacenamiento que lib/ai/rateLimit.ts: Vercel KV si está
// conectado (compartido de verdad entre instancias), con un respaldo en
// memoria si no.

import { randomUUID } from 'crypto';
import { nightsInRange } from '@/lib/villas';

export type ReservationStatus = 'pending' | 'confirmed';

export type Reservation = {
  id: string;
  villaKey: string;
  villaTitle: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const hasKv = Boolean(kvUrl && kvToken);

// Un año y medio — suficiente para cubrir cualquier reserva real, pero
// evita que el registro de una villa crezca para siempre si nadie la vuelve
// a consultar.
const RESERVATION_TTL_SECONDS = 60 * 60 * 24 * 545;

// Qué villas tienen al menos una reserva — así /admin puede armar la lista
// de villas sin tener que barrer todas las claves de KV.
const VILLA_KEYS_SET = 'reservation-villas';

const memoryReservations = new Map<string, Map<string, Reservation>>();
const memoryVillaKeys = new Set<string>();

function reservationsKey(villaKey: string): string {
  return `reservations:${villaKey}`;
}

async function kvPipeline(commands: (string | number)[][]): Promise<unknown[] | null> {
  if (!hasKv) return null;
  try {
    const res = await fetch(`${kvUrl}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown[];
  } catch (error) {
    console.error('[availability] no se pudo consultar Vercel KV', error);
    return null;
  }
}

export async function addReservation(input: {
  villaKey: string;
  villaTitle: string;
  checkIn: string;
  checkOut: string;
  firstName: string;
  lastName: string;
  email: string;
}): Promise<void> {
  const reservation: Reservation = {
    ...input,
    id: randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const key = reservationsKey(input.villaKey);
  const result = await kvPipeline([
    ['HSET', key, reservation.id, JSON.stringify(reservation)],
    ['EXPIRE', key, RESERVATION_TTL_SECONDS],
    ['SADD', VILLA_KEYS_SET, input.villaKey],
  ]);

  if (!result) {
    const map = memoryReservations.get(key) ?? new Map<string, Reservation>();
    map.set(reservation.id, reservation);
    memoryReservations.set(key, map);
    memoryVillaKeys.add(input.villaKey);
  }
}

export async function getReservations(villaKey: string): Promise<Reservation[]> {
  const key = reservationsKey(villaKey);
  const result = await kvPipeline([['HGETALL', key]]);

  if (result) {
    const [hgetall] = result as { result: string[] | null }[];
    const flat = hgetall.result ?? [];
    // La API REST de Upstash devuelve HGETALL como [campo, valor, campo,
    // valor, ...] en vez de un objeto — los valores quedan en los índices
    // impares.
    const reservations: Reservation[] = [];
    for (let i = 1; i < flat.length; i += 2) {
      try {
        reservations.push(JSON.parse(flat[i]) as Reservation);
      } catch {
        // Registro corrupto — se ignora en vez de romper toda la lista.
      }
    }
    return reservations;
  }

  return Array.from((memoryReservations.get(key) ?? new Map()).values());
}

export async function confirmReservation(villaKey: string, id: string): Promise<boolean> {
  const reservations = await getReservations(villaKey);
  const reservation = reservations.find((r) => r.id === id);
  if (!reservation) return false;

  reservation.status = 'confirmed';
  const key = reservationsKey(villaKey);
  const result = await kvPipeline([['HSET', key, id, JSON.stringify(reservation)]]);

  if (!result) {
    memoryReservations.get(key)?.set(id, reservation);
  }
  return true;
}

export async function getReservationVillaKeys(): Promise<string[]> {
  const result = await kvPipeline([['SMEMBERS', VILLA_KEYS_SET]]);
  if (result) {
    const [smembers] = result as { result: string[] }[];
    return smembers.result ?? [];
  }
  return Array.from(memoryVillaKeys);
}

export async function getAvailability(
  villaKey: string,
): Promise<{ pendingDates: string[]; confirmedDates: string[] }> {
  const reservations = await getReservations(villaKey);
  const pending = new Set<string>();
  const confirmed = new Set<string>();

  for (const reservation of reservations) {
    const target = reservation.status === 'confirmed' ? confirmed : pending;
    nightsInRange(reservation.checkIn, reservation.checkOut).forEach((night) => target.add(night));
  }

  return { pendingDates: Array.from(pending), confirmedDates: Array.from(confirmed) };
}
