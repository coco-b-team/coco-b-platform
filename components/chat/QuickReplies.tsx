export function QuickReplies({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (label: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {options.map((label) => (
        <button
          key={label}
          onClick={() => onSelect(label)}
          className="rounded-full border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-background-tint"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
