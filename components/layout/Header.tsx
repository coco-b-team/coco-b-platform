'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { MobileNav } from '@/components/layout/MobileNav';
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

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-background transition-shadow duration-300 ${
        scrolled ? 'border-b border-transparent shadow-md' : 'border-b border-border'
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? 'py-2.5' : 'py-4'
        }`}
      >
        <Link href="/" aria-label="Coco B Isla — inicio" className="origin-left transition-transform duration-300">
          <Logo width={141} height={27} priority className={`transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`} />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-1 text-sm font-medium tracking-widest text-text uppercase transition-colors hover:text-primary"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
