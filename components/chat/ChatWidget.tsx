'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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
const INITIAL_QUICK_REPLIES: { id: 'viewVillas' | 'howToBook' | 'recommend'; labelKey: string }[] = [
  { id: 'viewVillas', labelKey: 'quickReply.viewVillas' },
  { id: 'howToBook', labelKey: 'quickReply.howToBook' },
  { id: 'recommend', labelKey: 'quickReply.recommend' },
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
function useIsCompact() {
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isCompact;
}

type QuickReplyKind = 'initial' | 'groupSize' | 'interest' | null;

export function ChatWidget() {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const isCompact = useIsCompact();
  // Se calcula solo en el primer render (mensaje de bienvenida) — si el
  // idioma cambia después, este mensaje ya enviado no se retraduce solo,
  // igual que el resto del historial de la conversación.
  const [messages, setMessages] = useState<Message[]>(() => [{ role: 'model', content: t('welcome') }]);
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

  async function fetchRecommendation(groupSize: number, interest: string) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupSize, interest }),
        signal: AbortSignal.timeout(15000),
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

    // Sugerencias iniciales que van directo al chat libre (Gemini)
    const initialOption = INITIAL_QUICK_REPLIES.find((o) => o.id === id);
    sendFreeTextMessage(initialOption ? t(initialOption.labelKey) : id);
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
        <div
          className={`fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3 transition-all duration-500 ease-out ${
            entered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {showGreeting && (
            <div className="relative max-w-55 rounded-2xl rounded-br-sm bg-background px-4 py-3 text-sm text-text shadow-xl ring-1 ring-border">
              <button
                onClick={() => setShowGreeting(false)}
                aria-label={t('closeSuggestionAriaLabel')}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-text text-background"
              >
                <FaXmark size={10} />
              </button>
              {t('greeting')}
            </div>
          )}

          <button
            onClick={openChat}
            aria-label={t('openChatAriaLabel')}
            className="flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-primary text-background shadow-lg shadow-primary/30 ring-1 ring-white/10 transition-all hover:scale-105 hover:bg-primary-light active:scale-95 sm:w-auto sm:justify-start sm:px-5"
          >
            <FaCommentDots size={22} className="shrink-0" />
            <span className="hidden text-sm font-medium tracking-wide sm:inline">{t('conciergeLabel')}</span>
          </button>
        </div>
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
            className={`fixed inset-x-0 bottom-0 z-50 flex h-[85vh] max-h-160 flex-col rounded-t-2xl bg-background shadow-xl transition-all duration-300 ease-out sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-150 sm:max-h-[80vh] sm:w-95 sm:translate-y-0 sm:rounded-xl sm:border sm:border-border ${
              panelVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Logo alt="" width={20} height={20} className="h-5 w-auto" />
                <p className="font-semibold">{t('headerTitle')}</p>
              </div>
              <button onClick={closeChat} aria-label={t('closeChatAriaLabel')} className="text-text-muted hover:text-text">
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
                  <div className="rounded-2xl bg-background-alt px-4 py-2.5 text-sm text-text-muted">
                    {t('typing')}
                  </div>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-error">{error}</p>
                  <button
                    onClick={retryLastMessage}
                    className="shrink-0 text-sm font-medium text-primary hover:text-primary-light hover:underline"
                  >
                    {t('retry')}
                  </button>
                </div>
              )}
            </div>

            {quickReplyOptions && !isLoading && <QuickReplies options={quickReplyOptions} onSelect={handleQuickReply} />}

            <div className="flex shrink-0 items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('inputPlaceholder')}
                aria-label={t('inputAriaLabel')}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-60"
              />
              <button
                onClick={() => {
                  setQuickReplyKind(null);
                  setRecommenderStep('idle');
                  sendFreeTextMessage(input);
                }}
                disabled={isLoading || !input.trim()}
                aria-label={t('sendAriaLabel')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-background transition-colors hover:bg-primary-light disabled:opacity-40"
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
