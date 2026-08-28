import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { confirmReservation } from '@/lib/wp/availability';

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  let body: { villaKey?: string; id?: string };
  try {
    body = (await request.json()) as { villaKey?: string; id?: string };
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  if (!body.villaKey || !body.id) {
    return NextResponse.json({ error: 'Falta villaKey o id.' }, { status: 400 });
  }

  const confirmed = await confirmReservation(body.villaKey, body.id);
  if (!confirmed) {
    return NextResponse.json({ error: 'No se encontró la reserva.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
