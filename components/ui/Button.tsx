import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

const variantStyles = {
  primary: 'bg-primary text-background hover:bg-primary-light',
  secondary: 'border border-primary text-primary hover:bg-background-tint',
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium tracking-wide uppercase transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
