import type { Villa } from '@/lib/wp/types';

// Varias villas todavía no tienen guest_capacity cargado en WordPress —
// mientras tanto, se estima a partir de las habitaciones (2 huéspedes por
// habitación). Compartido entre VillaSpecs y el cálculo de paquetes
// combinados, para no tener la misma fórmula en dos lugares.
export function estimateGuestCapacity(guestCapacity: number | null, bedrooms: number | null): number | null {
  return guestCapacity ?? (bedrooms ? bedrooms * 2 : null);
}

// Fotos e imagen principal ya vienen sin duplicados desde lib/wp/client.ts —
// compartido entre la card del home, la vista de detalle y la ficha rápida
// mobile/tablet, para no repetir el mismo `.filter(Boolean)` en cada lugar.
export function villaImages(villa: Villa): string[] {
  return [villa.mainImage, ...villa.gallery].filter((url): url is string => Boolean(url));
}

export function formatVillaPrice(villa: Villa): string {
  if (villa.priceOnRequest || !villa.startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(villa.startingPrice);
  return `From $${price}/${villa.priceUnit || 'night'} + taxes`;
}

export function formatPackagePrice(startingPrice: number | null): string {
  if (!startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(startingPrice);
  return `From $${price}/night + taxes`;
}

// "Casa Lola" -> "Lola" — compartido entre las flechas prev/next de la
// página de detalle y la detección de qué villa menciona el chat de IA.
export function shortVillaName(title: string): string {
  return title.replace(/^(Casa|Villa)\s+/i, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Detecta si una respuesta de texto libre del chat menciona a UNA sola
// villa por su nombre (completo o corto, ej. "Coco" además de "Casa
// Coco") — así se le puede sumar la tarjeta de esa villa a la respuesta.
// Si menciona más de una (ej. comparando dos villas) no se muestra
// ninguna tarjeta, para no tener que resolver cuál mostrar primero.
//
// "Coco B Isla" (el nombre de la marca, presente en casi cualquier
// respuesta del concierge) contiene la palabra suelta "Coco" — el mismo
// nombre corto de la villa "Casa Coco". Sin esto, prácticamente toda
// respuesta terminaba mostrando por error la tarjeta de esa villa. Se
// quita la mención de la marca del texto antes de buscar coincidencias.
const BRAND_NAME_PATTERN = /\bCoco B Isla\b/gi;

export function findMentionedVilla(text: string, villas: Villa[]): Villa | null {
  const textWithoutBrand = text.replace(BRAND_NAME_PATTERN, '');
  const matches = villas.filter((v) => {
    const names = [v.title, shortVillaName(v.title)].map(escapeRegExp);
    const pattern = new RegExp(`\\b(${names.join('|')})\\b`, 'i');
    return pattern.test(textWithoutBrand);
  });
  const uniqueIds = new Set(matches.map((v) => v.id));
  return uniqueIds.size === 1 ? matches[0] : null;
}

// Las cifras de un paquete combinado se calculan en vivo a partir del dato
// real de cada villa relacionada, en vez de guardarse fijas — así no se
// desactualizan cuando cambia un dato de alguna de las villas.
export function computeComboSpecs(relatedVillas: Villa[]) {
  return {
    guestCapacity: relatedVillas.reduce(
      (sum, v) => sum + (estimateGuestCapacity(v.guestCapacity, v.bedrooms) ?? 0),
      0,
    ),
    bedrooms: relatedVillas.reduce((sum, v) => sum + (v.bedrooms ?? 0), 0),
    bathrooms: relatedVillas.reduce((sum, v) => sum + (v.bathrooms ?? 0), 0),
  };
}
