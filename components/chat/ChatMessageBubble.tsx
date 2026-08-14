export type ChatRole = 'user' | 'model';

export function ChatMessageBubble({ role, content }: { role: ChatRole; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
          isUser ? 'bg-primary text-background' : 'bg-background-alt text-text'
        }`}
      >
        {content}
      </div>
    </div>
  );
}
