import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVilla, getVillas } from '@/lib/wp/client';
import { VillaGallery } from '@/components/villas/VillaGallery';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { VillaInquireButton } from '@/components/villas/VillaInquireButton';
import { PrevNextNav } from '@/components/ui/PrevNextNav';

function formatPrice(startingPrice: number | null, priceUnit: string, priceOnRequest: boolean) {
  if (priceOnRequest || !startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(startingPrice);
  return `From $${price}/${priceUnit || 'night'} + taxes`;
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
  const [villa, allVillas] = await Promise.all([getVilla(slug), getVillas()]);
  if (!villa) notFound();

  // mainImage y gallery ya vienen sin duplicados desde lib/wp/client.ts
  const images = [villa.mainImage, ...villa.gallery].filter((url): url is string => Boolean(url));

  // Para pasar a la siguiente/anterior villa desde la franja de navegación
  // del final de la página — mismo orden que se ve en "Our Villa
  // Collection", con vuelta circular (de la última pasa a la primera) para
  // que la navegación no tenga un final muerto.
  const browsable = allVillas.filter((v) => v.showOnLanding);
  const currentIndex = browsable.findIndex((v) => v.slug === slug);
  const hasSiblings = currentIndex >= 0 && browsable.length > 1;
  const prevVilla = hasSiblings ? browsable[(currentIndex - 1 + browsable.length) % browsable.length] : null;
  const nextVilla = hasSiblings ? browsable[(currentIndex + 1) % browsable.length] : null;

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

      {(villa.guestCapacity || villa.bedrooms || villa.bathrooms || villa.minimumStayNights || villa.location) && (
        <div className="mt-6 border-b border-border pb-6">
          <VillaSpecs guestCapacity={villa.guestCapacity} bedrooms={villa.bedrooms} bathrooms={villa.bathrooms} />
          {(villa.minimumStayNights || villa.location) && (
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm tracking-wide text-text-muted uppercase">
              {villa.minimumStayNights && <span>{villa.minimumStayNights}-Night Minimum</span>}
              {villa.location && <span className="normal-case">{villa.location}</span>}
            </div>
          )}
        </div>
      )}

      <p className="mt-8 whitespace-pre-line text-text-muted">{villa.longDescription}</p>

      <PrevNextNav
        prev={prevVilla && { href: `/villas/${prevVilla.slug}`, title: prevVilla.title }}
        next={nextVilla && { href: `/villas/${nextVilla.slug}`, title: nextVilla.title }}
      />

      <div className="mt-12 rounded-2xl bg-background-alt px-6 py-12 text-center sm:px-12">
        <p className="text-xs tracking-widest text-text-muted uppercase">Plan your stay</p>
        <h2 className="font-body mt-2 text-3xl font-semibold">Request {villa.title}</h2>
        <p className="mx-auto mt-3 max-w-md text-text-muted">
          Share your preferred dates and our team will get back to you within 24 hours.
        </p>
        <div className="mt-7">
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
    </section>
  );
}
