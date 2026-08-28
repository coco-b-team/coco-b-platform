// Línea — rombo — línea, en el color de acento. Mismo motivo que usa el
// isotipo del logo, ya presente en SplashScreen y el ornamento de esquina
// de InquiryModal — se extrajo acá para reusarlo como separador chico bajo
// los encabezados de sección, en vez de que cada sección viva sin ningún
// acento decorativo propio.
export function DiamondDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      width="120"
      height="12"
      viewBox="0 0 120 12"
      className={`text-accent ${className}`}
      aria-hidden="true"
    >
      <line x1="0" y1="6" x2="48" y2="6" stroke="currentColor" strokeWidth="1" opacity={0.5} />
      <rect
        x="55"
        y="1"
        width="10"
        height="10"
        transform="rotate(45 60 6)"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity={0.7}
      />
      <line x1="72" y1="6" x2="120" y2="6" stroke="currentColor" strokeWidth="1" opacity={0.5} />
    </svg>
  );
}
