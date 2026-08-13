import { WORDPRESS_API_URL } from './config';
import { decodeHtmlEntities } from './utils';
import type {
  Villa,
  VillaSummary,
  Retreat,
  Package,
  Testimonial,
  Faq,
  Service,
  Contact,
  Hero,
  SiteLocation,
  WPPost,
  WPVillaAcf,
  WPRetreatAcf,
  WPPackageAcf,
  WPTestimonialAcf,
  WPFaqAcf,
  WPServiceAcf,
  WPContactAcf,
  WPHeroAcf,
  WPLocationAcf,
} from './types';

async function wpFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}${path}`, {
      // 3 minutos — corto para que el equipo vea sus cambios de contenido
      // rápido durante esta etapa de carga; se puede subir más cerca del
      // lanzamiento, cuando el contenido deje de cambiar tan seguido.
      next: { revalidate: 180 },
    });
    if (!res.ok) {
      console.error(`[wp] ${path} respondió ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`[wp] no se pudo conectar a WordPress (${path})`, error);
    return null;
  }
}

async function resolveMediaUrl(id: number | null): Promise<string | null> {
  if (!id) return null;
  const media = await wpFetch<{ source_url: string }>(`/wp/v2/media/${id}`);
  return media?.source_url ?? null;
}

function toNumberOrNull(value: number | string | undefined): number | null {
  if (value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function title(post: WPPost<unknown>): string {
  return decodeHtmlEntities(post.title.rendered);
}

async function mapVilla(post: WPPost<WPVillaAcf>): Promise<Villa> {
  const acf = post.acf;
  const galleryIds = [
    acf.gallery_image_1,
    acf.gallery_image_2,
    acf.gallery_image_3,
    acf.gallery_image_4,
    acf.gallery_image_5,
  ].filter((id): id is number => Boolean(id));

  const [mainImage, rawGallery] = await Promise.all([
    resolveMediaUrl(acf.main_image),
    Promise.all(galleryIds.map(resolveMediaUrl)),
  ]);

  // Algunas villas tienen la misma foto cargada como imagen principal y
  // como parte de la galería — se deduplica acá, una sola vez, en vez de
  // que cada pantalla que use esta villa tenga que hacerlo por su cuenta.
  const gallery = [...new Set(rawGallery.filter((url): url is string => Boolean(url)))].filter(
    (url) => url !== mainImage,
  );

  return {
    id: post.id,
    slug: post.slug,
    title: title(post),
    label: acf.label ?? '',
    shortDescription: acf.short_description ?? '',
    longDescription: acf.long_description ?? '',
    mainImage,
    gallery,
    suiteCapacity: toNumberOrNull(acf.suite_capacity),
    guestCapacity: toNumberOrNull(acf.guest_capacity),
    bedrooms: toNumberOrNull(acf.bedrooms),
    bathrooms: toNumberOrNull(acf.bathrooms),
    minimumStayNights: toNumberOrNull(acf.minimum_stay_nights),
    location: acf.location ?? '',
    useCases: acf.use_cases ?? [],
    startingPrice: toNumberOrNull(acf.starting_price),
    currency: acf.currency ?? 'USD',
    priceUnit: acf.price_unit ?? '',
    priceOnRequest: Boolean(acf.price_on_request),
    primaryCtaLabel: acf.primary_cta_label ?? '',
    primaryCtaUrl: acf.primary_cta_url ?? '',
    sortOrder: toNumberOrNull(acf.sort_order) ?? 0,
    showOnLanding: Boolean(acf.show_on_landing),
  };
}

async function mapRetreat(post: WPPost<WPRetreatAcf>): Promise<Retreat> {
  const acf = post.acf;
  const mainImage = await resolveMediaUrl(acf.main_image);

  return {
    id: post.id,
    slug: post.slug,
    title: title(post),
    category: acf.retreat_category ?? '',
    shortDescription: acf.short_description ?? '',
    longDescription: acf.long_description ?? '',
    mainImage,
    startDate: acf.start_date ?? null,
    endDate: acf.end_date ?? null,
    durationNights: toNumberOrNull(acf.duration_nights),
    maximumCapacity: toNumberOrNull(acf.maximum_capacity),
    minimumCapacity: toNumberOrNull(acf.minimum_capacity),
    level: acf.level ?? false,
    hostName: acf.host_name ?? '',
    startingPrice: toNumberOrNull(acf.starting_price),
    currency: acf.currency ?? 'USD',
    availabilityStatus: acf.availability_status ?? '',
    primaryCtaLabel: acf.primary_cta_label ?? '',
    primaryCtaUrl: acf.primary_cta_url ?? '',
    sortOrder: toNumberOrNull(acf.sort_order) ?? 0,
    showOnLanding: Boolean(acf.show_on_landing),
  };
}

async function mapPackage(post: WPPost<WPPackageAcf>): Promise<Package> {
  const acf = post.acf;
  const mainImage = await resolveMediaUrl(acf.main_image);

  return {
    id: post.id,
    slug: post.slug,
    title: title(post),
    packageType: acf.package_type ?? '',
    shortDescription: acf.short_description ?? '',
    longDescription: acf.long_description ?? '',
    mainImage,
    totalSuiteCapacity: toNumberOrNull(acf.total_suite_capacity),
    guestCapacity: toNumberOrNull(acf.guest_capacity),
    startingPrice: toNumberOrNull(acf.starting_price),
    currency: acf.currency ?? 'USD',
    discountLabel: acf.discount_label ?? '',
    primaryCtaLabel: acf.primary_cta_label ?? '',
    primaryCtaUrl: acf.primary_cta_url ?? '',
    sortOrder: toNumberOrNull(acf.sort_order) ?? 0,
    showOnLanding: Boolean(acf.show_on_landing),
  };
}

async function mapTestimonial(post: WPPost<WPTestimonialAcf>): Promise<Testimonial> {
  const acf = post.acf;
  const authorImage = await resolveMediaUrl(acf.author_image);

  return {
    id: post.id,
    quote: acf.quote ?? '',
    authorDetail: acf.author_detail ?? '',
    authorImage,
    testimonialType: acf.testimonial_type ?? '',
    rating: toNumberOrNull(acf.rating),
    isFeatured: Boolean(acf.is_featured),
    sortOrder: toNumberOrNull(acf.sort_order) ?? 0,
  };
}

function mapFaq(post: WPPost<WPFaqAcf>): Faq {
  const acf = post.acf;
  return {
    id: post.id,
    question: title(post),
    answer: acf.answer ?? '',
    category: acf.faq_category ?? '',
    showOnLanding: Boolean(acf.show_on_landing),
    sortOrder: toNumberOrNull(acf.sort_order) ?? 0,
  };
}

function mapService(post: WPPost<WPServiceAcf>): Service {
  const acf = post.acf;
  return {
    id: post.id,
    label: title(post),
    icon: acf.service_icon ?? '',
    sortOrder: toNumberOrNull(acf.sort_order) ?? 0,
  };
}

function mapContact(post: WPPost<WPContactAcf>): Contact {
  const acf = post.acf;
  return {
    id: post.id,
    title: acf.contact_title ?? title(post),
    email: acf.contact_email ?? '',
    phone: acf.contact_phone ?? '',
    sortOrder: toNumberOrNull(acf.sort_order) ?? 0,
  };
}

// Contenido de arriba del pliegue (Hero, Ubicación) — a diferencia de las
// villas o paquetes, no tiene sentido mostrar la sección vacía si
// WordPress no responde o el campo todavía no se cargó. Estos valores por
// defecto son el mismo texto que estaba fijo en el código antes de
// conectar con WordPress.
const DEFAULT_HERO: Hero = {
  image: '/hero-villa.jpg',
  imageAlt: 'Piscina infinita frente al mar en una villa de Coco B Isla',
  eyebrow: 'A Luxury Experience',
  heading: 'In Isla Mujeres',
};

const DEFAULT_LOCATION: SiteLocation = {
  heading: 'A Privileged Location',
  description:
    "Just a 20 minute ride off the coast of Cancun, you'll find Isla Mujeres, the island of women, floating in the turquoise blue waters of the Caribbean. The privileged location of Coco B Isla Villas lets you enjoy an oasis like escape from the hustle and bustle of city life, yet be just minutes away from the beach and family experiences.",
  mapUrl: 'https://www.google.com/maps?q=Isla+Mujeres,+Quintana+Roo,+Mexico&output=embed',
};

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getVillas(): Promise<Villa[]> {
  const posts = await wpFetch<WPPost<WPVillaAcf>[]>('/wp/v2/villa?per_page=100');
  if (!posts) return [];
  return bySortOrder(await Promise.all(posts.map(mapVilla)));
}

export async function getVilla(slug: string): Promise<Villa | null> {
  const posts = await wpFetch<WPPost<WPVillaAcf>[]>(`/wp/v2/villa?slug=${encodeURIComponent(slug)}`);
  if (!posts || posts.length === 0) return null;
  return mapVilla(posts[0]);
}

export async function getVillaSummaries(): Promise<VillaSummary[]> {
  const posts = await wpFetch<WPPost<WPVillaAcf>[]>('/wp/v2/villa?per_page=100');
  if (!posts) return [];
  return [...posts]
    .sort((a, b) => (toNumberOrNull(a.acf.sort_order) ?? 0) - (toNumberOrNull(b.acf.sort_order) ?? 0))
    .map((post) => {
      const acf = post.acf;
      return {
        title: title(post),
        guestCapacity: toNumberOrNull(acf.guest_capacity),
        bedrooms: toNumberOrNull(acf.bedrooms),
        bathrooms: toNumberOrNull(acf.bathrooms),
        location: acf.location ?? '',
        startingPrice: toNumberOrNull(acf.starting_price),
        currency: acf.currency ?? 'USD',
        priceUnit: acf.price_unit ?? '',
        priceOnRequest: Boolean(acf.price_on_request),
        shortDescription: acf.short_description ?? '',
      };
    });
}

export async function getRetreats(): Promise<Retreat[]> {
  const posts = await wpFetch<WPPost<WPRetreatAcf>[]>('/wp/v2/retreat?per_page=100');
  if (!posts) return [];
  return bySortOrder(await Promise.all(posts.map(mapRetreat)));
}

export async function getRetreat(slug: string): Promise<Retreat | null> {
  const posts = await wpFetch<WPPost<WPRetreatAcf>[]>(`/wp/v2/retreat?slug=${encodeURIComponent(slug)}`);
  if (!posts || posts.length === 0) return null;
  return mapRetreat(posts[0]);
}

export async function getPackages(): Promise<Package[]> {
  const posts = await wpFetch<WPPost<WPPackageAcf>[]>('/wp/v2/package?per_page=100');
  if (!posts) return [];
  return bySortOrder(await Promise.all(posts.map(mapPackage)));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const posts = await wpFetch<WPPost<WPTestimonialAcf>[]>('/wp/v2/testimonial?per_page=100');
  if (!posts) return [];
  return bySortOrder(await Promise.all(posts.map(mapTestimonial)));
}

export async function getFaqs(): Promise<Faq[]> {
  const posts = await wpFetch<WPPost<WPFaqAcf>[]>('/wp/v2/faq?per_page=100');
  if (!posts) return [];
  return bySortOrder(posts.map(mapFaq));
}

export async function getServices(): Promise<Service[]> {
  const posts = await wpFetch<WPPost<WPServiceAcf>[]>('/wp/v2/servicio?per_page=100');
  if (!posts || posts.length === 0) return [];
  return bySortOrder(posts.map(mapService));
}

export async function getContacts(): Promise<Contact[]> {
  const posts = await wpFetch<WPPost<WPContactAcf>[]>('/wp/v2/contacto?per_page=100');
  if (!posts || posts.length === 0) return [];
  return bySortOrder(posts.map(mapContact));
}

export async function getHero(): Promise<Hero> {
  const posts = await wpFetch<WPPost<WPHeroAcf>[]>('/wp/v2/hero?per_page=1');
  const acf = posts?.[0]?.acf;
  if (!acf) return DEFAULT_HERO;

  const image = await resolveMediaUrl(acf.hero_image);
  return {
    image: image ?? DEFAULT_HERO.image,
    imageAlt: acf.hero_image_alt || DEFAULT_HERO.imageAlt,
    eyebrow: acf.hero_eyebrow || DEFAULT_HERO.eyebrow,
    heading: acf.hero_heading || DEFAULT_HERO.heading,
  };
}

export async function getSiteLocation(): Promise<SiteLocation> {
  const posts = await wpFetch<WPPost<WPLocationAcf>[]>('/wp/v2/ubicacion?per_page=1');
  const acf = posts?.[0]?.acf;
  if (!acf) return DEFAULT_LOCATION;

  return {
    heading: acf.location_heading || DEFAULT_LOCATION.heading,
    description: acf.location_description || DEFAULT_LOCATION.description,
    mapUrl: acf.location_map_url || DEFAULT_LOCATION.mapUrl,
  };
}
