import { FaClock, FaSpa, FaUtensils, FaStar, FaSailboat, FaAnchor } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { getServices } from '@/lib/wp/client';
import type { Service } from '@/lib/wp/types';

const ICONS: Record<string, IconType> = {
  clock: FaClock,
  spa: FaSpa,
  chef: FaUtensils,
  star: FaStar,
  boat: FaSailboat,
  anchor: FaAnchor,
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
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="font-body text-2xl font-normal">Complement Your Stay</h2>
      <p className="mt-4 max-w-2xl text-text-muted">
        We have some extra services to make your time with us more comfortable.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
        {services.map((service) => {
          const Icon = ICONS[service.icon] ?? FaStar;
          return (
            <div key={service.id} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-tint text-text">
                <Icon size={24} />
              </span>
              <p className="text-sm tracking-wide uppercase">{service.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
