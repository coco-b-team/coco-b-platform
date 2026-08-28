'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { SplitCardImage } from '@/components/ui/SplitCardImage';
import { ReadMoreButton, type QuickViewItem } from '@/components/villas/ReadMoreButton';
import { VillaInquireButton } from '@/components/villas/VillaInquireButton';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { formatPackagePrice } from '@/lib/villas';
import type { Package } from '@/lib/wp/types';

export function PackageCard({
  pkg,
  images,
  quickViewItems,
  quickViewIndex,
  priority = false,
}: {
  pkg: Package;
  images?: string[];
  quickViewItems: QuickViewItem[];
  quickViewIndex: number;
  priority?: boolean;
}) {
  const t = useTranslations('mixMatch');

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative">
        <SplitCardImage
          images={images ?? (pkg.mainImage ? [pkg.mainImage] : [])}
          alt={pkg.title}
          priority={priority}
        />
        <span className="bg-background/90 text-primary pointer-events-none absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase shadow-sm backdrop-blur-sm">
          {t('combinedPackage')}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="font-body text-xl font-semibold tracking-wide uppercase">{pkg.title}</p>

        <p className="text-text-muted line-clamp-3 text-sm leading-relaxed">
          {pkg.shortDescription}
        </p>

        <VillaSpecs
          guestCapacity={pkg.guestCapacity}
          bedrooms={pkg.bedrooms}
          bathrooms={pkg.bathrooms}
          variant="inline"
        />

        <p className="text-primary text-xl font-semibold">
          {formatPackagePrice(pkg.startingPrice)}
        </p>

        <div className="mt-auto flex gap-3">
          <ReadMoreButton items={quickViewItems} index={quickViewIndex} />
          <VillaInquireButton
            villa={{
              id: `package-${pkg.slug}`,
              title: pkg.title,
              mainImage: pkg.mainImage,
              startingPrice: pkg.startingPrice,
              priceUnit: 'night',
              priceOnRequest: !pkg.startingPrice,
              guestCapacity: pkg.guestCapacity,
              bedrooms: pkg.bedrooms,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
