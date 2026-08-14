import Image from 'next/image';

type LogoVariant = 'default' | 'white';

const LOGO_SRC: Record<LogoVariant, string> = {
  default: '/logo.svg',
  white: '/logo-white.svg',
};

type LogoProps = {
  variant?: LogoVariant;
  width: number;
  height: number;
  alt?: string;
  className?: string;
  priority?: boolean;
};

export function Logo({ variant = 'default', width, height, alt = 'Coco B Isla', className, priority }: LogoProps) {
  return (
    <Image
      src={LOGO_SRC[variant]}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
