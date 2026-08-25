import { FaLocationDot } from 'react-icons/fa6';
import { getSiteLocation } from '@/lib/wp/client';

export async function Location() {
  const location = await getSiteLocation();

  return (
    <section className="bg-background-alt py-16">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h2 className="font-body text-2xl font-normal">{location.heading}</h2>
            <p className="mt-4 max-w-2xl text-text-muted">{location.description}</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="h-64 w-full sm:h-80 lg:h-full">
              <iframe
                title="Ubicación de Coco B Isla Villas"
                src={location.mapUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {/* En desktop el pin del mapa ya lleva la etiqueta del lugar; esta
                tarjeta solo hace falta cuando el mapa es chico (tablet/mobile). */}
            <div className="flex flex-col items-center gap-3 bg-background-alt py-10 lg:hidden">
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
      </div>
    </section>
  );
}
