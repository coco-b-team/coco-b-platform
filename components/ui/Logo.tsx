import Image from 'next/image';

type LogoVariant = 'default' | 'white' | 'splash';

const LOGO_SRC: Record<LogoVariant, string> = {
  default: '/logo.svg',
  white: '/logo-white.svg',
  // Mismo isotipo e ícono que el logo real (colores originales), pero con
  // el texto en blanco en vez de negro — para que se lea directo sobre el
  // fondo oscuro del splash, sin necesitar una placa de color detrás.
  splash: '/logo-splash.svg',
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
