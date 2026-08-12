import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative flex h-[640px] items-end overflow-hidden">
      <Image
        src="/hero-villa.jpg"
        alt="Piscina infinita frente al mar en una villa de Coco B Isla"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.1) 50%, transparent)' }}
      />
      <div className="relative z-10 px-6 pb-12 text-background sm:px-10">
        <p className="text-sm tracking-widest uppercase">A Luxury Experience</p>
        <h1 className="font-body mt-2 text-5xl leading-tight font-light">In Isla Mujeres</h1>
      </div>
    </section>
  );
}
