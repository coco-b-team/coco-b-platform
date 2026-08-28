import { getHero } from '@/lib/wp/client';
import { HeroCarousel } from './HeroCarousel';

export async function Hero() {
  const hero = await getHero();

  return (
    // Acotado a max-w-6xl solo en el rango de tablet (sm a antes de lg) —
    // ahí sí ayudaba con las fotos de baja resolución del carrusel. En
    // desktop (lg+) se pidió volver a punta a punta, como estaba
    // originalmente; en mobile nunca cambió.
    <section
      id="hero"
      className="sm:bg-background-alt sm:px-6 sm:pt-6 lg:bg-transparent lg:px-0 lg:pt-0"
    >
      <div className="relative flex h-160 items-end overflow-hidden sm:mx-auto sm:max-w-6xl sm:rounded-2xl lg:mx-0 lg:max-w-none lg:rounded-none">
        <HeroCarousel images={hero.images} alt={hero.imageAlt} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.1) 50%, transparent)',
          }}
        />
        <div className="text-background relative z-10 flex w-full items-end justify-between gap-6 px-6 pb-12 sm:px-10">
          <div>
            <p className="text-sm tracking-widest uppercase">{hero.eyebrow}</p>
            <h1 className="font-body mt-2 text-5xl leading-tight font-light">{hero.heading}</h1>
          </div>
          {/* El punto de entrada al chat de IA vive acá en desktop (ver
              ChatWidget.tsx) — portado a este slot en vez de fixed, para
              que de verdad viva dentro del hero y se desplace con el resto
              del contenido al scrollear, en lugar de flotar sobre el
              viewport. Vacío y sin ocupar espacio en mobile/tablet. */}
          <div id="hero-chat-slot" className="hidden shrink-0 lg:block" />
        </div>
      </div>
    </section>
  );
}
