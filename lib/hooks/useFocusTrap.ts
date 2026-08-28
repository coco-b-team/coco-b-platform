'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Atrapa el foco de teclado dentro de un overlay (modal, ficha rápida, hoja
// mobile) mientras `active` es true — sin esto, Tab deja salir el foco hacia
// el contenido de atrás, que sigue siendo alcanzable aunque esté visualmente
// cubierto por el overlay. Al abrirse, mueve el foco adentro; al cerrarse,
// lo devuelve a lo que tenía foco antes (el botón que abrió el overlay).
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    function getFocusable() {
      return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null,
      );
    }

    const raf = requestAnimationFrame(() => {
      const focusables = getFocusable();
      (focusables[0] ?? container).focus({ preventScroll: true });
    });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      // preventScroll: sin esto, devolver el foco puede volver a scrollear
      // la página — pisando la posición que useBodyScrollLock ya restauró.
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [active]);

  return containerRef;
}
