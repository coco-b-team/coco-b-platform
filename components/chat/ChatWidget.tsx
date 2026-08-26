'use client';

import { useEffect, useRef, useState } from 'react';
import { FaCommentDots, FaXmark, FaPaperPlane } from 'react-icons/fa6';
import { ChatMessageBubble, type ChatRole } from './ChatMessageBubble';
import { QuickReplies } from './QuickReplies';
import { VillaResultCard } from './VillaResultCard';
import { Logo } from '@/components/ui/Logo';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import type { Villa } from '@/lib/wp/types';

type Message = { role: ChatRole; content: string; villa?: Villa };

const WELCOME_MESSAGE: Message = {
  role: 'model',
  content: '¡Hola! Soy el concierge de Coco B Isla. ¿En qué puedo ayudarte a planear tu estadía?',
};

const INITIAL_QUICK_REPLIES = ['Ver villas', '¿Cómo reservo?', 'Recomiéndame una villa'];

const GROUP_SIZE_OPTIONS: { label: string; value: number }[] = [
  { label: '1–4 personas', value: 4 },
  { label: '5–8 personas', value: 8 },
  { label: '9–14 personas', value: 12 },
  { label: '15+ personas', value: 20 },
];

const INTEREST_OPTIONS: { label: string; value: string }[] = [
  { label: 'Familia o grupo', value: 'family' },
  { label: 'Boda o evento', value: 'wedding' },
  { label: 'Retiro corporativo', value: 'corporate' },
  { label: 'Bienestar y relajación', value: 'wellness' },
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

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const isCompact = useIsCompact();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Guarda el historial que falló para que "Reintentar" pueda reenviar el
  // mismo mensaje sin que el usuario tenga que volver a escribirlo — la
  // capa gratuita de Gemini devuelve 503 ("mucha demanda") con cierta
  // frecuencia, y ya reintentamos una vez del lado del servidor, pero a
  // veces hace falta un segundo intento.
  const [failedHistory, setFailedHistory] = useState<Message[] | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[] | null>(INITIAL_QUICK_REPLIES);
  const [recommenderStep, setRecommenderStep] = useState<RecommenderStep>('idle');
  const [pendingGroupSize, setPendingGroupSize] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, quickReplies]);

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
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
    } catch {
      setError('No pudimos responder en este momento. Intenta de nuevo en un rato.');
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
    setQuickReplies(null);
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
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Según lo que me cuentas, esta es mi recomendación:' },
        { role: 'model', content: '', villa: data.villa },
      ]);
    } catch {
      setError('No pudimos generar una recomendación en este momento. Intenta de nuevo en un rato.');
    } finally {
      setIsLoading(false);
      setRecommenderStep('idle');
    }
  }

  function handleQuickReply(label: string) {
    setQuickReplies(null);

    if (recommenderStep === 'idle' && label === 'Recomiéndame una villa') {
      const nextMessages = [
        ...messages,
        { role: 'user' as const, content: label },
        { role: 'model' as const, content: '¡Con gusto! ¿Para cuántas personas es tu estadía?' },
      ];
      setMessages(nextMessages);
      setRecommenderStep('askingGroupSize');
      setQuickReplies(GROUP_SIZE_OPTIONS.map((o) => o.label));
      return;
    }

    if (recommenderStep === 'askingGroupSize') {
      const option = GROUP_SIZE_OPTIONS.find((o) => o.label === label);
      if (!option) return;
      setPendingGroupSize(option.value);
      const nextMessages = [
        ...messages,
        { role: 'user' as const, content: label },
        { role: 'model' as const, content: '¿Qué buscan principalmente en su estadía?' },
      ];
      setMessages(nextMessages);
      setRecommenderStep('askingInterest');
      setQuickReplies(INTEREST_OPTIONS.map((o) => o.label));
      return;
    }

    if (recommenderStep === 'askingInterest') {
      const option = INTEREST_OPTIONS.find((o) => o.label === label);
      if (!option || pendingGroupSize === null) return;
      setMessages((prev) => [...prev, { role: 'user', content: label }]);
      fetchRecommendation(pendingGroupSize, option.value);
      return;
    }

    // Sugerencias iniciales que van directo al chat libre (Gemini)
    sendFreeTextMessage(label);
  }

  function retryLastMessage() {
    if (failedHistory) sendToAssistant(failedHistory);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      setQuickReplies(null);
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
                aria-label="Cerrar sugerencia"
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-text text-background"
              >
                <FaXmark size={10} />
              </button>
              ¿Te ayudo a planear tu estadía en Isla Mujeres?
            </div>
          )}

          <button
            onClick={openChat}
            aria-label="Abrir chat con el concierge de Coco B Isla"
            className="flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-primary text-background shadow-lg shadow-primary/30 ring-1 ring-white/10 transition-all hover:scale-105 hover:bg-primary-light active:scale-95 sm:w-auto sm:justify-start sm:px-5"
          >
            <FaCommentDots size={22} className="shrink-0" />
            <span className="hidden text-sm font-medium tracking-wide sm:inline">Concierge</span>
          </button>
        </div>
      )}

      {isOpen && (
        <>
          {/* Fondo oscurecido — solo en mobile, donde la ficha se comporta
              como una hoja sobre el contenido. En tablet y desktop es
              apenas una tarjeta flotante y no lo necesita. */}
          <button
            aria-label="Cerrar chat"
            onClick={closeChat}
            className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 sm:hidden ${
              panelVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            ref={trapRef as React.RefObject<HTMLDivElement>}
            role={isCompact ? 'dialog' : undefined}
            aria-modal={isCompact ? true : undefined}
            aria-label={isCompact ? 'Chat con el concierge de Coco B Isla' : undefined}
            tabIndex={-1}
            className={`fixed inset-x-0 bottom-0 z-50 flex h-[85vh] max-h-160 flex-col rounded-t-2xl bg-background shadow-xl transition-all duration-300 ease-out sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-150 sm:max-h-[80vh] sm:w-95 sm:translate-y-0 sm:rounded-xl sm:border sm:border-border ${
              panelVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Logo alt="" width={20} height={20} className="h-5 w-auto" />
                <p className="font-semibold">Coco B Concierge</p>
              </div>
              <button onClick={closeChat} aria-label="Cerrar chat" className="text-text-muted hover:text-text">
                <FaXmark size={18} />
              </button>
            </div>

            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Conversación con el concierge"
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
                    Escribiendo…
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
                    Reintentar
                  </button>
                </div>
              )}
            </div>

            {quickReplies && !isLoading && <QuickReplies options={quickReplies} onSelect={handleQuickReply} />}

            <div className="flex shrink-0 items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje…"
                aria-label="Escribe tu mensaje al concierge"
                disabled={isLoading}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-60"
              />
              <button
                onClick={() => {
                  setQuickReplies(null);
                  setRecommenderStep('idle');
                  sendFreeTextMessage(input);
                }}
                disabled={isLoading || !input.trim()}
                aria-label="Enviar mensaje"
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
