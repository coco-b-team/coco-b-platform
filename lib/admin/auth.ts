import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

// Login simple de una sola contraseña compartida — a propósito, no un
// sistema de cuentas. Es un panel interno de un solo equipo chico, no algo
// que necesite usuarios individuales, roles ni recuperación de contraseña.
// La cookie de sesión es un HMAC fijo (no un token random guardado en
// ningún lado) — se valida recalculándolo y comparando, sin necesitar
// almacenamiento de sesiones.

const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function requireSecret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET no está configurado.');
  return value;
}

function sessionToken(): string {
  return createHmac('sha256', requireSecret()).update('admin-session').digest('hex');
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  return constantTimeEquals(password, expected);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return false;
  return constantTimeEquals(value, sessionToken());
}

export async function setAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
