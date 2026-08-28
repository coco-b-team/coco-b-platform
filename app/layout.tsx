import type { Metadata, Viewport } from 'next';
import { Raleway } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import './globals.css';

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Coco B Isla',
  description: 'Villas exclusivas en Isla Mujeres, México',
};

// El sitio es solo-claro (no tiene tema oscuro implementado) — sin esto,
// navegadores móviles con "oscurecer sitios web" activado (Edge y Chrome
// en Android lo traen bastante expuesto) reinvierten colores y texto por
// su cuenta, rompiendo el contraste en todo el sitio.
export const viewport: Viewport = {
  colorScheme: 'light',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${raleway.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
