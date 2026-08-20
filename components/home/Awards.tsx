'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const awards = [
  {
    year: '2024',
    title: "Traveler's Choice",
    source: 'TripAdvisor',
    description: 'Top 10% of properties worldwide',
    logo: '/images/awards/tripadvisor.webp',
  },
  {
    year: '2024',
    title: 'Best Luxury Villa',
    source: 'Luxury Travel Magazine',
    description: 'Caribbean & Mexico Edition',
    logo: '/images/awards/luxury-travel-magazine.webp',
  },
  {
    year: '2022',
    title: "Traveler's Choice",
    source: 'Conde Nast Traveler',
    description: 'Best island retreat center',
    logo: '/images/awards/conde-nast-traveler.webp',
  },
  {
    year: '2016',
    title: 'Winner 2016',
    source: 'Boutique Hotels Award',
    description: 'Best private villa hotel',
    logo: '/images/awards/boutique-hotel-awards.webp',
  },
];

// Divisores tipo tabla: en tablet forman una cruz (2x2), en desktop solo
// líneas verticales (1 fila de 4). El padding a ambos lados de cada línea
// es igual (mismo valor en el elemento de antes y el de después), para que
// quede centrada en vez de pegada a uno de los dos lados. Índices fijos
// porque `awards` siempre tiene 4 elementos.
const DIVIDER_CLASSES = [
  'border-border sm:pr-8 sm:pb-8 lg:pb-0',
  'border-border sm:border-l sm:pl-8 sm:pb-8 lg:pb-0 lg:pr-8',
  'border-border sm:border-t sm:pr-8 sm:pt-8 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-8',
  'border-border sm:border-l sm:border-t sm:pl-8 sm:pt-8 lg:border-t-0 lg:pt-0',
];

export function Awards() {
  const [index, setIndex] = useState(0);

  function go(delta: number) {
    setIndex((i) => (i + delta + awards.length) % awards.length);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <p className="text-sm tracking-widest text-accent uppercase">Recognition</p>
      <h2 className="font-body mt-2 text-2xl font-normal">Awards</h2>

      {/* Mobile: un premio a la vez, con flechas. Los 4 premios están
          montados a la vez, superpuestos (position absolute) dentro de una
          caja de altura fija — el fundido es solo de opacidad, así que el
          contenido nunca puede empujar el alto de la caja ni mover las
          flechas, sin importar cuánto texto tenga cada uno. */}
      <div className="mt-8 flex items-center gap-6 sm:hidden">
        <button
          onClick={() => go(-1)}
          aria-label="Premio anterior"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-tint text-text-muted hover:text-text"
        >
          <FaChevronLeft size={16} />
        </button>

        <div className="relative h-60 min-w-0 flex-1 overflow-hidden">
          {awards.map((award, i) => (
            <div
              key={`${award.year}-${award.title}`}
              aria-hidden={i !== index}
              className={`pointer-events-none absolute inset-0 flex flex-col justify-center transition-opacity duration-300 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-sm tracking-widest text-accent">{award.year}</p>
              <p className="mt-1 text-lg font-semibold">{award.title}</p>
              <div className="mt-3 mb-4 w-8 border-t border-border" />
              <div className="flex items-center gap-4">
                <Image
                  src={award.logo}
                  alt={award.source}
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 object-contain"
                />
                <div>
                  <p className="text-sm font-medium tracking-widest text-accent uppercase">{award.source}</p>
                  <p className="mt-1 text-text-muted">{award.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => go(1)}
          aria-label="Siguiente premio"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-tint text-text-muted hover:text-text"
        >
          <FaChevronRight size={16} />
        </button>
      </div>

      {/* Tablet/desktop: grilla con divisores (cruz en tablet, líneas en desktop) */}
      <div className="mt-8 hidden gap-10 sm:grid sm:grid-cols-2 sm:gap-0 lg:grid-cols-4">
        {awards.map((award, i) => (
          <div key={`${award.year}-${award.title}`} className={`lg:text-center ${DIVIDER_CLASSES[i]}`}>
            <p className="text-sm tracking-widest text-accent">{award.year}</p>
            <p className="mt-1 text-lg font-semibold">{award.title}</p>
            <div className="mt-3 mb-4 w-8 border-t border-border lg:mx-auto" />

            {/* Tablet: logo a la izquierda del texto */}
            <div className="flex items-center gap-4 lg:hidden">
              <Image
                src={award.logo}
                alt={award.source}
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 object-contain"
              />
              <div>
                <p className="text-sm font-medium tracking-widest text-accent uppercase">{award.source}</p>
                <p className="mt-1 text-text-muted">{award.description}</p>
              </div>
            </div>

            {/* Desktop: texto centrado, logo grande centrado debajo */}
            <div className="hidden lg:block">
              <p className="text-sm font-medium tracking-widest text-accent uppercase">{award.source}</p>
              <p className="mt-2 text-text-muted">{award.description}</p>
              <Image
                src={award.logo}
                alt={award.source}
                width={140}
                height={80}
                className="mx-auto mt-6 h-20 w-auto object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
