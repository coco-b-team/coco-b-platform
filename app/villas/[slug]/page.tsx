import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { getVilla, getVillas } from '@/lib/wp/client';
import { VillaGallery } from '@/components/villas/VillaGallery';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { Button } from '@/components/ui/Button';
import { VillaWeddingForm } from '@/components/forms';

function formatPrice(startingPrice: number | null, priceUnit: string, priceOnRequest: boolean) {
  if (priceOnRequest || !startingPrice) return 'Price on request';
  const price = new Intl.NumberFormat('en-US').format(startingPrice);
  return `From $${price}/${priceUnit || 'night'} + taxes`;
}

// "Casa Lola" -> "Lola", para el tooltip de las flechas prev/next ("Ver Lola")
function shortVillaName(title: string) {
  return title.replace(/^(Casa|Villa)\s+/i, '');
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

  // Flechas para pasar a la siguiente/anterior villa sin volver al inicio —
  // mismo orden que se ve en "Our Villa Collection", con vuelta circular
  // (de la última pasa a la primera) para que la navegación no tenga un
  // final muerto.
  const browsable = allVillas.filter((v) => v.showOnLanding);
  const currentIndex = browsable.findIndex((v) => v.slug === slug);
  const hasSiblings = currentIndex >= 0 && browsable.length > 1;
  const prevVilla = hasSiblings ? browsable[(currentIndex - 1 + browsable.length) % browsable.length] : null;
  const nextVilla = hasSiblings ? browsable[(currentIndex + 1) % browsable.length] : null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      {prevVilla && (
        <Link
          href={`/villas/${prevVilla.slug}`}
          aria-label={`Villa anterior: ${prevVilla.title}`}
          className="group fixed top-1/2 left-2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background text-text shadow-md hover:text-primary sm:left-4"
        >
          <FaChevronLeft size={16} />
          <span className="pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-md bg-text px-3 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Ver {shortVillaName(prevVilla.title)}
          </span>
        </Link>
      )}
      {nextVilla && (
        <Link
          href={`/villas/${nextVilla.slug}`}
          aria-label={`Siguiente villa: ${nextVilla.title}`}
          className="group fixed top-1/2 right-2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background text-text shadow-md hover:text-primary sm:right-4"
        >
          <FaChevronRight size={16} />
          <span className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-md bg-text px-3 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Ver {shortVillaName(nextVilla.title)}
          </span>
        </Link>
      )}

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
        <Button href="#inquiry" variant="primary">
          Inquire
        </Button>
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

      <div id="inquiry" className="mt-12 scroll-mt-24 border-t border-border pt-10">
        <p className="text-xs tracking-widest text-text-muted uppercase">Plan your stay</p>
        <h2 className="mt-1 text-2xl font-semibold">Request {villa.title}</h2>
        <p className="mt-2 mb-6 text-text-muted">
          Share your preferred dates and our team will contact you.
        </p>
        <VillaWeddingForm villaId={String(villa.id)} />
      </div>
    </section>
  );
}
