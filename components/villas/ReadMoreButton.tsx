'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { QuickViewSheet } from '@/components/villas/QuickViewSheet';
import type { QuickViewItem } from '@/components/villas/QuickViewSheet';

export type { QuickViewItem } from '@/components/villas/QuickViewSheet';

type ReadMoreButtonProps = {
  items: QuickViewItem[];
  index: number;
};

// Debajo de este ancho (mobile y tablet, hasta el breakpoint `lg` del resto
// del sitio), "Read More" abre una ficha rápida en vez de navegar. Solo en
// desktop mantiene la navegación normal a la página completa.
function useIsCompact() {
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isCompact;
}

export function ReadMoreButton({ items, index }: ReadMoreButtonProps) {
  const t = useTranslations('common');
  const isCompact = useIsCompact();
  const [open, setOpen] = useState(false);
  const href = items[index].href;

  if (!isCompact) {
    return (
      <Button href={href} variant="secondary">
        {t('readMore')}
      </Button>
    );
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {t('readMore')}
      </Button>
      {open && <QuickViewSheet items={items} initialIndex={index} onClose={() => setOpen(false)} />}
    </>
  );
}
