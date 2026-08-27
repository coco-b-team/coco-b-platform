import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const FALLBACK_HOSTNAME = '146-181-43-63.nip.io';

function wordpressHostname(): string {
  const url = process.env.WORDPRESS_SITE_URL || process.env.WORDPRESS_API_URL;
  if (!url) return FALLBACK_HOSTNAME;
  try {
    return new URL(url).hostname;
  } catch {
    return FALLBACK_HOSTNAME;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: wordpressHostname(),
      },
      // Para cuando alguien del equipo corre WordPress local en su compu
      // (WORDPRESS_API_URL apuntando a localhost, como en .env.example).
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // Avatares generados para reseñas sin foto real de autor cargada.
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
