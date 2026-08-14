'use client';

import Script from 'next/script';
import { useEffect, useId, useRef } from 'react';

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
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      if (handleRef) handleRef.current = null;
    };
  }, [handleRef]);

  if (!sitekey) {
    return <p className="text-sm text-error">Turnstile no está configurado.</p>;
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
