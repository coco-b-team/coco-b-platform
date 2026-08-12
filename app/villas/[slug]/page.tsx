import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVilla } from '@/lib/wp/client';
import { VillaGallery } from '@/components/villas/VillaGallery';
import { Button } from '@/components/ui/Button';

function formatPrice(startingPrice: number | null, priceUnit: string, priceOnRequest: boolean) {
  if (priceOnRequest || !startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(startingPrice);
  return `From $${price}/${priceUnit || 'night'}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const villa = await getVilla(slug);
  if (!villa) return { title: 'Villa | Coco B Isla' };
  return {
    title: `${villa.title} | Coco B Isla`,
    description: villa.shortDescription,
  };
}

export default async function VillaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const villa = await getVilla(slug);
  if (!villa) notFound();

  const images = [...new Set([villa.mainImage, ...villa.gallery].filter((url): url is string => Boolean(url)))];

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <p className="text-xs tracking-widest text-text-muted uppercase">{villa.label || 'Villa'}</p>
      <h1 className="font-body mt-1 text-3xl font-semibold">{villa.title}</h1>

      <div className="mt-6">
        <VillaGallery images={images} alt={villa.title} />
      </div>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs tracking-widest text-text-muted uppercase">Starting From</p>
          <p className="text-2xl font-semibold">
            {formatPrice(villa.startingPrice, villa.priceUnit, villa.priceOnRequest)}
          </p>
        </div>
        <Button variant="primary">Inquire</Button>
      </div>

      {(villa.guestCapacity || villa.bedrooms || villa.bathrooms || villa.location) && (
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-6 text-sm tracking-wide text-text uppercase">
          {villa.guestCapacity && <span>{villa.guestCapacity} Guests</span>}
          {villa.bedrooms && <span>{villa.bedrooms} Bedrooms</span>}
          {villa.bathrooms && <span>{villa.bathrooms} Bathrooms</span>}
          {villa.minimumStayNights && <span>{villa.minimumStayNights}-Night Minimum</span>}
          {villa.location && <span className="normal-case">{villa.location}</span>}
        </div>
      )}

      <p className="mt-8 whitespace-pre-line text-text-muted">{villa.longDescription}</p>

      <div className="mt-8">
        <Button variant="primary">Inquire</Button>
      </div>
    </section>
  );
}
