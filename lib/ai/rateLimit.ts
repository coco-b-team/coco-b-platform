// Límite de uso del chat, con dos capas:
//  1. Por persona (IP) — evita que alguien agote la cuota escribiendo sin parar.
//  2. Del sitio entero — evita que la cuota gratuita de Gemini (muy angosta,
//     ver Progreso_Proyecto.md punto 42) se agote entre varios visitantes
//     normales usando el chat casi al mismo tiempo, sin que nadie ataque nada.
//
// Si el proyecto tiene una base de datos Vercel KV conectada (variables
// KV_REST_API_URL / KV_REST_API_TOKEN), el conteo se guarda ahí — compartido
// de verdad entre todas las instancias del servidor, y no se puede evadir
// solo falsificando la IP. Si no está configurada, se usa un conteo en
// memoria como respaldo (funciona para desarrollo local, pero cada
// instancia de Vercel en producción tendría su propio conteo separado).

const PER_IP_WINDOW_SECONDS = 10 * 60; // 10 minutos
const PER_IP_MAX_REQUESTS = 15;

const GLOBAL_WINDOW_SECONDS = 60; // 1 minuto
const GLOBAL_MAX_REQUESTS = 15; // por debajo del límite real de Gemini (20), a modo de colchón

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const hasKv = Boolean(kvUrl && kvToken);

async function incrementInKv(key: string, windowSeconds: number): Promise<number | null> {
  if (!hasKv) return null;
  try {
    const res = await fetch(`${kvUrl}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, windowSeconds],
      ]),
    });
    if (!res.ok) return null;
    const [incrResult] = (await res.json()) as { result: number }[];
    return incrResult.result;
  } catch (error) {
    console.error('[rateLimit] no se pudo consultar Vercel KV, usando respaldo en memoria', error);
    return null;
  }
}

const memoryHits = new Map<string, number[]>();

function incrementInMemory(key: string, windowSeconds: number): number {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = (memoryHits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  memoryHits.set(key, timestamps);
  return timestamps.length;
}

async function checkLimit(key: string, windowSeconds: number, maxRequests: number): Promise<boolean> {
  const kvCount = await incrementInKv(key, windowSeconds);
  const count = kvCount ?? incrementInMemory(key, windowSeconds);
  return count > maxRequests;
}

// `scope` separa los contadores de distintas rutas (ej. "chat" vs
// "recommend") para que no compartan el mismo balde — cada una tiene su
// propio límite, aunque usen la misma lógica por debajo.
export function isRateLimited(scope: string, ipKey: string): Promise<boolean> {
  return checkLimit(`${scope}:ip:${ipKey}`, PER_IP_WINDOW_SECONDS, PER_IP_MAX_REQUESTS);
}

export function isGlobalRateLimited(scope: string): Promise<boolean> {
  return checkLimit(`${scope}:global`, GLOBAL_WINDOW_SECONDS, GLOBAL_MAX_REQUESTS);
}
