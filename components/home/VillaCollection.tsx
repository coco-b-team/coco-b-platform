import { getTranslations } from 'next-intl/server';
import { VillaCard } from './VillaCard';
import { getHero } from '@/lib/wp/client';
import { formatVillaPrice, villaImages } from '@/lib/villas';
import type { Villa } from '@/lib/wp/types';
import type { QuickViewItem } from '@/components/villas/ReadMoreButton';

export async function VillaCollection({ villas }: { villas: Villa[] }) {
  const visible = villas.filter((v) => v.showOnLanding);
  if (visible.length === 0) return null;

  const { villasHeading, villasDescription } = await getHero();
  const tCommon = await getTranslations('common');

  // Todas las villas visibles, en el mismo orden que se muestran acá —
  // la ficha rápida (Read More en mobile/tablet) usa esta misma lista para
  // poder pasar de una villa a otra sin cerrarse.
  const quickViewItems: QuickViewItem[] = visible.map((villa) => ({
    slug: villa.slug,
    href: `/villas/${villa.slug}`,
    eyebrow: villa.label || tCommon('singleVilla'),
    title: villa.title,
    images: villaImages(villa),
    price: formatVillaPrice(villa),
    description: villa.longDescription || villa.shortDescription,
    specs: {
      guestCapacity: villa.guestCapacity,
      bedrooms: villa.bedrooms,
      bathrooms: villa.bathrooms,
    },
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
      <div className="sm:text-center">
        <h2 className="font-body text-2xl font-normal">{villasHeading}</h2>
        <p className="text-text-muted mt-4 max-w-3xl sm:mx-auto">{villasDescription}</p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
        {visible.map((villa, i) => (
          <VillaCard
            key={villa.id}
            villa={villa}
            quickViewItems={quickViewItems}
            quickViewIndex={i}
            priority={i < 2}
          />
        ))}
      </div>
    </section>
  );
}
