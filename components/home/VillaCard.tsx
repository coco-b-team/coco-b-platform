import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/Card';
import { CardCarousel } from '@/components/ui/CardCarousel';
import { ReadMoreButton, type QuickViewItem } from '@/components/villas/ReadMoreButton';
import { VillaInquireButton } from '@/components/villas/VillaInquireButton';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { formatVillaPrice, villaImages } from '@/lib/villas';
import type { Villa } from '@/lib/wp/types';

export async function VillaCard({
  villa,
  quickViewItems,
  quickViewIndex,
  priority = false,
}: {
  villa: Villa;
  quickViewItems: QuickViewItem[];
  quickViewIndex: number;
  priority?: boolean;
}) {
  const images = villaImages(villa);
  const tCommon = await getTranslations('common');

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative">
        <CardCarousel images={images} alt={villa.title} priority={priority} />
        <span className="bg-background/90 text-primary pointer-events-none absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase shadow-sm backdrop-blur-sm">
          {villa.label || tCommon('singleVilla')}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="font-body text-xl font-semibold tracking-wide uppercase">{villa.title}</p>

        <p className="text-text-muted line-clamp-3 text-sm leading-relaxed">
          {villa.shortDescription}
        </p>

        <VillaSpecs
          guestCapacity={villa.guestCapacity}
          bedrooms={villa.bedrooms}
          bathrooms={villa.bathrooms}
          variant="inline"
        />

        <p className="text-primary text-xl font-semibold">{formatVillaPrice(villa)}</p>

        <div className="mt-auto flex gap-3">
          <ReadMoreButton items={quickViewItems} index={quickViewIndex} />
          <VillaInquireButton
            villa={{
              id: villa.id,
              title: villa.title,
              mainImage: villa.mainImage,
              startingPrice: villa.startingPrice,
              priceUnit: villa.priceUnit,
              priceOnRequest: villa.priceOnRequest,
              guestCapacity: villa.guestCapacity,
              bedrooms: villa.bedrooms,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
