import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Package } from '@/lib/wp/types';

function formatPrice(pkg: Package) {
  if (!pkg.startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(pkg.startingPrice);
  return `From $${price}/night + taxes`;
}

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      {pkg.mainImage && (
        <div className="relative h-64 bg-background-alt">
          <Image
            src={pkg.mainImage}
            alt={pkg.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-xs tracking-widest text-text-muted uppercase">Combined Package</p>
        <p className="text-xl font-semibold">{pkg.title}</p>
        <p className="text-text-muted">{pkg.shortDescription}</p>

        {(pkg.guestCapacity || pkg.totalSuiteCapacity) && (
          <div className="flex gap-6 py-2 text-center text-xs tracking-wide text-text uppercase">
            {pkg.guestCapacity && <span>{pkg.guestCapacity} Guests</span>}
            {pkg.totalSuiteCapacity && <span>{pkg.totalSuiteCapacity} Suites</span>}
          </div>
        )}

        <p className="font-semibold">{formatPrice(pkg)}</p>

        <div className="mt-auto flex gap-3 pt-2">
          <Button variant="secondary">Read More</Button>
          <Button variant="primary">Inquire</Button>
        </div>
      </div>
    </Card>
  );
}
