'use client';

import { useEffect } from 'react';

// Bloquea el scroll del body mientras `active` es true, compensando el
// ancho de la scrollbar para que el contenido no se corra horizontalmente
// al aparecer/desaparecer — mismo patrón que necesitan todos los overlays
// de pantalla completa del sitio (splash, modal de reserva, ficha rápida,
// chat en mobile, menú mobile, login del panel).
//
// `overflow: hidden` solo no alcanza en Safari/WebKit (incluido Edge en
// iOS): el fondo igual se puede arrastrar/rebotar detrás del overlay. Se
// fija el body en su posición actual (`position: fixed` + `top` negativo)
// y se restaura el scroll al soltar — la técnica estándar que sí funciona
// de forma consistente en WebKit, Chromium y Firefox.
//
// El contador y el estilo original viven a nivel de módulo (compartidos
// entre TODAS las instancias del hook, no por componente) — si dos
// overlays quedan activos al mismo tiempo aunque sea un instante (ej. se
// cierra el menú mobile justo cuando se abre el modal de login encima), el
// estilo "de antes de cualquier lock" se guarda solo la primera vez que
// algo bloquea, y se restaura solo cuando el último se libera. Sin esto,
// el segundo overlay en cerrarse podía pisar con un valor ya viejo lo que
// el primero había restaurado bien, dejando el scroll trabado.
let lockCount = 0;
let savedScrollY = 0;
let originalStyle: {
  position: string;
  top: string;
  width: string;
  overflow: string;
  paddingRight: string;
} | null = null;

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      savedScrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const style = document.body.style;
      originalStyle = {
        position: style.position,
        top: style.top,
        width: style.width,
        overflow: style.overflow,
        paddingRight: style.paddingRight,
      };
      style.position = 'fixed';
      style.top = `-${savedScrollY}px`;
      style.width = '100%';
      style.overflow = 'hidden';
      if (scrollbarWidth > 0) style.paddingRight = `${scrollbarWidth}px`;
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0 && originalStyle) {
        const style = document.body.style;
        style.position = originalStyle.position;
        style.top = originalStyle.top;
        style.width = originalStyle.width;
        style.overflow = originalStyle.overflow;
        style.paddingRight = originalStyle.paddingRight;
        window.scrollTo(0, savedScrollY);
        originalStyle = null;
      }
    };
  }, [active]);
}
