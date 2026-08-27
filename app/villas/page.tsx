import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getVillas } from '@/lib/wp/client';
import { VillaCard } from '@/components/home/VillaCard';
import { formatVillaPrice, villaImages } from '@/lib/villas';
import type { QuickViewItem } from '@/components/villas/ReadMoreButton';

export const metadata: Metadata = {
  title: 'Villas | Coco B Isla',
  description: 'Explora la colección completa de villas de Coco B Isla en Isla Mujeres, México.',
};

export default async function VillasPage() {
  const villas = await getVillas();
  const t = await getTranslations('villas');
  const tCommon = await getTranslations('common');

  const quickViewItems: QuickViewItem[] = villas.map((villa) => ({
    slug: villa.slug,
    href: `/villas/${villa.slug}`,
    eyebrow: villa.label || tCommon('singleVilla'),
    title: villa.title,
    images: villaImages(villa),
    price: formatVillaPrice(villa),
    description: villa.longDescription || villa.shortDescription,
    specs: { guestCapacity: villa.guestCapacity, bedrooms: villa.bedrooms, bathrooms: villa.bathrooms },
    villaBooking: {
      id: villa.id,
      mainImage: villa.mainImage,
      startingPrice: villa.startingPrice,
      priceUnit: villa.priceUnit,
      priceOnRequest: villa.priceOnRequest,
      guestCapacity: villa.guestCapacity,
      bedrooms: villa.bedrooms,
    },
  }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h1 className="font-body text-2xl font-normal">{t('pageTitle')}</h1>
      {villas.length === 0 ? (
        <p className="mt-8 text-text-muted">{t('empty')}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {villas.map((villa, i) => (
            <VillaCard key={villa.id} villa={villa} quickViewItems={quickViewItems} quickViewIndex={i} />
          ))}
        </div>
      )}
    </section>
  );
}
