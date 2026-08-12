import { FaClock, FaSpa, FaUtensils, FaStar, FaSailboat, FaAnchor } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

const services: { label: string; Icon: IconType }[] = [
  { label: '24 HR Concierge', Icon: FaClock },
  { label: 'Yoga & Wellness', Icon: FaSpa },
  { label: 'Chef Services', Icon: FaUtensils },
  { label: 'Weddings & Events', Icon: FaStar },
  { label: 'Private Boat Transfers', Icon: FaSailboat },
  { label: 'Excursions & Activities', Icon: FaAnchor },
];

export function ComplementYourStay() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="font-body text-2xl font-normal">Complement Your Stay</h2>
      <p className="mt-4 max-w-2xl text-text-muted">
        We have some extra services to make your time with us more comfortable.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
        {services.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background-tint text-text">
              <Icon size={24} />
            </span>
            <p className="text-sm tracking-wide uppercase">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
