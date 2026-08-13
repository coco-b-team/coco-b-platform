import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { Villa } from '@/lib/wp/types';

function formatPrice(villa: Villa) {
  if (villa.priceOnRequest || !villa.startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(villa.startingPrice);
  return `From $${price}/${villa.priceUnit || 'night'}`;
}

export function VillaResultCard({ villa }: { villa: Villa }) {
  return (
    <div className="max-w-[85%] overflow-hidden rounded-xl border border-border bg-background">
      {villa.mainImage && (
        <div className="relative h-32 w-full">
          <Image src={villa.mainImage} alt={villa.title} fill sizes="280px" className="object-cover" />
        </div>
      )}
      <div className="space-y-1 p-3">
        <p className="text-xs tracking-widest text-text-muted uppercase">{villa.label || 'Single Villa'}</p>
        <p className="font-semibold">{villa.title}</p>
        <p className="line-clamp-2 text-xs text-text-muted">{villa.shortDescription}</p>
        <p className="text-sm font-semibold">{formatPrice(villa)}</p>
        <Button href={`/villas/${villa.slug}`} variant="primary" className="mt-2 w-full py-1.5 text-xs">
          Ver villa
        </Button>
      </div>
    </div>
  );
}
