import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa6';
import { getContacts } from '@/lib/wp/client';
import type { Contact } from '@/lib/wp/types';

// Respaldo por si WordPress no responde o todavía no tiene contactos
// cargados — mismo contenido que estaba fijo en el código antes.
const FALLBACK_CONTACTS: Contact[] = [
  { id: -1, title: 'Villa Groups', email: 'jeffrey@cocobisla.com', phone: '+1 206 579 0798', sortOrder: 1 },
  { id: -2, title: 'Reservations', email: 'reservations@cocobisla.com', phone: '+52 998 315 4343', sortOrder: 2 },
  { id: -3, title: 'Concierge', email: '7 a.m. to 11 p.m. Central', phone: '+52 998 209 6937', sortOrder: 3 },
];

const socialLinks = [
  { href: 'https://www.facebook.com/cocobisla/', label: 'Facebook', Icon: FaFacebook },
  { href: 'https://www.instagram.com/cocobisla.mx/', label: 'Instagram', Icon: FaInstagram },
  { href: 'https://www.youtube.com/channel/UC3J2ZwMILjW1dFvrMBl-ZGQ', label: 'YouTube', Icon: FaYoutube },
  { href: 'https://www.tiktok.com/tag/cocobisla', label: 'TikTok', Icon: FaTiktok },
];

export async function Footer() {
  const t = await getTranslations('footer');
  const fetched = await getContacts();
  const contactBlocks = fetched.length > 0 ? fetched : FALLBACK_CONTACTS;

  return (
    <footer className="w-full bg-text py-16 text-background">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {/* En tablet/desktop, el logo + las 3 columnas quedan centrados como
            un solo bloque en el medio de la sección (antes se pegaban al
            borde izquierdo del contenedor completo). En mobile este ancho
            no aplica — ver el listado compacto más abajo. */}
        <div className="sm:mx-auto sm:max-w-3xl">
          <Image
            src="/logo-mark-white.png"
            alt="Coco B Isla"
            width={120}
            height={100}
            className="mb-12 h-16 w-auto"
          />

          {/* Mobile: lista compacta (título + "correo · teléfono" en una
              sola línea, separada por una línea sutil) — antes eran 3 líneas
              por bloque y quedaba muy largo. */}
          <div className="divide-y divide-white/10 sm:hidden">
            {contactBlocks.map((block) => (
              <div key={block.id} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold tracking-widest text-accent uppercase">{block.title}</p>
                <p className="mt-1 text-text-muted">
                  {block.email} · {block.phone}
                </p>
              </div>
            ))}
          </div>

          {/* Tablet/desktop: las 3 columnas completas, como antes. */}
          <div className="hidden gap-10 sm:grid sm:grid-cols-3">
            {contactBlocks.map((block) => (
              <div key={block.id}>
                <p className="text-sm font-semibold tracking-widest text-accent uppercase">{block.title}</p>
                <p className="mt-3 text-text-muted">{block.email}</p>
                <p className="mt-1 text-text-muted">{block.phone}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/privacy-policy" className="text-text-muted hover:text-background">
            {t('privacyPolicy')}
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
