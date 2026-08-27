export const LOCALES = ['en', 'es', 'fr'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

// Bandera de referencia visual para cada idioma en el selector — no
// implica una variante regional (el español del sitio es neutro, no de
// España en particular); es solo el ícono que la mayoría de los sitios
// usa para identificar el idioma de un vistazo.
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
