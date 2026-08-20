'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBars, FaXmark } from 'react-icons/fa6';
import { Logo } from '@/components/ui/Logo';
import { NAV_LINKS } from '@/lib/navLinks';

// Menú hamburguesa para mobile/tablet — el sitio no tiene navegación
// tradicional en desktop (es una landing de una sola página, decisión ya
// tomada al construir el Header), así que este menú vive aparte y solo se
// muestra por debajo de `lg`.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

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
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center text-text lg:hidden"
      >
        <FaBars size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Cerrar menú"
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleClose}
          />

          <div
            className={`absolute inset-y-0 right-0 flex w-80 max-w-[85%] flex-col bg-background shadow-xl transition-transform duration-300 ease-out ${
              visible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-8 pt-8 pb-2">
              <Logo width={106} height={20} />
              <button aria-label="Cerrar menú" onClick={handleClose} className="text-text-muted hover:text-text">
                <FaXmark size={20} />
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col px-8">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleClose}
                  className="group flex items-baseline gap-4 border-t border-border py-5 first:border-t-0"
                >
                  <span className="text-xs tracking-widest text-accent">0{i + 1}</span>
                  <span className="font-body text-lg font-normal tracking-wide text-text group-hover:text-primary">
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="border-t border-border px-8 py-6">
              <p className="text-xs tracking-widest text-text-muted uppercase">Coco B Isla</p>
              <p className="mt-1 text-sm text-text-muted">Isla Mujeres, México</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
