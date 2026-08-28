'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { FaXmark } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

// Login del panel interno como modal en vez de navegar a una página aparte
// — es un panel chico, no amerita el peso de una página propia solo para
// pedir la contraseña. Mismo patrón de overlay (portal, foco atrapado,
// scroll bloqueado, Escape) que el resto de los modales del sitio.
export function StaffLoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const exitingRef = useRef(false);
  const trapRef = useFocusTrap(true);

  useBodyScrollLock(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si ya hay sesión activa (ej. se entró antes y solo se volvió al sitio
  // con "Ver sitio"), se salta el formulario y va directo al panel en vez
  // de pedir la contraseña de nuevo.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/session')
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean }) => {
        if (cancelled) return;
        if (data.authenticated) {
          router.push('/admin');
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleClose() {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 250);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || 'No se pudo iniciar sesión.');
      router.push('/admin');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión.');
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-label="Acceso del equipo"
        tabIndex={-1}
        className={`bg-background relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl p-8 shadow-xl transition-all duration-250 ease-out ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          aria-label="Cerrar"
          className="text-text-muted hover:text-text absolute top-5 right-5"
        >
          <FaXmark size={18} />
        </button>

        <div className="flex flex-col items-center gap-6">
          <Logo width={140} height={27} alt="Coco B Isla" />
          <div className="text-center">
            <p className="text-text-muted text-xs font-medium tracking-widest uppercase">
              Panel interno
            </p>
            <p className="font-body mt-1 text-lg font-semibold">Reservas</p>
          </div>

          {checkingSession ? (
            <p className="text-text-muted text-sm">Verificando sesión…</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
              <Input
                label="Contraseña"
                name="password"
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Ingresando…' : 'Ingresar'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
