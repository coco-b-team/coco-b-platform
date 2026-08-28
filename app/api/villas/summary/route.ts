import { NextRequest, NextResponse } from 'next/server';
import { getVillas } from '@/lib/wp/client';
import { isSameOrigin } from '@/lib/security/sameOrigin';

// Respuesta predefinida del chat ("Ver villas") — datos reales de WP, sin
// pasar por Gemini. No hace falta rate limit acá: es la misma información
// pública que ya se sirve sin límite en /villas.
export async function GET(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  const villas = await getVillas();
  return NextResponse.json({ villas: villas.filter((v) => v.showOnLanding) });
}
