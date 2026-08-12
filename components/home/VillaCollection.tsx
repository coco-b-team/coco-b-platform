import { VillaCard } from './VillaCard';
import type { Villa } from '@/lib/wp/types';

export function VillaCollection({ villas }: { villas: Villa[] }) {
  const visible = villas.filter((v) => v.showOnLanding);
  if (visible.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="font-body text-2xl font-normal">Our Villa Collection</h2>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
        {visible.map((villa) => (
          <VillaCard key={villa.id} villa={villa} />
        ))}
      </div>
    </section>
  );
}
