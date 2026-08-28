import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/ai/rateLimit';
import { getClientKey } from '@/lib/security/sameOrigin';
import { verifyAdminPassword, setAdminSessionCookie } from '@/lib/admin/auth';

const SCOPE = 'admin-login';

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  if (await isRateLimited(SCOPE, clientKey)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
      { status: 429 },
    );
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  if (!body.password || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
