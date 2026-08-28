'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FaChevronDown, FaMagnifyingGlass } from 'react-icons/fa6';
import { COUNTRY_CODES, flagEmoji } from '@/lib/countryCodes';

// Reemplaza el <select> nativo del prefijo telefónico — con ~194 países,
// el picker nativo del navegador se renderiza como una lista sin estilo
// posible y se siente interminable. Este es el mismo patrón que
// LanguageSwitcher (botón + panel flotante), pero con buscador y alto
// acotado con scroll interno, ya que acá la lista sí es larga de verdad.
export function CountryCodeSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (iso2: string) => void;
  ariaLabel: string;
}) {
  const t = useTranslations('inquiryModal');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRY_CODES.find((c) => c.iso2 === value) ?? COUNTRY_CODES[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.iso2.toLowerCase() === q,
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    // Foco directo al buscador al abrir — evita un clic extra.
    const raf = requestAnimationFrame(() => searchRef.current?.focus());
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  function handleSelect(iso2: string) {
    onChange(iso2);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={ref} className="relative w-32 shrink-0 sm:w-36">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-expanded={open}
        className="border-border text-text focus:border-primary flex w-full items-center justify-between gap-1.5 truncate rounded-lg border px-3 py-2.5 focus:outline-none"
      >
        <span className="flex items-center gap-1.5 truncate">
          <span aria-hidden="true">{flagEmoji(selected.iso2)}</span>
          <span className="truncate text-sm">{selected.dial}</span>
        </span>
        <FaChevronDown
          size={9}
          className={`text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-border bg-background absolute top-full left-0 z-50 mt-2 w-72 overflow-hidden rounded-lg border shadow-lg">
          <div className="border-border flex items-center gap-2 border-b px-3 py-2.5">
            <FaMagnifyingGlass size={12} className="text-text-muted shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchCountryPlaceholder')}
              // text-base (no text-sm) a propósito — un <input> con
              // font-size menor a 16px hace que Safari/WebKit (incluido
              // Edge en iOS) haga zoom automático al enfocarlo en mobile.
              className="text-text placeholder:text-text-muted w-full text-base focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-text-muted px-4 py-3 text-sm">{t('noMatches')}</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => handleSelect(c.iso2)}
                  className={`hover:bg-background-tint flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                    c.iso2 === selected.iso2 ? 'text-primary font-semibold' : 'text-text'
                  }`}
                >
                  <span aria-hidden="true">{flagEmoji(c.iso2)}</span>
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="text-text-muted shrink-0">{c.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
