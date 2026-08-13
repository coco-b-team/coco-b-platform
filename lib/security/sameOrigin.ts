import type { NextRequest } from 'next/server';

// Evita que otros sitios llamen a nuestras rutas de API directamente desde
// el navegador de sus visitantes (y gasten cuota/recursos nuestros) — solo
// se acepta si el pedido viene de nuestra propia página.
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // pedidos sin Origin (ej. curl, apps nativas) no se bloquean acá
  return origin === req.nextUrl.origin;
}

export function getClientKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
