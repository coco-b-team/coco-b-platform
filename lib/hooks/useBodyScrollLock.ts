'use client';

import { useEffect } from 'react';

// Bloquea el scroll del body mientras `active` es true, compensando el
// ancho de la scrollbar para que el contenido no se corra horizontalmente
// al aparecer/desaparecer — mismo patrón que necesitan todos los overlays
// de pantalla completa del sitio (splash, modal de reserva, ficha rápida,
// chat en mobile). Se libera solo si esta misma llamada fue quien lo
// bloqueó, restaurando el valor previo de `overflow`/`paddingRight`.
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [active]);
}
