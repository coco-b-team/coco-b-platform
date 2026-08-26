'use client';

import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

// Se muestra desde el primer render (sin esperar a un efecto), tanto en
// el HTML que arma el servidor como en el primer pintado del cliente —
// así no hay ningún instante en que se vea la web real por debajo antes
// de que aparezca. Como este componente vive en el layout raíz, React no
// lo vuelve a montar en navegaciones internas (Link/router) — solo en una
// carga real de página (F5 o abrir el sitio), que es cuando debe aparecer.
const HOLD_MS = 1400;
const EXIT_MS = 600;

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [visible, setVisible] = useState(true);
  // Controla solo el desvanecimiento de entrada del logo/texto — el fondo
  // ya está opaco desde el primer render (ver comentario de arriba), así
  // que animar el contenido por separado no reintroduce el parpadeo.
  const [contentVisible, setContentVisible] = useState(false);
  const exitingRef = useRef(false);

  // Atado a `visible` (no a `show`) para que el scroll se libere apenas
  // arranca el desvanecimiento de salida, no recién cuando termina.
  useBodyScrollLock(visible);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setContentVisible(true));
    const holdTimer = setTimeout(exit, HOLD_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
    };
  }, []);

  function exit() {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setVisible(false);
    setTimeout(() => setShow(false), EXIT_MS);
  }

  if (!show) return null;

  return (
    <div
      onClick={exit}
      role="presentation"
      className={`fixed inset-0 z-100 flex cursor-pointer flex-col items-center justify-center bg-text transition-opacity duration-500 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`flex flex-col items-center transition-all duration-1000 ease-out ${
          contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <Logo variant="splash" width={220} height={42} alt="Coco B Isla" priority />
        <p className="mt-7 text-xs tracking-[0.5em] text-background uppercase">A Luxury Experience</p>
        <p className="mt-3 text-[11px] tracking-[0.35em] text-accent uppercase">Isla Mujeres · Mexico</p>
      </div>
    </div>
  );
}
