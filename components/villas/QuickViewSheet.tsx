'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { FaChevronLeft, FaChevronRight, FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { VillaGallery } from '@/components/villas/VillaGallery';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { VillaInquireButton } from '@/components/villas/VillaInquireButton';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

type Specs = { guestCapacity: number | null; bedrooms: number | null; bathrooms: number | null };

export type QuickViewItem = {
  slug: string;
  href: string;
  eyebrow: string;
  title: string;
  images: string[];
  price: string;
  description: string;
  specs?: Specs;
  // Solo presentes cuando el item es una villa real (no un paquete
  // combinado) — habilitan el modal de reserva de 2 pasos acá mismo, sin
  // cerrar la ficha rápida. Los paquetes siguen usando el botón de
  // "Inquire" de siempre, que lleva a su propio formulario.
  villaBooking?: {
    id: number | string;
    mainImage: string | null;
    startingPrice: number | null;
    priceUnit: string;
    priceOnRequest: boolean;
    guestCapacity: number | null;
    bedrooms: number | null;
  };
};

export function QuickViewSheet({
  items,
  initialIndex,
  onClose,
}: {
  items: QuickViewItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  // Arranca oculta (translate-y-full) y al montar pasa a visible, para que
  // la transición de Tailwind anime la entrada desde abajo en vez de
  // aparecer de golpe. Cerrar hace lo mismo al revés, esperando a que
  // termine la transición antes de desmontar la ficha.
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const current = items[index];

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function go(delta: number) {
    setIndex((i) => (i + delta + items.length) % items.length);
  }

  useBodyScrollLock(true);
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft' && items.length > 1) go(-1);
      if (e.key === 'ArrowRight' && items.length > 1) go(1);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        aria-label={t('close')}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        tabIndex={-1}
        className={`absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-background transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-border px-6 pt-6 pb-4">
          <div>
            <p className="text-xs tracking-widest text-text-muted uppercase">{current.eyebrow}</p>
            <h2 className="font-body mt-1 text-2xl font-semibold uppercase">{current.title}</h2>
          </div>

          <div className="flex items-center gap-1">
            {items.length > 1 && (
              <>
                <button
                  aria-label={t('previous')}
                  onClick={() => go(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:text-text"
                >
                  <FaChevronLeft size={16} />
                </button>
                <button
                  aria-label={t('next')}
                  onClick={() => go(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:text-text"
                >
                  <FaChevronRight size={16} />
                </button>
              </>
            )}
            <button
              aria-label={t('close')}
              onClick={handleClose}
              className="ml-1 flex h-9 w-9 items-center justify-center text-text-muted hover:text-text"
            >
              <FaXmark size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-24">
          <VillaGallery key={current.slug} images={current.images} alt={current.title} />

          <div className="mt-6 flex items-baseline justify-between border-b border-border pb-4">
            <p className="text-xs tracking-widest text-text-muted uppercase">{t('startingFrom')}</p>
            <p className="text-lg font-semibold">{current.price}</p>
          </div>

          {current.specs && (current.specs.guestCapacity || current.specs.bedrooms || current.specs.bathrooms) && (
            <div className="mt-4 border-b border-border pb-4">
              <VillaSpecs
                guestCapacity={current.specs.guestCapacity}
                bedrooms={current.specs.bedrooms}
                bathrooms={current.specs.bathrooms}
              />
            </div>
          )}

          <p className="mt-4 whitespace-pre-line text-text-muted">{current.description}</p>
        </div>

        <div className="shrink-0 border-t border-border bg-background p-4">
          {current.villaBooking ? (
            <VillaInquireButton
              villa={{ title: current.title, ...current.villaBooking }}
              className="w-full"
            />
          ) : (
            <Button href={`${current.href}#inquiry`} variant="primary" className="w-full">
              {t('inquire')}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
