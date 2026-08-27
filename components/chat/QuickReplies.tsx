export type QuickReplyOption = { id: string; label: string };

export function QuickReplies({
  options,
  onSelect,
}: {
  options: QuickReplyOption[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className="rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-background-tint"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
