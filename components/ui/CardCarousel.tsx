'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

export function CardCarousel({
  images,
  alt,
  priority = false,
}: {
  images: string[];
  alt: string;
  // Solo las tarjetas de la primera fila (arriba del todo, sin scrollear)
  // deberían pedir esto — decirle a Next que TODO es prioritario anula el
  // sentido de priorizar nada.
  priority?: boolean;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="bg-background-alt relative h-64" />;
  }

  function go(e: React.MouseEvent, delta: number) {
    e.preventDefault();
    e.stopPropagation();
    setActive((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div className="group bg-background-alt relative h-64">
      <Image
        src={images[active]}
        alt={alt}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover"
        priority={priority}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(e, -1)}
            aria-label={`Foto anterior de ${alt}`}
            className="absolute top-1/2 left-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:bg-white/40"
          >
            <FaChevronLeft size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => go(e, 1)}
            aria-label={`Foto siguiente de ${alt}`}
            className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 hover:bg-white/40"
          >
            <FaChevronRight size={12} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActive(i);
                }}
                aria-label={`Ver foto ${i + 1} de ${alt}`}
                aria-current={i === active}
                className={`h-1.5 w-1.5 rounded-full transition-opacity ${i === active ? 'bg-white opacity-100' : 'bg-white opacity-40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
