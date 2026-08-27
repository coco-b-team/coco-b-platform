'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

type NavItem = { href: string; title: string };

// Navegación "anterior/siguiente" al pie de una página de detalle (villa o
// paquete de Mix & Match) — separada a propósito del título de arriba, que
// antes tenía flechas pegadas al lado y generaba confusión con las
// miniaturas de la galería (esas sí cambian de foto, estas cambian de
// contenido). Circular: `prev`/`next` ya vienen resueltos con vuelta al
// principio/final por quien arma la lista navegable.
export function PrevNextNav({ prev, next }: { prev: NavItem | null; next: NavItem | null }) {
  const t = useTranslations('prevNext');
  if (!prev && !next) return null;

  // Con solo 2 elementos en la lista (ej. hoy solo hay 2 combinaciones de
  // Mix & Match), "anterior" y "siguiente" apuntan al mismo lugar — mostrar
  // las dos flechas ahí es redundante. En ese caso alcanza con un único
  // link centrado; con 3+ elementos vuelve a mostrarse el par de siempre.
  if (prev && next && prev.href === next.href) {
    return (
      <div className="mt-12 border-t border-border pt-8 text-center">
        <Link href={next.href} className="group inline-flex items-center gap-3">
          <span>
            <span className="block text-xs tracking-widest text-text-muted uppercase">{t('seeAlso')}</span>
            <span className="block font-medium text-text transition-colors group-hover:text-primary">
              {next.title}
            </span>
          </span>
          <FaChevronRight
            size={13}
            className="shrink-0 text-text-muted transition-colors group-hover:text-primary"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 flex items-stretch justify-between gap-6 border-t border-border pt-8">
      {prev ? (
        <Link href={prev.href} className="group flex min-w-0 items-center gap-3">
          <FaChevronLeft
            size={13}
            className="shrink-0 text-text-muted transition-colors group-hover:text-primary"
          />
          <span className="min-w-0">
            <span className="block text-xs tracking-widest text-text-muted uppercase">{t('previous')}</span>
            <span className="block truncate font-medium text-text transition-colors group-hover:text-primary">
              {prev.title}
            </span>
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link href={next.href} className="group flex min-w-0 items-center gap-3 text-right">
          <span className="min-w-0">
            <span className="block text-xs tracking-widest text-text-muted uppercase">{t('next')}</span>
            <span className="block truncate font-medium text-text transition-colors group-hover:text-primary">
              {next.title}
            </span>
          </span>
          <FaChevronRight
            size={13}
            className="shrink-0 text-text-muted transition-colors group-hover:text-primary"
          />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
