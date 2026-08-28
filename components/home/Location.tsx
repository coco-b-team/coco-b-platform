import { FaLocationDot } from 'react-icons/fa6';
import { getSiteLocation } from '@/lib/wp/client';
import { DiamondDivider } from '@/components/ui/DiamondDivider';

export async function Location() {
  const location = await getSiteLocation();

  return (
    <section className="bg-background-alt py-16">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">Find Us</p>
            <h2 className="font-body mt-3 text-3xl font-light sm:text-4xl">{location.heading}</h2>
            <DiamondDivider className="mt-5" />
            <p className="text-text-muted mt-6 max-w-2xl">{location.description}</p>
          </div>

          <div className="border-border overflow-hidden rounded-xl border">
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
            <div className="bg-background-alt flex flex-col items-center gap-3 py-10 lg:hidden">
              <span className="bg-primary text-background flex h-14 w-14 items-center justify-center rounded-full">
                <FaLocationDot size={22} />
              </span>
              <p className="border-border bg-background text-primary border px-4 py-2 text-sm font-semibold tracking-widest uppercase">
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
