import type { Metadata } from 'next';
import { getVillas } from '@/lib/wp/client';
import { VillaCard } from '@/components/home/VillaCard';

export const metadata: Metadata = {
  title: 'Villas | Coco B Isla',
  description: 'Explora la colección completa de villas de Coco B Isla en Isla Mujeres, México.',
};

export default async function VillasPage() {
  const villas = await getVillas();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h1 className="font-body text-2xl font-normal">Our Villas</h1>
      {villas.length === 0 ? (
        <p className="mt-8 text-text-muted">No hay villas disponibles en este momento.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>
      )}
    </section>
  );
}
