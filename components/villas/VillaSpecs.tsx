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
  // 'stacked' (ícono arriba, número/label abajo) es el look original, usado
  // en la ficha rápida y la página de detalle, donde hay más espacio.
  // 'inline' es más compacto — ícono en una placa circular al lado del
  // número — pensado para las tarjetas de villa/paquete.
  variant = 'stacked',
}: {
  guestCapacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  className?: string;
  variant?: 'stacked' | 'inline';
}) {
  const t = useTranslations('villas.specs');
  const guests = estimateGuestCapacity(guestCapacity, bedrooms);

  const specs: Spec[] = [
    guests
      ? { icon: '/icons/guests.svg', value: guests, label: t('guests', { count: guests }) }
      : null,
    bedrooms
      ? { icon: '/icons/bed.svg', value: bedrooms, label: t('bedrooms', { count: bedrooms }) }
      : null,
    bathrooms
      ? { icon: '/icons/bath.svg', value: bathrooms, label: t('bathrooms', { count: bathrooms }) }
      : null,
  ].filter((s): s is Spec => s !== null);

  if (specs.length === 0) return null;

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-center gap-1.5">
            <span className="bg-background-tint flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
              <Image src={spec.icon} alt="" width={14} height={14} />
            </span>
            <span className="text-xs whitespace-nowrap">
              <span className="text-text font-semibold">{spec.value}</span>{' '}
              <span className="text-text-muted tracking-wide uppercase">{spec.label}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-6 ${className}`}>
      {specs.map((spec) => (
        <div key={spec.label} className="flex flex-col items-start gap-[5px]">
          <Image src={spec.icon} alt="" width={24} height={24} />
          <span className="text-text text-xs tracking-wide uppercase">
            {spec.value} {spec.label}
          </span>
        </div>
      ))}
    </div>
  );
}
