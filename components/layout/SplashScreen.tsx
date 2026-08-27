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

// Pequeño diamante — la misma forma geométrica que ya usa el isotipo del
// logo (los rombos sobre la firma), para que el fondo se sienta parte de
// la misma marca en vez de un patrón genérico pegado encima.
function Diamond({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      transform={`rotate(45 ${x} ${y})`}
      stroke="currentColor"
      strokeWidth={1}
      fill="none"
      opacity={opacity}
    />
  );
}

// Un solo motivo pequeño por esquina — como un detalle tallado en el
// borde, no un elemento que compita por atención. Nada de brillo ni
// centro "diana": la idea es que se note al mirar con calma, no que
// salte a la vista apenas carga.
function CornerMotif({ x, y, flipX = false, flipY = false }: { x: number; y: number; flipX?: boolean; flipY?: boolean }) {
  const dx = flipX ? -1 : 1;
  const dy = flipY ? -1 : 1;
  return (
    <g>
      <Diamond x={x} y={y} size={22} opacity={0.28} />
      <Diamond x={x + 30 * dx} y={y + 30 * dy} size={11} opacity={0.16} />
    </g>
  );
}

// Ornamento decorativo del fondo del splash — solo un motivo chico en
// cada esquina (como un tallado sutil en el marco), sin nada centrado
// detrás del logo. Se busca un aire elegante y discreto, no un efecto
// llamativo tipo intro de videojuego.
function SplashOrnament() {
  return (
    <svg
      viewBox="0 0 800 800"
      className="pointer-events-none absolute inset-0 h-full w-full text-accent"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <CornerMotif x={60} y={60} />
      <CornerMotif x={740} y={60} flipX />
      <CornerMotif x={60} y={740} flipY />
      <CornerMotif x={740} y={740} flipX flipY />
    </svg>
  );
}

// Separador chico entre el logo y el texto — una línea fina con un
// diamante al centro, el mismo recurso editorial que usan las marcas de
// hospitalidad de lujo para un detalle discreto sin ser decorativo de más.
function DiamondDivider() {
  return (
    <svg width="120" height="12" viewBox="0 0 120 12" className="text-accent" aria-hidden="true">
      <line x1="0" y1="6" x2="48" y2="6" stroke="currentColor" strokeWidth="1" opacity={0.5} />
      <rect x="55" y="1" width="10" height="10" transform="rotate(45 60 6)" stroke="currentColor" strokeWidth="1" fill="none" opacity={0.7} />
      <line x1="72" y1="6" x2="120" y2="6" stroke="currentColor" strokeWidth="1" opacity={0.5} />
    </svg>
  );
}

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
      className={`fixed inset-0 z-100 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-text transition-opacity duration-500 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <SplashOrnament />

      <div
        className={`relative flex flex-col items-center transition-all duration-1000 ease-out ${
          contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <Logo variant="splash" width={220} height={42} alt="Coco B Isla" priority />
        <div className="mt-6">
          <DiamondDivider />
        </div>
        <p className="mt-6 text-xs tracking-[0.5em] text-background uppercase">A Luxury Experience</p>
        <p className="mt-3 text-[11px] tracking-[0.35em] text-accent uppercase">Isla Mujeres · Mexico</p>
      </div>
    </div>
  );
}
