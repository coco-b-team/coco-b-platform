import { FaLocationDot } from 'react-icons/fa6';

export function Location() {
  return (
    <section className="bg-background-alt py-16">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <h2 className="font-body text-2xl font-normal">A Privileged Location</h2>
        <p className="mt-4 max-w-2xl text-text-muted">
          Just a 20 minute ride off the coast of Cancun, you&apos;ll find Isla Mujeres, the
          island of women, floating in the turquoise blue waters of the Caribbean. The
          privileged location of Coco B Isla Villas lets you enjoy an oasis like escape from the
          hustle and bustle of city life, yet be just minutes away from the beach and family
          experiences.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-border">
          <iframe
            title="Ubicación de Coco B Isla Villas"
            src="https://www.google.com/maps?q=Isla+Mujeres,+Quintana+Roo,+Mexico&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-col items-center gap-3 bg-background-alt py-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background">
              <FaLocationDot size={22} />
            </span>
            <p className="border border-border bg-background px-4 py-2 text-sm font-semibold tracking-widest text-primary uppercase">
              Coco B Isla Villas
            </p>
            <p className="text-text-muted">Isla Mujeres, México</p>
          </div>
        </div>
      </div>
    </section>
  );
}
