'use client';

import Script from 'next/script';
import { useEffect, useId, useRef } from 'react';
import { useTranslations } from 'next-intl';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export type TurnstileHandle = { reset: () => void };

export function Turnstile({
  onToken,
  handleRef,
}: {
  onToken: (token: string) => void;
  handleRef?: React.MutableRefObject<TurnstileHandle | null>;
}) {
  const t = useTranslations('forms.common');
  const id = `turnstile-${useId().replace(/:/g, '')}`;
  const widgetId = useRef<string | null>(null);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const render = () => {
    const container = document.getElementById(id);
    if (!container || !window.turnstile || widgetId.current || !sitekey) return;
    widgetId.current = window.turnstile.render(container, {
      sitekey,
      callback: onToken,
      'expired-callback': () => onToken(''),
      'error-callback': () => onToken(''),
    });
    if (handleRef) {
      handleRef.current = {
        reset: () => widgetId.current && window.turnstile?.reset(widgetId.current),
      };
    }
  };

  useEffect(() => {
    // El script de Cloudflare solo se inserta una vez por página — en un
    // segundo montaje (ej. cerrar y volver a abrir el modal de reserva),
    // el <Script> de next/script no siempre vuelve a disparar onLoad/onReady
    // porque ya estaba cargado de antes. Acá se cubre ese caso: si
    // `window.turnstile` ya existe al montar, se renderiza directamente en
    // vez de esperar un callback que puede no volver a llegar.
    if (window.turnstile) render();
    return () => {
      // Sin resetear widgetId acá, un remount posterior del componente (ya
      // sea por Strict Mode en desarrollo, o por un flujo multi-paso que
      // desmonta y vuelve a montar Turnstile) encuentra la ref todavía
      // apuntando al widget viejo y `render()` nunca vuelve a crear uno
      // nuevo — el widget queda "removido" pero invisible para siempre.
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
      if (handleRef) handleRef.current = null;
    };
  }, [handleRef]);

  if (!sitekey) {
    return <p className="text-sm text-error">{t('turnstileMissing')}</p>;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={render}
        onReady={render}
      />
      <div id={id} />
    </>
  );
}
