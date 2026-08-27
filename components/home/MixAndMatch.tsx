'use client';

import { useTranslations } from 'next-intl';
import { PackageCard } from './PackageCard';
import { computeComboSpecs, formatPackagePrice } from '@/lib/villas';
import type { Package, Villa } from '@/lib/wp/types';
import type { QuickViewItem } from '@/components/villas/ReadMoreButton';

export function MixAndMatch({ packages, villas }: { packages: Package[]; villas: Villa[] }) {
  const t = useTranslations('mixMatch');
  // "Mix & Match" son combinaciones reales de dos villas — se filtra por
  // relatedVillas para no mostrar entradas del mismo tipo de contenido que
  // no son en realidad una combinación (ej. "Concierge Services").
  const combos = packages
    .filter((p) => p.showOnLanding && p.relatedVillas.length > 0)
    .map((pkg) => {
      const relatedVillas = villas.filter((v) => pkg.relatedVillas.includes(v.id));
      // Una foto de cada villa combinada, lado a lado, en vez de la imagen
      // del paquete en sí — refuerza que son las dos villas juntas.
      const images = relatedVillas.map((v) => v.mainImage).filter((url): url is string => Boolean(url));
      // Para la ficha rápida sí conviene la galería completa de ambas villas,
      // no solo la portada de cada una.
      const galleryImages = relatedVillas
        .flatMap((v) => [v.mainImage, ...v.gallery])
        .filter((url): url is string => Boolean(url));
      return { ...pkg, ...computeComboSpecs(relatedVillas), images, galleryImages };
    });

  if (combos.length === 0) return null;

  const quickViewItems: QuickViewItem[] = combos.map((combo) => ({
    slug: combo.slug,
    href: `/packages/${combo.slug}`,
    eyebrow: t('combinedPackage'),
    title: combo.title,
    images: combo.galleryImages,
    price: formatPackagePrice(combo.startingPrice),
    description: combo.longDescription || combo.shortDescription,
    specs: { guestCapacity: combo.guestCapacity, bedrooms: combo.bedrooms, bathrooms: combo.bathrooms },
    villaBooking: {
      id: `package-${combo.slug}`,
      mainImage: combo.mainImage,
      startingPrice: combo.startingPrice,
      priceUnit: 'night',
      priceOnRequest: !combo.startingPrice,
      guestCapacity: combo.guestCapacity,
      bedrooms: combo.bedrooms,
    },
  }));

  return (
    <section id="mix-match" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 sm:px-10">
      <div className="sm:text-center">
        <h2 className="font-body text-2xl font-normal">{t('heading')}</h2>
        <p className="mt-4 max-w-2xl text-text-muted sm:mx-auto">{t('description')}</p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {combos.map((pkg, i) => (
          <PackageCard key={pkg.id} pkg={pkg} images={pkg.images} quickViewItems={quickViewItems} quickViewIndex={i} />
        ))}
      </div>
    </section>
  );
}
