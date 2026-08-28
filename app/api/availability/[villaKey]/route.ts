import { NextRequest, NextResponse } from 'next/server';
import { getAvailability } from '@/lib/wp/availability';

type RouteContext = { params: Promise<{ villaKey: string }> };

// Público y de solo lectura — son fechas de calendario, no datos sensibles.
// Sin esto el calendario de reserva no tiene forma de saber qué noches ya
// tienen una solicitud encima (ver lib/wp/availability.ts para las
// limitaciones reales de lo que "ocupado" significa acá).
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { villaKey } = await params;
  if (!villaKey) {
    return NextResponse.json({ error: 'Falta el identificador de la villa.' }, { status: 400 });
  }

  try {
    const availability = await getAvailability(villaKey);
    return NextResponse.json(availability);
  } catch (error) {
    console.error('[availability] error al leer fechas ocupadas', error);
    return NextResponse.json({ pendingDates: [], confirmedDates: [] });
  }
}
