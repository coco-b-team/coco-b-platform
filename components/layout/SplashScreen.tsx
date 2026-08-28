'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { DiamondDivider } from '@/components/ui/DiamondDivider';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

// Se muestra desde el primer render (sin esperar a un efecto), tanto en
// el HTML que arma el servidor como en el primer pintado del cliente —
// así no hay ningún instante en que se vea la web real por debajo antes
// de que aparezca. Como este componente vive en el layout del sitio
// público (no en el raíz), React no lo vuelve a montar en navegaciones
// internas (Link/router) dentro del sitio — solo en una carga real de
// página (F5 o abrir el sitio), que es cuando debe aparecer.
const HOLD_MS = 1400;
const EXIT_MS = 600;

// /admin vive fuera de este layout, así que nunca monta el splash — al
// volver de ahí al sitio (ej. "Ver sitio" del panel), React lo monta por
// primera vez en esa sesión y de otro modo reproduciría la intro entera
// como si fuera una carga real. El panel deja esta bandera en
// sessionStorage antes de navegar; acá se lee una sola vez y se borra.
const SKIP_SPLASH_KEY = 'coco-b-skip-splash';

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
function CornerMotif({
  x,
  y,
  flipX = false,
  flipY = false,
}: {
  x: number;
  y: number;
  flipX?: boolean;
  flipY?: boolean;
}) {
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
      className="text-accent pointer-events-none absolute inset-0 h-full w-full"
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

export function SplashScreen() {
  const t = useTranslations('splash');
  const [skipIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    const skip = Boolean(sessionStorage.getItem(SKIP_SPLASH_KEY));
    if (skip) sessionStorage.removeItem(SKIP_SPLASH_KEY);
    return skip;
  });
  const [show, setShow] = useState(() => !skipIntro);
  const [visible, setVisible] = useState(() => !skipIntro);
  // Controla solo el desvanecimiento de entrada del logo/texto — el fondo
  // ya está opaco desde el primer render (ver comentario de arriba), así
  // que animar el contenido por separado no reintroduce el parpadeo.
  const [contentVisible, setContentVisible] = useState(false);
  const exitingRef = useRef(false);

  // Atado a `visible` (no a `show`) para que el scroll se libere apenas
  // arranca el desvanecimiento de salida, no recién cuando termina.
  useBodyScrollLock(visible);

  useEffect(() => {
    if (skipIntro) return;
    const raf = requestAnimationFrame(() => setContentVisible(true));
    const holdTimer = setTimeout(exit, HOLD_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      className={`bg-text fixed inset-0 z-100 flex cursor-pointer flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ease-out ${
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
        <p className="text-background mt-6 text-xs tracking-[0.5em] uppercase">{t('tagline')}</p>
        <p className="text-accent mt-3 text-[11px] tracking-[0.35em] uppercase">{t('location')}</p>
      </div>
    </div>
  );
}
