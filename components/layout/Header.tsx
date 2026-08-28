'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';
import { MobileNav } from '@/components/layout/MobileNav';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { StaffLoginModal } from '@/components/admin/StaffLoginModal';
import { NAV_LINKS } from '@/lib/navLinks';

// "Pegado" arriba mientras se navega (sticky), con una sombra sutil que
// aparece recién al scrollear — así se siente "despegado" del contenido
// en vez de una línea de borde fija todo el tiempo.
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrolled;
}

export function Header() {
  const scrolled = useScrolled();
  const t = useTranslations('nav');
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  return (
    // Envoltorio `sticky` de ancho completo — reserva su lugar en el flujo
    // igual que antes, así nada se corre al cambiar de forma. En desktop
    // (`lg`+), al scrollear le suma un colchón lateral (`lg:px-6 lg:pt-3`)
    // que es justo el espacio donde la barra de abajo "flota" separada de
    // los bordes. En mobile/tablet no se le agrega ese colchón — se queda
    // fija de borde a borde, como ya estaba (no tiene sentido angostar una
    // navbar en una pantalla que ya es chica).
    <header
      className={`sticky top-0 z-40 w-full transition-[padding] duration-500 ease-in-out ${
        scrolled ? 'lg:px-6 lg:pt-3' : ''
      }`}
    >
      {/* La barra visible en sí — acá vive el fondo, el borde/sombra y las
          esquinas redondeadas. Separarla del `<header>` de arriba es lo que
          permite que solo ESTA capa se "despegue" (encoja con margen,
          se redondee, tome blur) sin tocar el tamaño reservado en el flujo.
          Sin scrollear, o en mobile/tablet aunque haya scroll, se queda de
          borde a borde (ancho completo, sin `max-w`) — el `lg:max-w-6xl
          lg:mx-auto` solo entra en juego junto con el resto del efecto
          "flotante", exclusivo de desktop scrolleado. */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          scrolled
            ? 'bg-background lg:border-border/60 lg:bg-background/90 border-b border-transparent shadow-md lg:mx-auto lg:max-w-6xl lg:rounded-2xl lg:border lg:shadow-lg lg:backdrop-blur-md'
            : 'border-border bg-background border-b'
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
            scrolled ? 'py-2.5' : 'py-4'
          }`}
        >
          <Link
            href="/"
            aria-label={t('homeAriaLabel')}
            className="origin-left transition-transform duration-300"
          >
            <Logo
              width={141}
              height={27}
              priority
              className={`transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}
            />
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {NAV_LINKS.map((link) =>
              link.key === 'staff' ? (
                <button
                  key={link.href}
                  onClick={() => setStaffModalOpen(true)}
                  className="group text-text hover:text-primary relative py-1 text-sm font-medium tracking-widest uppercase transition-colors"
                >
                  {t(link.key)}
                  <span className="bg-primary absolute bottom-0 left-0 h-px w-0 transition-all duration-300 ease-out group-hover:w-full" />
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group text-text hover:text-primary relative py-1 text-sm font-medium tracking-widest uppercase transition-colors"
                >
                  {t(link.key)}
                  <span className="bg-primary absolute bottom-0 left-0 h-px w-0 transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
              ),
            )}
            <LanguageSwitcher />
          </nav>

          <MobileNav />
        </div>
      </div>

      {staffModalOpen && <StaffLoginModal onClose={() => setStaffModalOpen(false)} />}
    </header>
  );
}
