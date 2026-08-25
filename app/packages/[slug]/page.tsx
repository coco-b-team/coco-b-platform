import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPackage, getVillas } from '@/lib/wp/client';
import { computeComboSpecs } from '@/lib/villas';
import { VillaGallery } from '@/components/villas/VillaGallery';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { Button } from '@/components/ui/Button';
import { VillaWeddingForm } from '@/components/forms';

function formatPrice(startingPrice: number | null) {
  if (!startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(startingPrice);
  return `From $${price}/night + taxes`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackage(slug);
  if (!pkg) return { title: 'Combined Package | Coco B Isla' };
  return {
    title: `${pkg.title} | Coco B Isla`,
    description: pkg.shortDescription,
  };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [pkg, villas] = await Promise.all([getPackage(slug), getVillas()]);
  if (!pkg) notFound();

  const relatedVillas = villas.filter((v) => pkg.relatedVillas.includes(v.id));
  const specs = computeComboSpecs(relatedVillas);

  // Las fotos de las dos villas combinadas, una detrás de otra en la misma
  // galería — no hay fotos propias del paquete en sí.
  const images = relatedVillas
    .flatMap((v) => [v.mainImage, ...v.gallery])
    .filter((url): url is string => Boolean(url));

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <p className="text-xs tracking-widest text-text-muted uppercase">Combined Package</p>
      <h1 className="font-body mt-1 text-3xl font-semibold">{pkg.title}</h1>

      <div className="mt-6">
        <VillaGallery images={images} alt={pkg.title} />
      </div>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs tracking-widest text-text-muted uppercase">Starting From</p>
          <p className="text-2xl font-semibold">{formatPrice(pkg.startingPrice)}</p>
        </div>
        <Button href="#inquiry" variant="primary">
          Inquire
        </Button>
      </div>

      <div className="mt-6 border-b border-border pb-6">
        <VillaSpecs guestCapacity={specs.guestCapacity} bedrooms={specs.bedrooms} bathrooms={specs.bathrooms} />
      </div>

      <p className="mt-8 whitespace-pre-line text-text-muted">{pkg.longDescription || pkg.shortDescription}</p>

      {relatedVillas.length > 0 && (
        <div className="mt-8 border-t border-border pt-8">
          <p className="text-xs tracking-widest text-text-muted uppercase">This combination includes</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {relatedVillas.map((villa) => (
              <Link key={villa.id} href={`/villas/${villa.slug}`} className="text-primary underline">
                {villa.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div id="inquiry" className="mt-12 scroll-mt-24 border-t border-border pt-10">
        <p className="text-xs tracking-widest text-text-muted uppercase">Plan your stay</p>
        <h2 className="mt-1 text-2xl font-semibold">Request {pkg.title}</h2>
        <p className="mt-2 mb-6 text-text-muted">Share your preferred dates and our team will contact you.</p>
        <VillaWeddingForm villaId={`package-${pkg.slug}`} />
      </div>
    </section>
  );
}
