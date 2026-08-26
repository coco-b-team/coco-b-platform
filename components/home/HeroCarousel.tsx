'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const AUTO_ADVANCE_MS = 6000;

function Dot({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active}
      // Sombra oscura sutil detrás del punto blanco — sin ella, contra fotos
      // claras (patios, cielo) el punto casi desaparece.
      className={`h-2 w-2 shrink-0 rounded-full bg-white shadow-[0_0_3px_rgba(0,0,0,0.6)] transition-opacity ${
        active ? 'opacity-100' : 'opacity-50 hover:opacity-80'
      }`}
    />
  );
}

// Fotos del hero apiladas una sobre otra (mismo layout, opacidad cruzada) —
// sin flechas, se avanza sola cada 6s o con los dots. Vertical a la derecha
// en tablet/desktop, horizontal arriba en mobile (abajo ya lo ocupa el
// título del hero).
export function HeroCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  // Se apaga el auto-avance apenas la persona interactúa con los dots (ya
  // tomó el control) o si el sistema pide menos movimiento — WCAG 2.2.2
  // pide que el contenido que se mueve solo se pueda detener. Se calcula
  // como valor inicial (no en un efecto aparte) para no disparar un
  // segundo render extra apenas monta; `typeof window` cubre el primer
  // render en el servidor, donde `matchMedia` no existe.
  const [autoAdvance, setAutoAdvance] = useState(
    () => typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (images.length <= 1 || !autoAdvance) return;
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [images.length, autoAdvance]);

  function selectImage(i: number) {
    setActive(i);
    setAutoAdvance(false);
  }

  if (images.length === 0) return null;

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === active ? alt : ''}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {images.length > 1 && (
        <>
          <div className="absolute inset-y-0 right-6 z-10 hidden flex-col items-center justify-center gap-3 sm:flex lg:right-10">
            {images.map((_, i) => (
              <Dot
                key={i}
                active={i === active}
                onClick={() => selectImage(i)}
                label={`Ver foto ${i + 1} de ${images.length}`}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 top-5 z-10 flex justify-center gap-3 sm:hidden">
            {images.map((_, i) => (
              <Dot
                key={i}
                active={i === active}
                onClick={() => selectImage(i)}
                label={`Ver foto ${i + 1} de ${images.length}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
