import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Villa } from '@/lib/wp/types';

function formatPrice(villa: Villa) {
  if (villa.priceOnRequest || !villa.startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(villa.startingPrice);
  return `From $${price}/${villa.priceUnit || 'night'}`;
}

export function VillaCard({ villa }: { villa: Villa }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative h-64 bg-background-alt">
        {villa.mainImage && (
          <Image
            src={villa.mainImage}
            alt={villa.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-xs tracking-widest text-text-muted uppercase">{villa.label || 'Single Villa'}</p>
        <p className="text-xl font-semibold">{villa.title}</p>
        <p className="text-text-muted">{villa.shortDescription}</p>

        {(villa.guestCapacity || villa.bedrooms || villa.bathrooms) && (
          <div className="flex gap-6 py-2 text-center text-xs tracking-wide text-text uppercase">
            {villa.guestCapacity && (
              <span>
                {villa.guestCapacity} Guests
              </span>
            )}
            {villa.bedrooms && (
              <span>
                {villa.bedrooms} Bedrooms
              </span>
            )}
            {villa.bathrooms && (
              <span>
                {villa.bathrooms} Bathrooms
              </span>
            )}
          </div>
        )}

        <p className="font-semibold">{formatPrice(villa)}</p>

        <div className="mt-auto flex gap-3 pt-2">
          <Button href={`/villas/${villa.slug}`} variant="secondary">
            Read More
          </Button>
          <Button variant="primary">Inquire</Button>
        </div>
      </div>
    </Card>
  );
}
