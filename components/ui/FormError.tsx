import { FaCircleExclamation } from 'react-icons/fa6';

export function FormError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-error bg-error/5 px-4 py-3 text-sm text-error">
      <FaCircleExclamation size={16} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
