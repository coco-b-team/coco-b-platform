import { getVillas, getPackages, getTestimonials } from '@/lib/wp/client';
import { Hero } from '@/components/home/Hero';
import { VillaCollection } from '@/components/home/VillaCollection';
import { MixAndMatch } from '@/components/home/MixAndMatch';
import { Testimonials } from '@/components/home/Testimonials';
import { ComplementYourStay } from '@/components/home/ComplementYourStay';
import { Location } from '@/components/home/Location';
import { Awards } from '@/components/home/Awards';

export default async function Home() {
  const [villas, packages, testimonials] = await Promise.all([
    getVillas(),
    getPackages(),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero />
      <VillaCollection villas={villas} />
      <MixAndMatch packages={packages} />
      <Testimonials testimonials={testimonials} />
      <ComplementYourStay />
      <Location />
      <Awards />
    </>
  );
}
