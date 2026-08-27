'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { NAV_LINKS } from '@/lib/navLinks';

// Menú hamburguesa para mobile/tablet — el sitio no tiene navegación
// tradicional en desktop (es una landing de una sola página, decisión ya
// tomada al construir el Header), así que este menú vive aparte y solo se
// muestra por debajo de `lg`.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const t = useTranslations('nav');

  useEffect(() => {
    if (!open) return;

    const raf = requestAnimationFrame(() => setVisible(true));

    // Compensar el ancho de la scrollbar al bloquear el scroll del body,
    // mismo motivo que en la ficha rápida de villas (ReadMoreButton): sin
    // esto, el contenido del home se corre al abrir/cerrar el menú.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleClose() {
    setVisible(false);
    setTimeout(() => setOpen(false), 300);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t('openMenu')}
        className="text-text flex h-10 w-10 items-center justify-center lg:hidden"
      >
        <FaBars size={20} />
      </button>

      {open &&
        createPortal(
          // Portal a document.body (mismo patrón que InquiryModal/
          // QuickViewSheet): el Header es `sticky` con su propio z-index,
          // lo que crea un contexto de apilamiento propio — cualquier
          // z-index puesto acá adentro quedaba atrapado ahí y nunca
          // llegaba a competir de verdad con el botón flotante del chat
          // (fuera del Header, en el nivel raíz). Por eso el selector de
          // idioma del pie de este drawer quedaba tapado en tablet/mobile.
          <div className="fixed inset-0 z-60 lg:hidden">
            <button
              aria-label={t('closeMenu')}
              className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
              onClick={handleClose}
            />

            <div
              className={`bg-background absolute inset-y-0 right-0 flex w-80 max-w-[85%] flex-col shadow-xl transition-transform duration-300 ease-out ${
                visible ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex items-center justify-between px-8 pt-8 pb-2">
                <Logo width={106} height={20} />
                <button
                  aria-label={t('closeMenu')}
                  onClick={handleClose}
                  className="text-text-muted hover:text-text"
                >
                  <FaXmark size={20} />
                </button>
              </div>

              <nav className="mt-8 flex flex-1 flex-col px-8">
                {NAV_LINKS.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleClose}
                    className="group border-border flex items-baseline gap-4 border-t py-5 first:border-t-0"
                  >
                    <span className="text-accent text-xs tracking-widest">0{i + 1}</span>
                    <span className="font-body text-text group-hover:text-primary text-lg font-normal tracking-wide">
                      {t(link.key)}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="border-border border-t px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-muted text-xs tracking-widest uppercase">
                      {t('brandName')}
                    </p>
                    <p className="text-text-muted mt-1 text-sm">{t('location')}</p>
                  </div>
                  <LanguageSwitcher dropUp />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
