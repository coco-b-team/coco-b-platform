import Image from 'next/image';
import { getServices } from '@/lib/wp/client';
import { DiamondDivider } from '@/components/ui/DiamondDivider';
import type { Service } from '@/lib/wp/types';

const ICONS: Record<string, string> = {
  clock: '/icons/clock.svg',
  spa: '/icons/flower.svg',
  chef: '/icons/kitchen.svg',
  star: '/icons/star.svg',
  boat: '/icons/boat.svg',
  anchor: '/icons/anchor.svg',
};

// Respaldo por si WordPress no responde o todavía no tiene servicios
// cargados — mismo contenido que estaba fijo en el código antes.
const FALLBACK_SERVICES: Service[] = [
  { id: -1, label: '24 HR Concierge', icon: 'clock', sortOrder: 1 },
  { id: -2, label: 'Yoga & Wellness', icon: 'spa', sortOrder: 2 },
  { id: -3, label: 'Chef Services', icon: 'chef', sortOrder: 3 },
  { id: -4, label: 'Weddings & Events', icon: 'star', sortOrder: 4 },
  { id: -5, label: 'Private Boat Transfers', icon: 'boat', sortOrder: 5 },
  { id: -6, label: 'Excursions & Activities', icon: 'anchor', sortOrder: 6 },
];

export async function ComplementYourStay() {
  const fetched = await getServices();
  const services = fetched.length > 0 ? fetched : FALLBACK_SERVICES;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 text-center sm:px-10">
      <p className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">Amenities</p>
      <h2 className="font-body mt-3 text-3xl font-light sm:text-4xl">Complement Your Stay</h2>
      <div className="mt-5 flex justify-center">
        <DiamondDivider />
      </div>
      <p className="text-text-muted mx-auto mt-6 max-w-2xl">
        We have some extra services to make your time with us more comfortable.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="flex flex-col items-center gap-3 text-center">
            <span className="bg-background-tint flex h-16 w-16 items-center justify-center rounded-full">
              <Image src={ICONS[service.icon] ?? '/icons/star.svg'} alt="" width={24} height={24} />
            </span>
            <p className="text-sm tracking-wide uppercase">{service.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
