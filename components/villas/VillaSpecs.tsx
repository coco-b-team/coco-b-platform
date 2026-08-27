'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { estimateGuestCapacity } from '@/lib/villas';

type Spec = { icon: string; value: number; label: string };

export function VillaSpecs({
  guestCapacity,
  bedrooms,
  bathrooms,
  className = '',
}: {
  guestCapacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  className?: string;
}) {
  const t = useTranslations('villas.specs');
  const guests = estimateGuestCapacity(guestCapacity, bedrooms);

  const specs: Spec[] = [
    guests ? { icon: '/icons/guests.svg', value: guests, label: t('guests', { count: guests }) } : null,
    bedrooms ? { icon: '/icons/bed.svg', value: bedrooms, label: t('bedrooms', { count: bedrooms }) } : null,
    bathrooms ? { icon: '/icons/bath.svg', value: bathrooms, label: t('bathrooms', { count: bathrooms }) } : null,
  ].filter((s): s is Spec => s !== null);

  if (specs.length === 0) return null;

  return (
    <div className={`flex gap-6 ${className}`}>
      {specs.map((spec) => (
        <div key={spec.label} className="flex flex-col items-start gap-[5px]">
          <Image src={spec.icon} alt="" width={24} height={24} />
          <span className="text-xs tracking-wide text-text uppercase">
            {spec.value} {spec.label}
          </span>
        </div>
      ))}
    </div>
  );
}
