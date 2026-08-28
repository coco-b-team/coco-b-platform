import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';

// Lo consulta el modal de login del navbar al abrirse — si ya hay sesión
// activa (ej. se entró antes y solo se salió a ver el sitio), se salta el
// formulario y va directo al panel en vez de pedir la contraseña de nuevo.
export async function GET() {
  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
}
