export type ChatRole = 'user' | 'model';

// El único formato que el system prompt le permite usar al modelo es
// **negrita** — se parte el texto en ese patrón y se alterna texto plano
// con <strong>, sin sumar una librería de markdown para esto solo.
function renderWithBold(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function ChatMessageBubble({ role, content }: { role: ChatRole; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
          isUser ? 'bg-primary text-background' : 'bg-background-alt text-text'
        }`}
      >
        {renderWithBold(content)}
      </div>
    </div>
  );
}
