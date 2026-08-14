import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary';

type ButtonAsButton = { href?: undefined; variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsLink = { href: string; variant?: Variant } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>;

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-background hover:bg-primary-light',
  secondary: 'border border-primary text-primary hover:bg-background-tint',
};

const baseStyles =
  'inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-medium tracking-wide uppercase transition-colors';

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink;
    return <Link href={href} className={classes} {...rest} />;
  }

  // type="button" por defecto — sin esto, un <button> dentro de un <form>
  // hereda type="submit" del navegador y puede enviar el formulario sin
  // querer (relevante para los formularios de HubSpot que vienen después).
  const { type = 'button', ...rest } = props as ButtonAsButton;
  return <button type={type} className={classes} {...rest} />;
}
