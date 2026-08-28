'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión.');
      setLoading(false);
    }
  }

  return (
    <div className="bg-background-alt flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="border-border bg-background flex flex-col items-center gap-6 rounded-2xl border p-8 shadow-sm">
          <Logo width={140} height={27} alt="Coco B Isla" />
          <div className="text-center">
            <p className="text-text-muted text-xs font-medium tracking-widest uppercase">
              Panel interno
            </p>
            <p className="font-body mt-1 text-lg font-semibold">Reservas</p>
          </div>
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
        </div>
      </div>
    </div>
  );
}
