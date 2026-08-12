import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, name, className = '', ...props }: InputProps) {
  const inputId = id || name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`rounded-lg border px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none ${
          error ? 'border-error' : 'border-border'
        } ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
