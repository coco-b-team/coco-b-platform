import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { getAbout } from '@/lib/wp/client';

export const metadata: Metadata = {
  title: 'About Us | Coco B Isla',
  description:
    'A Caribbean sanctuary in Isla Mujeres — the story, mission, and sustainability practices behind Coco B Isla & Coco B Wellness.',
};

export default async function AboutPage() {
  const about = await getAbout();
  const t = await getTranslations('about');
  const tCommon = await getTranslations('common');
  const storyParagraphs = about.story.split('\n\n');
  const closingParagraphs = about.sustainabilityClosing.split('\n\n');

  const MOSAIC_IMAGES = [
    { src: '/images/about/about_1.webp', alt: t('alts.aerial') },
    { src: '/images/about/about_7.webp', alt: t('alts.loungeSunset') },
    { src: '/images/about/about_3.webp', alt: t('alts.cove') },
  ];

  const STRIP_IMAGES = [
    { src: '/images/about/about_2.webp', alt: t('alts.sailboat') },
    { src: '/images/about/about_6.webp', alt: t('alts.coastSunset') },
    { src: '/images/about/about_8.webp', alt: t('alts.lighthouse') },
  ];

  return (
    <>
      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
        <p className="text-xs tracking-widest text-text-muted uppercase">{t('eyebrow')}</p>
        <h1 className="font-body mt-1 text-3xl font-semibold">{about.heading}</h1>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {about.triad.map((item) => (
            <div key={item.title}>
              <h2 className="text-sm font-semibold tracking-widest text-primary uppercase">{item.title}</h2>
              <p className="mt-3 text-text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-14 h-72 overflow-hidden rounded-2xl sm:h-96">
          <Image
            src="/images/about/about_5.webp"
            alt={t('alts.terraceSunset')}
            fill
            sizes="(min-width: 640px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-14 space-y-6 border-t border-border pt-10 text-text-muted">
          {storyParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <p className="font-medium text-text">{about.mission}</p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-border pt-10 text-center">
          <p className="text-sm tracking-[0.3em] text-accent uppercase">{about.tagline}</p>
          <Button href="/villas" variant="primary">
            {tCommon('inquire')}
          </Button>
        </div>
      </section>

      <section className="bg-background-alt py-16">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <p className="text-xs tracking-widest text-accent uppercase">{t('sustainability')}</p>
          <h2 className="font-body mt-1 text-2xl font-semibold">{about.sustainabilityHeading}</h2>
          <p className="mt-4 text-text-muted">{about.sustainabilityIntro}</p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {MOSAIC_IMAGES.map((image) => (
              <div key={image.src} className="relative h-32 overflow-hidden rounded-2xl sm:h-56">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 250px, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mt-10 divide-y divide-border">
            {about.sustainabilitySections.map((section) => (
              <div key={section.heading} className="py-6 first:pt-0">
                <h3 className="font-body text-lg font-semibold">{section.heading}</h3>
                <p className="mt-2 text-text-muted">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-8 text-text-muted">
            {closingParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {STRIP_IMAGES.map((image) => (
              <div key={image.src} className="relative h-32 overflow-hidden rounded-2xl sm:h-56">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 250px, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
