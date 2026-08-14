import { NextRequest, NextResponse } from 'next/server';
import { generateChatReply, type ChatMessage } from '@/lib/ai/gemini';
import { buildSystemPrompt } from '@/lib/ai/systemPrompt';
import { isRateLimited, isGlobalRateLimited } from '@/lib/ai/rateLimit';
import { looksLikeInjectionAttempt } from '@/lib/ai/promptGuard';
import { getVillaSummaries } from '@/lib/wp/client';
import { isSameOrigin, getClientKey } from '@/lib/security/sameOrigin';

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 20;
const SCOPE = 'chat';

const DEFLECTION_REPLY =
  'Estoy aquí para ayudarte con todo lo relacionado a tu estadía en Coco B Isla. ¿Tienes alguna pregunta sobre nuestras villas?';

const PER_IP_LIMIT_REPLY =
  'Vamos con calma — dame un momento para tomar aire. Escríbeme de nuevo en unos minutos y seguimos con gusto.';

const GLOBAL_LIMIT_REPLY =
  'Tengo bastante gente conmigo en este momento. Dame un respiro, ya regreso — intenta de nuevo en un minuto.';

// El system prompt es el mismo para todos los usuarios — se arma una vez y
// se reusa por unos minutos en vez de reconstruirlo en cada mensaje.
const SYSTEM_PROMPT_TTL_MS = 5 * 60 * 1000;
let cachedSystemPrompt: { value: string; expiresAt: number } | null = null;

async function getSystemPrompt(): Promise<string> {
  if (cachedSystemPrompt && cachedSystemPrompt.expiresAt > Date.now()) {
    return cachedSystemPrompt.value;
  }
  const villas = await getVillaSummaries();
  const value = buildSystemPrompt(villas);
  cachedSystemPrompt = { value, expiresAt: Date.now() + SYSTEM_PROMPT_TTL_MS };
  return value;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  const clientKey = getClientKey(req);
  if (await isRateLimited(SCOPE, clientKey)) {
    console.warn(`[chat] límite por persona alcanzado (${clientKey})`);
    return NextResponse.json({ reply: PER_IP_LIMIT_REPLY }, { status: 429 });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Falta el mensaje.' }, { status: 400 });
  }

  const trimmedHistory = messages.slice(-MAX_HISTORY);
  const lastMessage = trimmedHistory[trimmedHistory.length - 1];
  if (!lastMessage || lastMessage.content.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Mensaje demasiado largo.' }, { status: 400 });
  }

  // Filtro barato: si el mensaje intenta manipular al asistente de forma
  // obvia, respondemos sin gastar una llamada a Gemini.
  if (looksLikeInjectionAttempt(lastMessage.content)) {
    return NextResponse.json({ reply: DEFLECTION_REPLY });
  }

  // Cuota del sitio entero — protege la cuota gratuita de Gemini (muy
  // angosta) de agotarse entre varios visitantes normales a la vez, no
  // solo de un abuso puntual de una sola persona.
  if (await isGlobalRateLimited(SCOPE)) {
    console.warn('[chat] límite del sitio entero alcanzado');
    return NextResponse.json({ reply: GLOBAL_LIMIT_REPLY }, { status: 429 });
  }

  try {
    const systemInstruction = await getSystemPrompt();
    const reply = await generateChatReply(systemInstruction, trimmedHistory);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[chat] error al generar respuesta', error);
    return NextResponse.json(
      { error: 'No pudimos responder en este momento. Intenta de nuevo en un rato.' },
      { status: 502 },
    );
  }
}
