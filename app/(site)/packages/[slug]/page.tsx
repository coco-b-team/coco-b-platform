import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { FaChevronRight } from 'react-icons/fa6';
import { getPackage, getPackages, getVillas } from '@/lib/wp/client';
import { computeComboSpecs } from '@/lib/villas';
import { VillaGallery } from '@/components/villas/VillaGallery';
import { VillaSpecs } from '@/components/villas/VillaSpecs';
import { VillaInquireButton } from '@/components/villas/VillaInquireButton';
import { PrevNextNav } from '@/components/ui/PrevNextNav';

function formatPrice(
  startingPrice: number | null,
  tCommon: Awaited<ReturnType<typeof getTranslations>>,
) {
  if (!startingPrice) return tCommon('priceOnRequest');
  const price = new Intl.NumberFormat('en-US').format(startingPrice);
  return tCommon('fromPricePerUnitWithTaxes', { price, unit: tCommon('night') });
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
  const [pkg, villas, packages] = await Promise.all([getPackage(slug), getVillas(), getPackages()]);
  if (!pkg) notFound();
  const t = await getTranslations('packageDetail');
  const tVillaDetail = await getTranslations('villaDetail');
  const tCommon = await getTranslations('common');

  const relatedVillas = villas.filter((v) => pkg.relatedVillas.includes(v.id));
  const specs = computeComboSpecs(relatedVillas);

  // Las fotos de las dos villas combinadas, una detrás de otra en la misma
  // galería — no hay fotos propias del paquete en sí.
  const images = relatedVillas
    .flatMap((v) => [v.mainImage, ...v.gallery])
    .filter((url): url is string => Boolean(url));

  // Mismo modal de reserva de 2 pasos que usan las villas — antes este
  // formulario era el único de un solo paso que quedaba en el sitio.
  const inquireVilla = {
    id: `package-${pkg.slug}`,
    title: pkg.title,
    mainImage: pkg.mainImage ?? images[0] ?? null,
    startingPrice: pkg.startingPrice,
    priceUnit: 'night',
    priceOnRequest: !pkg.startingPrice,
    guestCapacity: specs.guestCapacity,
    bedrooms: specs.bedrooms,
  };

  // Para pasar al siguiente/anterior paquete desde la franja de navegación
  // del final de la página — mismo filtro y orden que "Mix & Match" en el
  // home, con vuelta circular.
  const browsable = packages.filter((p) => p.showOnLanding && p.relatedVillas.length > 0);
  const currentIndex = browsable.findIndex((p) => p.slug === slug);
  const hasSiblings = currentIndex >= 0 && browsable.length > 1;
  const prevPackage = hasSiblings
    ? browsable[(currentIndex - 1 + browsable.length) % browsable.length]
    : null;
  const nextPackage = hasSiblings ? browsable[(currentIndex + 1) % browsable.length] : null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <p className="text-text-muted text-xs tracking-widest uppercase">{t('combinedPackage')}</p>
      <h1 className="font-body mt-1 text-3xl font-semibold">{pkg.title}</h1>

      <div className="mt-6">
        <VillaGallery images={images} alt={pkg.title} />
      </div>

      <div className="border-border mt-8 flex flex-wrap items-baseline justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-text-muted text-xs tracking-widest uppercase">
            {tVillaDetail('startingFrom')}
          </p>
          <p className="text-2xl font-semibold">{formatPrice(pkg.startingPrice, tCommon)}</p>
        </div>
        <VillaInquireButton villa={inquireVilla} />
      </div>

      <div className="bg-background-alt mt-8 rounded-2xl p-6 sm:p-8">
        <VillaSpecs
          guestCapacity={specs.guestCapacity}
          bedrooms={specs.bedrooms}
          bathrooms={specs.bathrooms}
        />
        <p className="text-text-muted mt-6 whitespace-pre-line">
          {pkg.longDescription || pkg.shortDescription}
        </p>
      </div>

      {relatedVillas.length > 0 && (
        <div className="mt-10">
          <p className="text-text-muted text-xs tracking-widest uppercase">{t('includes')}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {relatedVillas.map((villa) => (
              <Link
                key={villa.id}
                href={`/villas/${villa.slug}`}
                className="group border-border hover:border-primary flex items-center gap-4 rounded-xl border p-3 transition-colors"
              >
                <div className="bg-background-alt relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                  {villa.mainImage && (
                    <Image
                      src={villa.mainImage}
                      alt={villa.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-muted text-xs tracking-widest uppercase">
                    {villa.label || tCommon('villa')}
                  </p>
                  <p className="text-text group-hover:text-primary truncate font-medium transition-colors">
                    {villa.title}
                  </p>
                </div>
                <FaChevronRight
                  size={13}
                  className="text-text-muted group-hover:text-primary shrink-0 transition-colors"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <PrevNextNav
        prev={prevPackage && { href: `/packages/${prevPackage.slug}`, title: prevPackage.title }}
        next={nextPackage && { href: `/packages/${nextPackage.slug}`, title: nextPackage.title }}
      />

      <div className="bg-background-alt mt-12 rounded-2xl px-6 py-12 text-center sm:px-12">
        <p className="text-text-muted text-xs tracking-widest uppercase">
          {tVillaDetail('planYourStay')}
        </p>
        <h2 className="font-body mt-2 text-3xl font-semibold">
          {tVillaDetail('requestTitle', { name: pkg.title })}
        </h2>
        <p className="text-text-muted mx-auto mt-3 max-w-md">{tVillaDetail('shareInfo')}</p>
        <div className="mt-7">
          <VillaInquireButton villa={inquireVilla} />
        </div>
      </div>
    </section>
  );
}
