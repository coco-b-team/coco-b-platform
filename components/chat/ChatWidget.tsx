'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FaCommentDots, FaXmark, FaPaperPlane } from 'react-icons/fa6';
import { ChatMessageBubble, type ChatRole } from './ChatMessageBubble';
import { QuickReplies } from './QuickReplies';
import { VillaResultCard } from './VillaResultCard';
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

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[] | null>(INITIAL_QUICK_REPLIES);
  const [recommenderStep, setRecommenderStep] = useState<RecommenderStep>('idle');
  const [pendingGroupSize, setPendingGroupSize] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, quickReplies]);

  async function sendToAssistant(history: Message[]) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      // Los límites de uso (429) igual vienen con un "reply" en tono de
      // concierge — se muestran como mensaje normal, no como error.
      if (data.reply) {
        setMessages([...history, { role: 'model', content: data.reply }]);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
    } catch {
      setError('No pudimos responder en este momento. Intenta de nuevo en un rato.');
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
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat con el concierge de Coco B Isla"
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background shadow-lg transition-colors hover:bg-primary-light"
        >
          <FaCommentDots size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:max-h-[80vh] sm:w-[380px] sm:rounded-xl sm:border sm:border-border sm:shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={20} height={20} className="h-5 w-auto" />
              <p className="font-semibold">Coco B Concierge</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
              className="text-text-muted hover:text-text"
            >
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
            {error && <p className="text-sm text-error">{error}</p>}
          </div>

          {quickReplies && !isLoading && <QuickReplies options={quickReplies} onSelect={handleQuickReply} />}

          <div className="flex items-center gap-2 border-t border-border p-3">
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
      )}
    </>
  );
}
