'use client';

import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaStar, FaRegStar } from 'react-icons/fa6';
import type { Testimonial } from '@/lib/wp/types';

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  if (testimonials.length === 0) return null;

  const current = testimonials[index];
  const rating = current.rating ?? 0;

  function go(delta: number) {
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);
  }

  return (
    <section className="bg-background-alt py-16">
      <div className="mx-auto max-w-3xl px-6 sm:px-10">
        <h2 className="font-body text-2xl font-normal">Our Guests Reviews</h2>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Reseña anterior"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-text hover:bg-background-alt"
          >
            <FaChevronLeft size={16} />
          </button>

          <div className="flex-1 rounded-xl border border-border bg-background p-8">
            <p className="text-lg font-semibold">{current.authorDetail}</p>
            <p className="mt-6 text-lg">&quot;{current.quote}&quot;</p>
            {rating > 0 && (
              <div
                className="mt-6 flex gap-1 text-primary"
                role="img"
                aria-label={`Calificación: ${rating} de 5 estrellas`}
              >
                {Array.from({ length: 5 }).map((_, i) =>
                  i < rating ? <FaStar key={i} size={20} aria-hidden="true" /> : <FaRegStar key={i} size={20} aria-hidden="true" />,
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Siguiente reseña"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-text hover:bg-background-alt"
          >
            <FaChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
