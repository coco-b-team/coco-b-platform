'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FaChevronDown } from 'react-icons/fa6';
import { setLocale } from '@/lib/i18n/actions';
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from '@/lib/i18n/locales';

// Selector chico y discreto — mismo lenguaje visual que el resto del sitio
// (línea fina, mayúsculas separadas, sin color de fondo llamativo). El
// nombre de cada idioma se muestra siempre en su propia lengua ("Français"
// se lee igual sin importar el idioma activo del sitio), así que no hace
// falta traducirlos — solo el aria-label del botón cambia con el locale.
export function LanguageSwitcher({
  className = '',
  dropUp = false,
}: {
  className?: string;
  // El drawer de MobileNav lo apoya en el pie de una hoja a pantalla
  // completa — abrir hacia abajo ahí lo mandaría fuera de la pantalla.
  dropUp?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations('languageSwitcher');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function handleSelect(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('label')}
        aria-expanded={open}
        disabled={isPending}
        className="text-text hover:text-primary flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase transition-colors disabled:opacity-50"
      >
        <span aria-hidden="true">{LOCALE_FLAGS[locale]}</span>
        {locale}
        <FaChevronDown size={9} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`border-border bg-background absolute right-0 z-50 min-w-36 overflow-hidden rounded-lg border shadow-lg ${
            dropUp ? 'bottom-full mb-3' : 'top-full mt-3'
          }`}
        >
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className={`hover:bg-background-tint flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                code === locale ? 'text-primary font-semibold' : 'text-text'
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {LOCALE_FLAGS[code]}
              </span>
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
