import { Input } from '@/components/ui/Input';

export const fieldClass =
  'rounded-lg border border-border px-4 py-2.5 text-text focus:border-primary focus:outline-none';

export function ContactFields() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Input label="Nombre" name="first_name" required maxLength={100} />
      <Input label="Apellido" name="last_name" required maxLength={100} />
      <Input label="Email" name="email" type="email" required maxLength={254} />
      <Input label="Teléfono" name="phone" type="tel" required maxLength={40} />
    </div>
  );
}

export function TextArea({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
      {label}
      <textarea name={name} required={required} maxLength={2000} rows={5} className={fieldClass} />
    </label>
  );
}

export function Checkbox({ name, label, required = false }: { name: string; label: string; required?: boolean }) {
  return (
    <label className="flex items-start gap-3 text-sm text-text">
      <input name={name} type="checkbox" required={required} className="mt-1 size-4 accent-primary" />
      <span>{label}</span>
    </label>
  );
}

