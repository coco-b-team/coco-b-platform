'use client';

import { FormEvent, ReactNode, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormError';
import { Turnstile, type TurnstileHandle } from './Turnstile';
import type { HubSpotFormType } from '@/lib/hubspot/schemas';

export function BaseHubSpotForm({
  formType,
  children,
  submitLabel = 'Enviar',
  showSubmitButton = true,
  onSuccess,
  hideTurnstile = false,
}: {
  formType: HubSpotFormType;
  children: ReactNode;
  submitLabel?: string;
  // Usados por flujos multi-paso (ej. el modal de reserva de villa): el
  // botón de enviar solo se muestra en el último paso, y `onSuccess` deja
  // que el componente padre arme su propia pantalla de confirmación en
  // vez de depender del mensaje genérico de acá abajo.
  showSubmitButton?: boolean;
  onSuccess?: () => void;
  // Igual que showSubmitButton: en un flujo multi-paso no tiene sentido
  // mostrar el widget anti-spam antes de llegar al paso final. Se
  // desmonta (no solo se oculta con CSS) — Turnstile calcula el tamaño de
  // su iframe al montarse, y si el contenedor arranca en display:none
  // queda con tamaño cero y no vuelve a dibujarse bien al mostrarlo.
  hideTurnstile?: boolean;
}) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  const turnstile = useRef<TurnstileHandle | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!token) return setError('Completa la verificación anti-spam.');

    const form = event.currentTarget;
    const values = new FormData(form);
    const fields: Record<string, string | boolean> = {};
    for (const [name, value] of values.entries()) {
      if (name !== 'website' && typeof value === 'string') fields[name] = value;
    }
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
      fields[input.name] = input.checked;
    });

    setStatus('sending');
    try {
      const response = await fetch(`/api/hubspot/${formType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields,
          website: values.get('website'),
          turnstileToken: token,
          pageUri: window.location.href,
          pageName: document.title,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'No pudimos enviar el formulario.');
      form.reset();
      setStatus('success');
      setToken('');
      turnstile.current?.reset();
      onSuccess?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Ocurrió un error.');
      setStatus('idle');
      setToken('');
      turnstile.current?.reset();
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {children}
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${formType}-website`}>Website</label>
        <input id={`${formType}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {!hideTurnstile && <Turnstile onToken={setToken} handleRef={turnstile} />}
      {error && <FormError message={error} />}
      {status === 'success' && (
        <p role="status" className="rounded-lg bg-background-tint px-4 py-3 text-primary">
          ¡Gracias! Recibimos tu información.
        </p>
      )}
      {showSubmitButton && (
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando…' : submitLabel}
        </Button>
      )}
    </form>
  );
}

