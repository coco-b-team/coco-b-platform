import { Card } from '@/components/ui/Card';
import { SplitCardImage } from '@/components/ui/SplitCardImage';
import { Button } from '@/components/ui/Button';
import { ReadMoreButton, type QuickViewItem } from '@/components/villas/ReadMoreButton';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { formatPackagePrice } from '@/lib/villas';
import type { Package } from '@/lib/wp/types';

export function PackageCard({
  pkg,
  images,
  quickViewItems,
  quickViewIndex,
}: {
  pkg: Package;
  images?: string[];
  quickViewItems: QuickViewItem[];
  quickViewIndex: number;
}) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <SplitCardImage images={images ?? (pkg.mainImage ? [pkg.mainImage] : [])} alt={pkg.title} />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-xs tracking-widest text-text-muted uppercase">Combined Package</p>
        <p className="text-lg font-medium tracking-wider uppercase">{pkg.title}</p>
        <p className="line-clamp-3 text-text-muted">{pkg.shortDescription}</p>

        <VillaSpecs
          guestCapacity={pkg.guestCapacity}
          bedrooms={pkg.bedrooms}
          bathrooms={pkg.bathrooms}
          className="py-2"
        />

        <p className="font-semibold">{formatPackagePrice(pkg.startingPrice)}</p>

        <div className="mt-auto flex gap-3 pt-2">
          <ReadMoreButton items={quickViewItems} index={quickViewIndex} />
          <Button href={`/packages/${pkg.slug}#inquiry`} variant="primary">
            Inquire
          </Button>
        </div>
      </div>
    </Card>
  );
}
