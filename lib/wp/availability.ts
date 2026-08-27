// Fechas bloqueadas por *solicitudes* de reserva (no confirmadas) — no hay
// PMS real conectado (Sirvoy quedó fuera del alcance de este hackathon, ver
// Progreso_Proyecto.md), así que esto no refleja disponibilidad real: cada
// vez que alguien envía el formulario de "Inquire" para una villa/paquete,
// esas fechas quedan marcadas como ocupadas para el resto de los
// visitantes, aunque el equipo nunca haya confirmado esa reserva. Si el
// equipo rechaza una solicitud, esas fechas van a seguir bloqueadas salvo
// que alguien las libere a mano (no hay forma automática hoy).
//
// Mismo patrón de almacenamiento que lib/ai/rateLimit.ts: Vercel KV si está
// conectado (compartido de verdad entre instancias), con un respaldo en
// memoria si no.

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const hasKv = Boolean(kvUrl && kvToken);

// Un año y medio — suficiente para cubrir cualquier reserva real, pero
// evita que el set de una villa crezca para siempre si nadie la vuelve a
// consultar.
const BOOKED_TTL_SECONDS = 60 * 60 * 24 * 545;

const memoryBookedDates = new Map<string, Set<string>>();

function storageKey(villaKey: string): string {
  return `booked:${villaKey}`;
}

// Todas las noches entre check-in (incluido) y check-out (excluido) — el
// día de check-out no cuenta como noche ocupada, mismo criterio que usa
// nightsBetween() en InquiryModal.
function nightsInRange(checkIn: string, checkOut: string): string[] {
  const nights: string[] = [];
  let cursor = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  while (cursor < end) {
    nights.push(cursor.toISOString().slice(0, 10));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return nights;
}

async function kvPipeline(commands: (string | number)[][]): Promise<unknown[] | null> {
  if (!hasKv) return null;
  try {
    const res = await fetch(`${kvUrl}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown[];
  } catch (error) {
    console.error('[availability] no se pudo consultar Vercel KV', error);
    return null;
  }
}

export async function addBookedRange(
  villaKey: string,
  checkIn: string,
  checkOut: string,
): Promise<void> {
  const nights = nightsInRange(checkIn, checkOut);
  if (nights.length === 0) return;

  const key = storageKey(villaKey);
  const commands: (string | number)[][] = nights.map((night) => ['SADD', key, night]);
  commands.push(['EXPIRE', key, BOOKED_TTL_SECONDS]);
  const result = await kvPipeline(commands);

  if (!result) {
    // Vercel KV no está configurado o falló — se guarda igual en memoria
    // para que al menos esta instancia del servidor lo recuerde.
    const set = memoryBookedDates.get(key) ?? new Set<string>();
    nights.forEach((night) => set.add(night));
    memoryBookedDates.set(key, set);
  }
}

export async function getBookedDates(villaKey: string): Promise<string[]> {
  const key = storageKey(villaKey);
  const result = await kvPipeline([['SMEMBERS', key]]);

  if (result) {
    const [smembers] = result as { result: string[] }[];
    return smembers.result ?? [];
  }

  return Array.from(memoryBookedDates.get(key) ?? []);
}
