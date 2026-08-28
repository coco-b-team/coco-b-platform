import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { SplashScreen } from '@/components/layout/SplashScreen';

// El "cascarón" del sitio público (navbar, footer, splash, chat de IA) —
// separado del layout raíz para que /admin pueda tener el suyo propio,
// sin nada de esto.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
