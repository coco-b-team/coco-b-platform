'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FaCommentDots, FaXmark, FaPaperPlane } from 'react-icons/fa6';
import { ChatMessageBubble, type ChatRole } from './ChatMessageBubble';
import { QuickReplies, type QuickReplyOption } from './QuickReplies';
import { VillaResultCard } from './VillaResultCard';
import { Logo } from '@/components/ui/Logo';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import type { Villa } from '@/lib/wp/types';

type Message = { role: ChatRole; content: string; villa?: Villa };

// Ids estables, sin traducir — el estado del recomendador y las
// comparaciones de la lógica se basan en estos ids, nunca en el texto
// visible (que sí cambia con el idioma). `labelKey` apunta a
// messages/*.json → chat.<namespace>.<key>.
const INITIAL_QUICK_REPLIES: {
  id: 'viewVillas' | 'howToBook' | 'recommend' | 'askSomethingElse';
  labelKey: string;
}[] = [
  { id: 'viewVillas', labelKey: 'quickReply.viewVillas' },
  { id: 'howToBook', labelKey: 'quickReply.howToBook' },
  { id: 'recommend', labelKey: 'quickReply.recommend' },
  { id: 'askSomethingElse', labelKey: 'quickReply.askSomethingElse' },
];

const GROUP_SIZE_OPTIONS: { id: string; labelKey: string; value: number }[] = [
  { id: 'g1', labelKey: 'groupSize.g1', value: 4 },
  { id: 'g2', labelKey: 'groupSize.g2', value: 8 },
  { id: 'g3', labelKey: 'groupSize.g3', value: 12 },
  { id: 'g4', labelKey: 'groupSize.g4', value: 20 },
];

const INTEREST_OPTIONS: { id: string; labelKey: string; value: string }[] = [
  { id: 'family', labelKey: 'interest.family', value: 'family' },
  { id: 'wedding', labelKey: 'interest.wedding', value: 'wedding' },
  { id: 'corporate', labelKey: 'interest.corporate', value: 'corporate' },
  { id: 'wellness', labelKey: 'interest.wellness', value: 'wellness' },
];

type RecommenderStep = 'idle' | 'askingGroupSize' | 'askingInterest';

// Retraso antes de invitar a interactuar con una burbuja de saludo —
// se muestra una sola vez por carga de página, después del pequeño
// delay de entrada del botón, para que no compita con el splash screen.
const ENTER_DELAY_MS = 400;
const GREETING_DELAY_MS = 3600;

// Solo mobile (no tablet): el chat se abre como una ficha que sube desde
// abajo, no como una tapa de pantalla completa. En tablet y desktop
// queda igual, como la tarjeta flotante de siempre.
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

// Mientras la tarjeta anclada al hero (`#hero-chat-slot`, ver Hero.tsx)
// sigue a la vista, la burbuja chica de abajo se mantiene oculta — apenas
// esa tarjeta se sale de la pantalla al scrollear, la burbuja aparece en
// su lugar. Importante: se observa la tarjeta en sí, NO el hero completo
// — el hero es mucho más alto que la tarjeta (que vive pegada a su borde
// inferior), así que un umbral basado en cuánto del hero sigue visible
// dispararía el cambio mucho antes de que la tarjeta realmente desaparezca,
// dejando a las dos on screen a la vez.
function useHeroDocked(enabled: boolean) {
  // `intersecting` puede quedar en un valor viejo apenas `enabled` pasa a
  // false (ej. se navega a otra página) — no importa, el `enabled &&` de
  // abajo lo tapa sin necesidad de resetearlo a mano dentro del efecto.
  const [intersecting, setIntersecting] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const slotEl = document.getElementById('hero-chat-slot');
    if (!slotEl) return;
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting));
    observer.observe(slotEl);
    return () => observer.disconnect();
  }, [enabled]);
  return enabled && intersecting;
}

type QuickReplyKind = 'initial' | 'groupSize' | 'interest' | null;

export function ChatWidget() {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const isCompact = useMediaQuery('(max-width: 639px)');
  // Desktop real (lg+) — el chat "anclado al hero" solo tiene sentido ahí;
  // en tablet/mobile el hero es demasiado angosto para alojarlo.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isHomePage = usePathname() === '/';
  const heroDocked = useHeroDocked(isHomePage && isDesktop);
  // Nodo real del slot dentro del Hero (ver Hero.tsx) — se busca en un
  // efecto porque el DOM recién existe del lado del cliente. `createPortal`
  // hace que la tarjeta vinculada al hero sea un hijo de verdad de ese
  // slot, no un overlay fixed aparte, así se desplaza con el resto del
  // contenido al scrollear en vez de flotar sobre el viewport.
  const [heroSlot, setHeroSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // Reacciona a `isHomePage`/`isDesktop` (ej. se navega a "/" desde otra
    // página sin recargar, y ChatWidget nunca se desmonta porque vive en
    // el layout) — no es el típico "estado derivado" que el lint prefiere
    // calcular en el render: `document.getElementById` es una lectura al
    // DOM real, no algo derivable de props/estado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeroSlot(isHomePage && isDesktop ? document.getElementById('hero-chat-slot') : null);
  }, [isHomePage, isDesktop]);
  // El saludo inicial se recalcula si cambia el idioma, pero solo mientras
  // siga siendo lo único en pantalla (nadie tocó el chat todavía) — apenas
  // hay una conversación real (una pregunta del usuario, una respuesta de
  // Gemini), esa historia ya no se retraduce sola, iría en contra de lo que
  // efectivamente se dijo.
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'model', content: t('welcome') },
  ]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages((prev) => (prev.length === 1 ? [{ role: 'model', content: t('welcome') }] : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guarda el historial que falló para que "Reintentar" pueda reenviar el
  // mismo mensaje sin que el usuario tenga que volver a escribirlo — la
  // capa gratuita de Gemini devuelve 503 ("mucha demanda") con cierta
  // frecuencia, y ya reintentamos una vez del lado del servidor, pero a
  // veces hace falta un segundo intento.
  const [failedHistory, setFailedHistory] = useState<Message[] | null>(null);
  // Se guarda solo qué *conjunto* de sugerencias mostrar (no el texto ya
  // traducido) — así, si cambia el idioma a mitad de conversación, las
  // opciones visibles se recalculan solas en el próximo render en vez de
  // quedar pegadas al idioma en el que se generaron.
  const [quickReplyKind, setQuickReplyKind] = useState<QuickReplyKind>('initial');
  const [recommenderStep, setRecommenderStep] = useState<RecommenderStep>('idle');
  const [pendingGroupSize, setPendingGroupSize] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickReplyOptions: QuickReplyOption[] | null =
    quickReplyKind === 'initial'
      ? INITIAL_QUICK_REPLIES.map((o) => ({ id: o.id, label: t(o.labelKey) }))
      : quickReplyKind === 'groupSize'
        ? GROUP_SIZE_OPTIONS.map((o) => ({ id: o.id, label: t(o.labelKey) }))
        : quickReplyKind === 'interest'
          ? INTEREST_OPTIONS.map((o) => ({ id: o.id, label: t(o.labelKey) }))
          : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, quickReplyKind]);

  useEffect(() => {
    const enterTimer = setTimeout(() => setEntered(true), ENTER_DELAY_MS);
    const greetTimer = setTimeout(() => setShowGreeting(true), GREETING_DELAY_MS);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(greetTimer);
    };
  }, []);

  // En compacto, la ficha se comporta como una hoja sobre el contenido y
  // bloquea el scroll de fondo (y el foco de teclado) mientras está
  // abierta; en desktop es solo una tarjeta chica flotando junto al resto
  // del sitio, así que no hace falta atrapar nada.
  useBodyScrollLock(isOpen && isCompact);
  const trapRef = useFocusTrap(isOpen && isCompact);

  // Animación de entrada de la ficha — igual idioma que el resto del sitio
  // (splash, ficha rápida, modal de reserva).
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => setPanelVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  function openChat() {
    setIsOpen(true);
    setShowGreeting(false);
  }

  function closeChat() {
    setPanelVisible(false);
    setTimeout(() => setIsOpen(false), 250);
  }

  async function sendToAssistant(history: Message[]) {
    setIsLoading(true);
    setError(null);
    setFailedHistory(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        // El servidor ya tiene su propio límite (20s + un reintento) contra
        // Gemini — este es el resguardo del lado del cliente para que,
        // pase lo que pase, "Escribiendo…" no se quede así para siempre.
        signal: AbortSignal.timeout(45000),
      });
      const data = await res.json();
      // Los límites de uso (429) igual vienen con un "reply" en tono de
      // concierge — se muestran como mensaje normal, no como error.
      if (data.reply) {
        const next: Message[] = [...history, { role: 'model', content: data.reply }];
        // Misma villa que ya viene resuelta desde el servidor — se agrega
        // como un mensaje aparte (sin texto) para reusar el mismo render
        // de tarjeta que ya tiene el recomendador.
        if (data.villa) next.push({ role: 'model', content: '', villa: data.villa });
        setMessages(next);
        setQuickReplyKind('initial');
        return;
      }
      if (!res.ok) throw new Error(data.error || t('errorGeneric'));
    } catch {
      setError(t('errorGeneric'));
      setFailedHistory(history);
    } finally {
      setIsLoading(false);
    }
  }

  function sendFreeTextMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    const nextMessages = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setQuickReplyKind(null);
    sendToAssistant(nextMessages);
  }

  async function showVillasList() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/villas/summary', { signal: AbortSignal.timeout(25000) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errorGeneric'));
      const villas: Villa[] = data.villas ?? [];
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: villas.length ? t('viewVillasIntro') : t('viewVillasEmpty') },
        ...villas.map((villa) => ({ role: 'model' as const, content: '', villa })),
      ]);
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
      setQuickReplyKind('initial');
    }
  }

  async function fetchRecommendation(groupSize: number, interest: string) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupSize, interest }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errorRecommend'));
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: t('recommendationIntro') },
        { role: 'model', content: '', villa: data.villa },
      ]);
    } catch {
      setError(t('errorRecommend'));
    } finally {
      setIsLoading(false);
      setRecommenderStep('idle');
      setQuickReplyKind('initial');
    }
  }

  function handleQuickReply(id: string) {
    setQuickReplyKind(null);

    if (recommenderStep === 'idle' && id === 'recommend') {
      const nextMessages = [
        ...messages,
        { role: 'user' as const, content: t('quickReply.recommend') },
        { role: 'model' as const, content: t('askGroupSize') },
      ];
      setMessages(nextMessages);
      setRecommenderStep('askingGroupSize');
      setQuickReplyKind('groupSize');
      return;
    }

    if (recommenderStep === 'idle' && id === 'viewVillas') {
      setMessages((prev) => [...prev, { role: 'user', content: t('quickReply.viewVillas') }]);
      showVillasList();
      return;
    }

    if (recommenderStep === 'idle' && id === 'howToBook') {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: t('quickReply.howToBook') },
        { role: 'model', content: t('howToBookBody') },
      ]);
      setQuickReplyKind('initial');
      return;
    }

    // Escape hatch al chat libre con Gemini: no manda nada todavía, solo
    // invita a escribir y deja el input listo — el próximo mensaje que
    // tipee el usuario es el que viaja directo a la IA.
    if (recommenderStep === 'idle' && id === 'askSomethingElse') {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: t('quickReply.askSomethingElse') },
        { role: 'model', content: t('askSomethingElsePrompt') },
      ]);
      // Los chips siguen disponibles por si prefiere tocar uno en vez de
      // escribir — esto solo invita a escribir, no los reemplaza.
      setQuickReplyKind('initial');
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    if (recommenderStep === 'askingGroupSize') {
      const option = GROUP_SIZE_OPTIONS.find((o) => o.id === id);
      if (!option) return;
      setPendingGroupSize(option.value);
      const nextMessages = [
        ...messages,
        { role: 'user' as const, content: t(option.labelKey) },
        { role: 'model' as const, content: t('askInterest') },
      ];
      setMessages(nextMessages);
      setRecommenderStep('askingInterest');
      setQuickReplyKind('interest');
      return;
    }

    if (recommenderStep === 'askingInterest') {
      const option = INTEREST_OPTIONS.find((o) => o.id === id);
      if (!option || pendingGroupSize === null) return;
      setMessages((prev) => [...prev, { role: 'user', content: t(option.labelKey) }]);
      fetchRecommendation(pendingGroupSize, option.value);
      return;
    }
  }

  function retryLastMessage() {
    if (failedHistory) sendToAssistant(failedHistory);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      setQuickReplyKind(null);
      setRecommenderStep('idle');
      sendFreeTextMessage(input);
    }
  }

  return (
    <>
      {!isOpen && (
        <>
          {/* Anclado al hero de verdad (portado a #hero-chat-slot, ver
              Hero.tsx) — vive en el flujo normal del documento, así que se
              desplaza con el resto del contenido al scrollear en vez de
              flotar sobre el viewport. Eso mismo hace que "se despegue":
              apenas se sale de la vista, deja de tapar nada, y la burbuja
              de abajo aparece en su lugar (ver el bloque siguiente). */}
          {heroSlot &&
            createPortal(
              <button
                onClick={openChat}
                aria-label={t('openChatAriaLabel')}
                aria-hidden={!entered}
                tabIndex={entered ? 0 : -1}
                className={`w-72 rounded-3xl border border-white/15 bg-white/10 p-6 text-left shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/25 hover:bg-white/15 sm:w-80 ${
                  entered
                    ? 'translate-y-0 scale-100 opacity-100 blur-none'
                    : 'translate-y-4 scale-95 opacity-0 blur-sm'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="bg-primary text-background flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.08)]">
                    <FaCommentDots size={12} />
                  </span>
                  <p className="text-background/70 text-xs tracking-widest uppercase">
                    {t('conciergeLabel')}
                  </p>
                </div>
                <p className="font-body text-background mt-4 text-xl leading-snug font-light">
                  {t('heroDockQuestion')}
                </p>
                <div className="bg-primary text-background hover:bg-primary-light shadow-primary/30 mt-5 flex items-center justify-between rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-colors">
                  <span>{t('heroDockCta')}</span>
                  <FaPaperPlane size={12} />
                </div>
              </button>,
              heroSlot,
            )}

          <div
            aria-hidden={!(entered && !heroDocked)}
            className={`fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              entered && !heroDocked
                ? 'translate-y-0 scale-100 opacity-100 blur-none'
                : 'pointer-events-none translate-y-3 scale-90 opacity-0 blur-sm'
            }`}
          >
            {showGreeting && (
              <div className="bg-background text-text ring-border/60 relative max-w-60 rounded-2xl rounded-br-sm px-4 py-3 text-sm shadow-xl ring-1">
                <button
                  onClick={() => setShowGreeting(false)}
                  aria-label={t('closeSuggestionAriaLabel')}
                  tabIndex={entered && !heroDocked ? 0 : -1}
                  className="bg-text text-background absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full"
                >
                  <FaXmark size={10} />
                </button>
                <span className="bg-primary mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" />
                {t('greeting')}
              </div>
            )}

            <div className="relative">
              <span
                aria-hidden="true"
                className="bg-primary/50 absolute inset-0 -z-10 animate-pulse rounded-full blur-lg motion-reduce:animate-none"
              />
              <button
                onClick={openChat}
                aria-label={t('openChatAriaLabel')}
                tabIndex={entered && !heroDocked ? 0 : -1}
                className="from-primary to-primary-light text-background shadow-primary/40 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-linear-to-br shadow-lg ring-1 ring-white/15 transition-all hover:scale-105 hover:shadow-xl active:scale-95 sm:w-auto sm:justify-start sm:px-5"
              >
                <FaCommentDots size={22} className="shrink-0" />
                <span className="hidden text-sm font-medium tracking-wide sm:inline">
                  {t('conciergeLabel')}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {isOpen && (
        <>
          {/* Fondo oscurecido — solo en mobile, donde la ficha se comporta
              como una hoja sobre el contenido. En tablet y desktop es
              apenas una tarjeta flotante y no lo necesita. */}
          <button
            aria-label={t('closeChatAriaLabel')}
            onClick={closeChat}
            className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 sm:hidden ${
              panelVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            ref={trapRef as React.RefObject<HTMLDivElement>}
            role={isCompact ? 'dialog' : undefined}
            aria-modal={isCompact ? true : undefined}
            aria-label={isCompact ? t('panelAriaLabel') : undefined}
            tabIndex={-1}
            className={`bg-background sm:border-border fixed inset-x-0 bottom-0 z-50 flex h-[85vh] max-h-160 flex-col rounded-t-2xl shadow-xl transition-all duration-300 ease-out sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-150 sm:max-h-[80vh] sm:w-95 sm:translate-y-0 sm:rounded-xl sm:border ${
              panelVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Logo alt="" width={20} height={20} className="h-5 w-auto" />
                <p className="font-semibold">{t('headerTitle')}</p>
              </div>
              <button
                onClick={closeChat}
                aria-label={t('closeChatAriaLabel')}
                className="text-text-muted hover:text-text"
              >
                <FaXmark size={18} />
              </button>
            </div>

            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label={t('logAriaLabel')}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m, i) =>
                m.villa ? (
                  <div key={i} className="flex justify-start">
                    <VillaResultCard villa={m.villa} />
                  </div>
                ) : (
                  <ChatMessageBubble key={i} role={m.role} content={m.content} />
                ),
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-background-alt text-text-muted rounded-2xl px-4 py-2.5 text-sm">
                    {t('typing')}
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-error text-sm">{error}</p>
                  <button
                    onClick={retryLastMessage}
                    className="text-primary hover:text-primary-light shrink-0 text-sm font-medium hover:underline"
                  >
                    {t('retry')}
                  </button>
                </div>
              )}
            </div>

            {quickReplyOptions && !isLoading && (
              <QuickReplies options={quickReplyOptions} onSelect={handleQuickReply} />
            )}

            <div className="border-border flex shrink-0 items-center gap-2 border-t p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('inputPlaceholder')}
                aria-label={t('inputAriaLabel')}
                disabled={isLoading}
                className="border-border text-text placeholder:text-text-muted focus:border-primary flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none disabled:opacity-60"
              />
              <button
                onClick={() => {
                  setQuickReplyKind(null);
                  setRecommenderStep('idle');
                  sendFreeTextMessage(input);
                }}
                disabled={isLoading || !input.trim()}
                aria-label={t('sendAriaLabel')}
                className="bg-primary text-background hover:bg-primary-light flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
