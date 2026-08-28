'use client';

import { useEffect, useState } from 'react';

// `template.tsx` (a diferencia de `layout.tsx`) se vuelve a montar en cada
// navegación dentro de esta ruta — eso es justo lo que hace falta para que
// cada villa nueva entre con una transición, en vez de aparecer de golpe
// cuando se usa la flecha prev/next.
export default function VillaTemplate({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      {children}
    </div>
  );
}
