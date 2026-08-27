import { NextRequest, NextResponse } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { generateChatReply, type ChatMessage } from '@/lib/ai/gemini';
import { buildSystemPrompt } from '@/lib/ai/systemPrompt';
import { isRateLimited, isGlobalRateLimited } from '@/lib/ai/rateLimit';
import { looksLikeInjectionAttempt } from '@/lib/ai/promptGuard';
import { getVillaSummaries, getVillas } from '@/lib/wp/client';
import { isSameOrigin, getClientKey } from '@/lib/security/sameOrigin';
import { findMentionedVilla } from '@/lib/villas';
import { LOCALE_LABELS, type Locale } from '@/lib/i18n/locales';

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 20;
const SCOPE = 'chat';

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

function localeHint(locale: Locale): string {
  if (locale === 'en') return '';
  const language = LOCALE_LABELS[locale];
  return `\n\nEl visitante tiene el sitio configurado en ${language} — priorizá responder en ese idioma salvo que escriba claramente en otro.`;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  const locale = (await getLocale()) as Locale;
  const tApiChat = await getTranslations('apiChat');

  const clientKey = getClientKey(req);
  if (await isRateLimited(SCOPE, clientKey)) {
    console.warn(`[chat] límite por persona alcanzado (${clientKey})`);
    return NextResponse.json({ reply: tApiChat('perIpLimit') }, { status: 429 });
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
    return NextResponse.json({ reply: tApiChat('deflection') });
  }

  // Cuota del sitio entero — protege la cuota gratuita de Gemini (muy
  // angosta) de agotarse entre varios visitantes normales a la vez, no
  // solo de un abuso puntual de una sola persona.
  if (await isGlobalRateLimited(SCOPE)) {
    console.warn('[chat] límite del sitio entero alcanzado');
    return NextResponse.json({ reply: tApiChat('globalLimit') }, { status: 429 });
  }

  try {
    // El prompt base (villas) se cachea 5 min compartido entre todos los
    // visitantes — el idioma NO se hornea ahí adentro (rompería con el
    // primer visitante quedando pegado para todos); se concatena acá,
    // por request, fuera de la parte cacheada.
    const systemInstruction = (await getSystemPrompt()) + localeHint(locale);
    const reply = await generateChatReply(systemInstruction, trimmedHistory);

    // Si la respuesta menciona a una sola villa por nombre, se le suma su
    // tarjeta (foto, specs, precio) — misma info que ya usa el
    // recomendador, solo que acá se dispara por texto libre en vez de un
    // flujo guiado.
    const villas = await getVillas();
    const mentionedVilla = findMentionedVilla(reply, villas);

    return NextResponse.json(mentionedVilla ? { reply, villa: mentionedVilla } : { reply });
  } catch (error) {
    console.error('[chat] error al generar respuesta', error);
    return NextResponse.json(
      { error: 'No pudimos responder en este momento. Intenta de nuevo en un rato.' },
      { status: 502 },
    );
  }
}
