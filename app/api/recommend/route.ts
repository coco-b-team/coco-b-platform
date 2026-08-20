import { NextRequest, NextResponse } from 'next/server';
import { getVillas } from '@/lib/wp/client';
import type { Villa } from '@/lib/wp/types';
import { isRateLimited } from '@/lib/ai/rateLimit';
import { isSameOrigin, getClientKey } from '@/lib/security/sameOrigin';
import { estimateGuestCapacity } from '@/lib/villas';

const SCOPE = 'recommend';

// No hace falta IA para esto — es una puntuación simple basada en los
// datos reales de las villas. No tiene que ser perfecta, solo funcionar
// de principio a fin (tal como pide el brief).
function scoreVilla(villa: Villa, groupSize: number, interest: string): number {
  const capacity = estimateGuestCapacity(villa.guestCapacity, villa.bedrooms) ?? 0;
  let score = 0;

  if (capacity >= groupSize) {
    score += 10;
  } else {
    score -= 20; // penaliza fuerte si el grupo no entra
  }
  score -= Math.abs(capacity - groupSize) * 0.3;

  if (villa.useCases?.includes(interest)) {
    score += 15;
  }

  return score;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  const clientKey = getClientKey(req);
  if (await isRateLimited(SCOPE, clientKey)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes en poco tiempo. Intenta de nuevo en unos minutos.' },
      { status: 429 },
    );
  }

  let body: { groupSize?: number; interest?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const { groupSize, interest } = body;
  if (typeof groupSize !== 'number' || !Number.isFinite(groupSize) || groupSize <= 0) {
    return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
  }
  if (typeof interest !== 'string' || interest.length === 0) {
    return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
  }

  const villas = await getVillas();
  const candidates = villas.filter((v) => v.showOnLanding);
  if (candidates.length === 0) {
    return NextResponse.json({ error: 'No hay villas disponibles en este momento.' }, { status: 404 });
  }

  const best = [...candidates].sort(
    (a, b) => scoreVilla(b, groupSize, interest) - scoreVilla(a, groupSize, interest),
  )[0];

  return NextResponse.json({ villa: best });
}
