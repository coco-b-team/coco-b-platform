import Image from 'next/image';
import { getHero } from '@/lib/wp/client';

export async function Hero() {
  const hero = await getHero();

  return (
    <section className="relative flex h-[640px] items-end overflow-hidden">
      <Image
        src={hero.image ?? '/hero-villa.jpg'}
        alt={hero.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.1) 50%, transparent)' }}
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12 text-background sm:px-10">
        <p className="text-sm tracking-widest uppercase">{hero.eyebrow}</p>
        <h1 className="font-body mt-2 text-5xl leading-tight font-light">{hero.heading}</h1>
      </div>
    </section>
  );
}
