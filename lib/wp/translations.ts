import { getLocale } from 'next-intl/server';
import { type Locale } from '@/lib/i18n/locales';
import es from '@/content-translations/es.json';
import fr from '@/content-translations/fr.json';

// Traducciones fijas (no automáticas) del contenido real de WordPress —
// alguien tradujo el contenido en inglés con su propia IA y pegó el
// resultado acá. No se re-traducen solas si el contenido cambia en
// WordPress; hay que repetir el proceso manual y actualizar estos
// archivos. Ver coco-b-platform-docs/Traduccion_WordPress_Instrucciones.md.
const CONTENT_TRANSLATIONS = { es, fr };

type TranslatableLocale = keyof typeof CONTENT_TRANSLATIONS;

function isTranslatable(locale: Locale): locale is TranslatableLocale {
  return locale in CONTENT_TRANSLATIONS;
}

// Server Components/Route Handlers ya resuelven el locale una vez por
// request (memoizado por next-intl) — esto solo reusa ese mismo valor.
export async function getContentLocale(): Promise<TranslatableLocale | null> {
  const locale = (await getLocale()) as Locale;
  return isTranslatable(locale) ? locale : null;
}

// Los tipos exactos del JSON los infiere TS solo (resolveJsonModule) — acá
// solo se necesita la forma general para poder indexar por slug/id.
type Dict = Record<string, unknown>;

// Para casos que no calzan con el patrón overlay*() de arriba (ej.
// VillaSummary, que no carga `slug` en su tipo público pero sí necesita
// buscar su traducción por el slug del post original).
export function getTranslatedList(
  locale: TranslatableLocale | null,
  contentType: keyof (typeof CONTENT_TRANSLATIONS)['es'],
): (Dict & { slug?: string; id?: number })[] {
  if (!locale) return [];
  const list = CONTENT_TRANSLATIONS[locale][contentType];
  return Array.isArray(list) ? (list as (Dict & { slug?: string; id?: number })[]) : [];
}

export function overlaySlug<T extends { slug: string }>(
  item: T,
  locale: TranslatableLocale | null,
  contentType: keyof (typeof CONTENT_TRANSLATIONS)['es'],
): T {
  if (!locale) return item;
  const list = CONTENT_TRANSLATIONS[locale][contentType] as unknown as
    (Dict & { slug: string })[] | undefined;
  const match = list?.find((entry) => entry.slug === item.slug);
  return match ? { ...item, ...match } : item;
}

export function overlayId<T extends { id: number }>(
  item: T,
  locale: TranslatableLocale | null,
  contentType: keyof (typeof CONTENT_TRANSLATIONS)['es'],
): T {
  if (!locale) return item;
  const list = CONTENT_TRANSLATIONS[locale][contentType] as unknown as
    (Dict & { id: number })[] | undefined;
  const match = list?.find((entry) => entry.id === item.id);
  return match ? { ...item, ...match } : item;
}

export function overlaySingleton<T extends Dict>(
  item: T,
  locale: TranslatableLocale | null,
  contentType: 'hero' | 'siteLocation' | 'about',
): T {
  if (!locale) return item;
  const translated = CONTENT_TRANSLATIONS[locale][contentType] as unknown as Partial<T> | undefined;
  return translated ? { ...item, ...translated } : item;
}
