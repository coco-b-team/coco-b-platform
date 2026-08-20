'use client';

import { useState } from 'react';
import Image from 'next/image';

export function VillaGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="h-80 rounded-xl bg-background-alt sm:h-[420px]" />;
  }

  return (
    <div>
      <div className="relative h-80 overflow-hidden rounded-xl bg-background-alt sm:h-[420px]">
        <Image src={images[active]} alt={alt} fill sizes="(min-width: 640px) 700px, 100vw" className="object-cover" priority />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((src, i) => (
            <button
              key={`${i}-${src}`}
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image src={src} alt={`${alt} — foto ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
