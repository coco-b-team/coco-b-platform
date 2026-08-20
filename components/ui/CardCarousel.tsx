'use client';

import { useState } from 'react';
import Image from 'next/image';

export function CardCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="relative h-64 bg-background-alt" />;
  }

  return (
    <div className="relative h-64 bg-background-alt">
      <Image
        src={images[active]}
        alt={alt}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
      {images.length > 1 && (
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
      )}
    </div>
  );
}
