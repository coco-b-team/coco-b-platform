'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FaUserGroup, FaBed, FaBath } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { estimateGuestCapacity } from '@/lib/villas';
import type { Villa } from '@/lib/wp/types';

function formatPrice(villa: Villa, priceOnRequestLabel: string, nightLabel: string) {
  if (villa.priceOnRequest || !villa.startingPrice) return priceOnRequestLabel;
  const price = new Intl.NumberFormat('en-US').format(villa.startingPrice);
  return `From $${price}/${villa.priceUnit || nightLabel}`;
}

export function VillaResultCard({ villa }: { villa: Villa }) {
  const t = useTranslations('chat.villaResult');
  const tCommon = useTranslations('common');
  const guests = estimateGuestCapacity(villa.guestCapacity, villa.bedrooms);

  return (
    <div className="max-w-[85%] overflow-hidden rounded-xl border border-border bg-background">
      {villa.mainImage && (
        <div className="relative h-32 w-full">
          <Image src={villa.mainImage} alt={villa.title} fill sizes="280px" className="object-cover" />
        </div>
      )}
      <div className="space-y-1 p-3">
        <p className="text-xs tracking-widest text-text-muted uppercase">{villa.label || t('singleVilla')}</p>
        <p className="font-semibold">{villa.title}</p>
        <p className="line-clamp-2 text-xs text-text-muted">{villa.shortDescription}</p>

        {(guests || villa.bedrooms || villa.bathrooms) && (
          <div className="flex gap-3 pt-0.5 text-xs text-text-muted">
            {guests && (
              <span className="flex items-center gap-1">
                <FaUserGroup size={11} className="text-primary" /> {guests}
              </span>
            )}
            {villa.bedrooms && (
              <span className="flex items-center gap-1">
                <FaBed size={11} className="text-primary" /> {villa.bedrooms}
              </span>
            )}
            {villa.bathrooms && (
              <span className="flex items-center gap-1">
                <FaBath size={11} className="text-primary" /> {villa.bathrooms}
              </span>
            )}
          </div>
        )}

        <p className="text-sm font-semibold">{formatPrice(villa, t('priceOnRequest'), tCommon('night'))}</p>
        <Button href={`/villas/${villa.slug}`} variant="primary" className="mt-2 w-full py-1.5 text-xs">
          {t('viewVilla')}
        </Button>
      </div>
    </div>
  );
}
