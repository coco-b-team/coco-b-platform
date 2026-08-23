import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { MobileNav } from '@/components/layout/MobileNav';
import { NAV_LINKS } from '@/lib/navLinks';

export function Header() {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="Coco B Isla — inicio">
          <Logo width={141} height={27} priority />
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
