import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FormError } from '@/components/ui/FormError';

const colors = [
  { name: 'primary', var: 'var(--color-primary)', hex: '#107480', uso: 'Botones, CTAs' },
  {
    name: 'primary-light',
    var: 'var(--color-primary-light)',
    hex: '#1D9387',
    uso: 'Hover, acentos',
  },
  { name: 'accent', var: 'var(--color-accent)', hex: '#83CDC1', uso: 'Detalles decorativos' },
  { name: 'background', var: 'var(--color-background)', hex: '#FFFFFF', uso: 'Fondo principal' },
  {
    name: 'background-alt',
    var: 'var(--color-background-alt)',
    hex: '#F5F5F5',
    uso: 'Secciones alternas',
  },
  {
    name: 'background-tint',
    var: 'var(--color-background-tint)',
    hex: '#EBFDF9',
    uso: 'Secciones con acento wellness',
  },
  { name: 'text', var: 'var(--color-text)', hex: '#1A1A1A', uso: 'Texto principal' },
  { name: 'text-muted', var: 'var(--color-text-muted)', hex: '#797979', uso: 'Texto secundario' },
  { name: 'border', var: 'var(--color-border)', hex: '#BBBBBB', uso: 'Bordes, separadores' },
  {
    name: 'error',
    var: 'var(--color-error)',
    hex: '#B3423E',
    uso: 'Validación de formularios (provisorio)',
  },
];

const typeScale = [
  {
    label: 'Hero / título grande',
    size: '40px',
    weight: '300 (light)',
    className: 'text-4xl font-light',
  },
  {
    label: 'Título de sección',
    size: '24px',
    weight: '400 (regular)',
    className: 'text-2xl font-normal',
  },
  {
    label: 'Nombre de villa',
    size: '18px',
    weight: '500 (medium)',
    className: 'text-lg font-medium',
  },
  { label: 'Precio', size: '20px', weight: '600 (semibold)', className: 'text-xl font-semibold' },
  {
    label: 'Texto de cuerpo',
    size: '16px',
    weight: '400 (regular)',
    className: 'text-base font-normal',
  },
  {
    label: 'Texto secundario',
    size: '14px',
    weight: '400 (regular)',
    className: 'text-sm font-normal text-text-muted',
  },
  {
    label: 'Etiqueta chica',
    size: '12px',
    weight: '700 (bold)',
    className: 'text-xs font-bold uppercase',
  },
];

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-6 py-16">
      <header>
        <h1 className="font-body text-4xl font-semibold">Styleguide — Coco B</h1>
        <p className="text-text-muted mt-2">
          Referencia interna de tokens de diseño. Valores extraídos del archivo de Figma (frame
          &quot;Landing&quot;) vía la API de Figma — no son estimaciones.
        </p>
      </header>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Colores</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {colors.map((c) => (
            <div key={c.name} className="border-border overflow-hidden rounded-lg border">
              <div className="h-24" style={{ backgroundColor: c.var }} />
              <div className="p-3">
                <p className="font-medium">{c.name}</p>
                <p className="text-text-muted text-sm">{c.hex}</p>
                <p className="text-text-muted text-sm">{c.uso}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Tipografía — Raleway</h2>
        <div className="space-y-5">
          {typeScale.map((t) => (
            <div
              key={t.label}
              className="border-border flex flex-col gap-1 border-b pb-4 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <p className={t.className}>{t.label} — Aa Bb Cc</p>
              <p className="text-text-muted text-sm whitespace-nowrap">
                {t.size} / {t.weight}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Botones</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">Read More</Button>
          <Button variant="primary">Inquire</Button>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Tarjeta (Card)</h2>
        <Card className="max-w-sm">
          <div className="bg-background-alt text-text-muted flex h-48 items-center justify-center text-sm">
            Imagen de la villa
          </div>
          <div className="space-y-3 p-6">
            <p className="text-text-muted text-xs tracking-widest uppercase">Single Villa</p>
            <p className="text-xl font-semibold">Casa Lola</p>
            <p className="text-text-muted">
              Discover Casa Lola, the island&apos;s newest and most coveted beach villa.
            </p>
            <p className="font-semibold">From $3,200/night</p>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary">Read More</Button>
              <Button variant="primary">Inquire</Button>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Campos de formulario</h2>
        <div className="max-w-sm space-y-6">
          <Input label="Full name" name="fullName" placeholder="Jane Doe" />
          <Input
            label="Email"
            name="email"
            placeholder="jane@example.com"
            error="Please enter a valid email address."
          />
          <FormError message="Something went wrong. Please try again." />
        </div>
      </section>
    </div>
  );
}
