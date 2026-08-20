import Image from 'next/image';

// Para paquetes combinados: muestra las dos villas lado a lado en la misma
// imagen, en vez de un carrusel — refuerza visualmente que son 2
// propiedades combinadas, no fotos distintas de una sola.
export function SplitCardImage({ images, alt }: { images: string[]; alt: string }) {
  if (images.length === 0) {
    return <div className="h-64 bg-background-alt" />;
  }

  if (images.length === 1) {
    return (
      <div className="relative h-64 bg-background-alt">
        <Image src={images[0]} alt={alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
      </div>
    );
  }

  return (
    <div className="flex h-64 bg-background-alt">
      {images.slice(0, 2).map((src, i) => (
        <div key={i} className="relative flex-1">
          <Image src={src} alt={`${alt} — foto ${i + 1}`} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
