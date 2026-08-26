import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/ai/rateLimit';
import { isSameOrigin, getClientKey } from '@/lib/security/sameOrigin';
import { isFormType } from '@/lib/hubspot/schemas';
import { validatePayload } from '@/lib/hubspot/validate';
import { verifyTurnstile } from '@/lib/hubspot/turnstile';
import { submitToHubSpot } from '@/lib/hubspot/submit';
import { sendConfirmationEmail } from '@/lib/email/confirmation';

type RouteContext = { params: Promise<{ formType: string }> };

const SCOPE = 'hubspot';

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  const clientKey = getClientKey(request);
  if (await isRateLimited(SCOPE, clientKey)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes en poco tiempo. Intenta de nuevo en unos minutos.' },
      { status: 429 },
    );
  }

  const { formType } = await params;
  if (!isFormType(formType)) {
    return NextResponse.json({ error: 'Formulario desconocido.' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  // Respuesta neutra para no enseñar a los bots que activaron el honeypot.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!(await verifyTurnstile(token, remoteIp))) {
    return NextResponse.json({ error: 'No pudimos verificar que seas una persona.' }, { status: 400 });
  }

  const { data, error } = validatePayload(formType, body.fields);
  if (!data) return NextResponse.json({ error }, { status: 422 });

  try {
    await submitToHubSpot(formType, data, {
      hutk: request.cookies.get('hubspotutk')?.value,
      pageUri: typeof body.pageUri === 'string' ? body.pageUri.slice(0, 500) : undefined,
      pageName: typeof body.pageName === 'string' ? body.pageName.slice(0, 200) : undefined,
    });

    try {
      await sendConfirmationEmail(formType, data);
    } catch (emailError) {
      // El registro ya quedó guardado en HubSpot; no hacemos fallar la solicitud.
      console.error(`[email] ${formType}`, emailError);
    }
    return NextResponse.json({ ok: true });
  } catch (submissionError) {
    console.error(`[hubspot] ${formType}`, submissionError);
    return NextResponse.json(
      { error: 'No pudimos enviar el formulario. Intenta nuevamente.' },
      { status: 502 },
    );
  }
}
