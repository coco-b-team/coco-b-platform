import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function Header() {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
        <Link href="/" aria-label="Coco B Isla — inicio">
          <Logo width={141} height={27} priority />
        </Link>
      </div>
    </header>
  );
}
