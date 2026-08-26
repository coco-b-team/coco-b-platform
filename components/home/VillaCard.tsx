import { Card } from '@/components/ui/Card';
import { CardCarousel } from '@/components/ui/CardCarousel';
import { ReadMoreButton, type QuickViewItem } from '@/components/villas/ReadMoreButton';
import { VillaInquireButton } from '@/components/villas/VillaInquireButton';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { formatVillaPrice, villaImages } from '@/lib/villas';
import type { Villa } from '@/lib/wp/types';

export function VillaCard({
  villa,
  quickViewItems,
  quickViewIndex,
}: {
  villa: Villa;
  quickViewItems: QuickViewItem[];
  quickViewIndex: number;
}) {
  const images = villaImages(villa);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardCarousel images={images} alt={villa.title} />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-xs tracking-widest text-text-muted uppercase">{villa.label || 'Single Villa'}</p>
        <p className="text-lg font-medium tracking-wider uppercase">{villa.title}</p>
        <p className="line-clamp-3 text-text-muted">{villa.shortDescription}</p>

        <VillaSpecs
          guestCapacity={villa.guestCapacity}
          bedrooms={villa.bedrooms}
          bathrooms={villa.bathrooms}
          className="py-2"
        />

        <p className="font-semibold">{formatVillaPrice(villa)}</p>

        <div className="mt-auto flex gap-3 pt-2">
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
