import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
        <Link href="/" aria-label="Coco B Isla — inicio">
          <Image src="/logo.svg" alt="Coco B Isla" width={141} height={27} priority />
        </Link>
      </div>
    </header>
  );
}
