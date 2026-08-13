import Link from 'next/link';
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa6';
import { Logo } from '@/components/ui/Logo';

const contactBlocks = [
  { title: 'Villa Groups', email: 'jeffrey@cocobisla.com', phone: '+1 206 579 0798' },
  { title: 'Reservations', email: 'reservations@cocobisla.com', phone: '+52 998 315 4343' },
  { title: 'Concierge', email: '7 a.m. to 11 p.m. Central', phone: '+52 998 209 6937' },
];

const socialLinks = [
  { href: 'https://facebook.com', label: 'Facebook', Icon: FaFacebook },
  { href: 'https://instagram.com', label: 'Instagram', Icon: FaInstagram },
  { href: 'https://youtube.com', label: 'YouTube', Icon: FaYoutube },
  { href: 'https://tiktok.com', label: 'TikTok', Icon: FaTiktok },
];

export function Footer() {
  return (
    <footer className="w-full bg-text py-16 text-background">
      <div className="mx-auto max-w-6xl px-6">
        <Logo variant="white" width={177} height={14} className="mb-12 h-auto w-44" />

        <div className="grid gap-10 sm:grid-cols-3">
          {contactBlocks.map((block) => (
            <div key={block.title}>
              <p className="text-sm font-semibold tracking-widest text-accent uppercase">{block.title}</p>
              <p className="mt-3 text-text-muted">{block.email}</p>
              <p className="mt-1 text-text-muted">{block.phone}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/privacy-policy" className="text-text-muted hover:text-background">
            Privacy Policy
          </Link>
          <div className="flex gap-4">
            {socialLinks.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-text-muted hover:text-background">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
