'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa6';
import type { Testimonial } from '@/lib/wp/types';

// Desktop (≥1024px): 3 tarjetas. Tablet (≥640px): 2. Mobile: 1.
function useCardsPerView() {
  const [cardsPerView, setCardsPerView] = useState(1);

  useEffect(() => {
    const tablet = window.matchMedia('(min-width: 640px)');
    const desktop = window.matchMedia('(min-width: 1024px)');
    const update = () => setCardsPerView(desktop.matches ? 3 : tablet.matches ? 2 : 1);
    update();
    tablet.addEventListener('change', update);
    desktop.addEventListener('change', update);
    return () => {
      tablet.removeEventListener('change', update);
      desktop.removeEventListener('change', update);
    };
  }, []);

  return cardsPerView;
}

function ReviewCard({ testimonial }: { testimonial: Testimonial }) {
  // Las reseñas que se eligen para mostrar acá ya son las positivas — si
  // WordPress todavía no tiene una calificación cargada, se asume 5.
  const rating = testimonial.rating || 5;
  // Sin foto real de autor cargada en WordPress, se genera un avatar
  // ilustrado — no es una foto real de una persona, es un dibujo generado
  // a partir del nombre (mismo nombre siempre da el mismo avatar).
  const avatarSrc =
    testimonial.authorImage ??
    `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(testimonial.authorDetail)}&size=96`;

  return (
    <div className="flex-1 rounded-2xl bg-background p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full bg-background-tint object-cover"
        />
        <div>
          <p className="font-semibold">{testimonial.authorDetail}</p>
          {testimonial.reviewDate && <p className="text-sm text-text-muted">{testimonial.reviewDate}</p>}
        </div>
      </div>

      <p className="mt-6">&quot;{testimonial.quote}&quot;</p>

      <div
        className="mt-6 flex justify-end gap-1 text-primary"
        role="img"
        aria-label={`Calificación: ${rating} de 5 estrellas`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar key={i} size={20} aria-hidden="true" className={i < rating ? '' : 'opacity-20'} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const cardsPerView = useCardsPerView();
  if (testimonials.length === 0) return null;

  const visibleCount = Math.min(cardsPerView, testimonials.length);
  const visible = Array.from(
    { length: visibleCount },
    (_, i) => testimonials[(index + i) % testimonials.length],
  );
  const canNavigate = testimonials.length > cardsPerView;

  function go(delta: number) {
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);
  }

  // El título cambia según la responsividad — en mobile es más corto.
  const heading = cardsPerView === 1 ? 'Our Guests Reviews' : 'What People Say About Coco B Isla';

  return (
    <section className="bg-background-alt py-16">
      <div className="mx-auto max-w-6xl px-6 text-center sm:px-10">
        <h2 className="font-body text-2xl font-semibold tracking-wide uppercase">{heading}</h2>

        <div className="mt-8 flex items-center gap-4">
          {canNavigate && (
            <button
              onClick={() => go(-1)}
              aria-label="Reseña anterior"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-text-muted shadow-sm hover:text-text"
            >
              <FaChevronLeft size={14} />
            </button>
          )}

          <div className="flex flex-1 gap-6 text-left">
            {visible.map((testimonial, i) => (
              <ReviewCard key={`${testimonial.id}-${i}`} testimonial={testimonial} />
            ))}
          </div>

          {canNavigate && (
            <button
              onClick={() => go(1)}
              aria-label="Siguiente reseña"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-text-muted shadow-sm hover:text-text"
            >
              <FaChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
