import { PackageCard } from './PackageCard';
import type { Package } from '@/lib/wp/types';

export function MixAndMatch({ packages }: { packages: Package[] }) {
  const visible = packages.filter((p) => p.showOnLanding);
  if (visible.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="font-body text-2xl font-normal">Mix & Match</h2>
      <p className="mt-4 max-w-2xl text-text-muted">
        Pair two side-by-side villas for larger groups. Each combination gives you double the
        space, two pools, and a seamlessly shared stretch of private beachfront.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {visible.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}
