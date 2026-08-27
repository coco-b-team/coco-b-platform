import { WORDPRESS_API_URL } from './config';
import { decodeHtmlEntities } from './utils';
import {
  getContentLocale,
  getTranslatedList,
  overlaySlug,
  overlayId,
  overlaySingleton,
} from './translations';
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
  Award,
  AboutContent,
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
  WPAwardAcf,
  WPAboutAcf,
} from './types';

async function wpFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${WORDPRESS_API_URL}${path}`, {
      // 15 segundos — bajado de 180 (2026-08-27) para que los cambios en
      // WordPress se vean casi al instante en las demos frente al jurado
      // (editar un precio y refrescar, sin esperar 3 minutos). El sitio
      // sigue protegido igual: nunca le pregunta a WordPress más de una vez
      // por esta ventana, sin importar cuánta gente esté mirando a la vez.
      // Ver Progreso_Proyecto.md para la alternativa que se evaluó
      // (endpoint de revalidación bajo demanda) si esto llegara a no
      // alcanzar más adelante.
      next: { revalidate: 15 },
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
    acf.gallery_image_6,
    acf.gallery_image_7,
    acf.gallery_image_8,
    acf.gallery_image_9,
    acf.gallery_image_10,
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
    bedrooms: toNumberOrNull(acf.bedrooms),
    bathrooms: toNumberOrNull(acf.bathrooms),
    relatedVillas: acf.related_villas ?? [],
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
    reviewDate: acf.testimonial_date ?? '',
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

async function mapAward(post: WPPost<WPAwardAcf>): Promise<Award> {
  const acf = post.acf;
  const logo = await resolveMediaUrl(acf.award_logo);
  return {
    id: post.id,
    title: title(post),
    year: acf.award_year ?? '',
    source: acf.award_source ?? '',
    description: acf.award_description ?? '',
    logo,
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
  images: ['/hero-villa.jpg'],
  imageAlt: 'Piscina infinita frente al mar en una villa de Coco B Isla',
  eyebrow: 'A Luxury Experience',
  heading: 'In Isla Mujeres',
  villasHeading: 'Our Villa Collection',
  villasDescription:
    'Our exclusive collection includes four exquisite villas: Lola, Encantada, Coco, and Cielo. Each villa offers a unique blend of indoor and outdoor living spaces, perfect for families, friends, corporate retreats, wedding or wellness getaways. With direct access to calm waters and breathtaking sunsets over the Caribbean, Coco B Isla Villas promises an exceptional and unforgettable experience.',
};

const DEFAULT_LOCATION: SiteLocation = {
  heading: 'A Privileged Location',
  description:
    "Just a 20 minute ride off the coast of Cancun, you'll find Isla Mujeres, the island of women, floating in the turquoise blue waters of the Caribbean. The privileged location of Coco B Isla Villas lets you enjoy an oasis like escape from the hustle and bustle of city life, yet be just minutes away from the beach and family experiences.",
  mapUrl: 'https://www.google.com/maps?q=Isla+Mujeres,+Quintana+Roo,+Mexico&output=embed',
};

// Mismo caso que Hero/Ubicación arriba: "about" está pensado como una sola
// entrada en WordPress. Este es el contenido real de marca, usado si
// WordPress no responde o el campo todavía no se cargó.
const DEFAULT_ABOUT: AboutContent = {
  heading: 'A Caribbean Sanctuary',
  triad: [
    {
      title: 'Breathe',
      body: "Start your day with a deep breath of crisp, clean air as you take in the panoramic views of the Caribbean Sea from your private balcony. Coco B Isla's serenity helps you reconnect with the natural world.",
    },
    {
      title: 'Nourish',
      body: 'Our chef services ensure your dietary needs and desires are met with exquisite attention to detail. Every meal is a nourishing experience tailored just for you, from detox smoothies to decadent dinners.',
    },
    {
      title: 'Flow',
      body: 'Let your worries drift away as you move through our beautifully designed spaces. The architecture of Coco B Isla seamlessly blends indoor and outdoor living, creating a harmonious flow that enhances your sense of well-being.',
    },
  ],
  story: [
    'For over a decade, we dreamed of creating a beautiful Caribbean sanctuary where our guests could unwind, refresh, and immerse themselves in comfort, tranquility, and timeless style. A place where stress dissolves in the beautiful blue sea, sunsets take your breath away, and the daily grind gives way to a welcome fragrance in the morning air.',
    "Welcome to Coco B Isla & Coco B Wellness, our sanctuary in Isla Mujeres, the Isle of Women. This island is the home of Ixchel, the Mayan Goddess of Love and Fertility, and one of the Caribbean's most beautiful islands, celebrating Mexican and Mayan cultures afloat on the crystal blue Caribbean waters.",
    "Whether you decide to do absolutely nothing or immerse yourself in the island and region's magical culture, our mission is your delight. Coco B is dedicated to offering a beautiful luxury vacation and wellness sanctuary where like-minded guests will practice, relax, connect, and delight in the splendor of our environment, the island, and the region.",
    'We welcome instructors and studios worldwide to take advantage of our intimate wellness location or for you to join one of our yoga and wellness vacation experiences.',
  ].join('\n\n'),
  mission:
    'Our Mission is to deliver inspirational whole-health integrative wellness in a fun, relaxing, beautiful, and restorative environment.',
  tagline: 'Breathe · Nourish · Flow',
  sustainabilityHeading: 'Sustainability at Coco B Isla',
  sustainabilityIntro:
    'At Coco B Isla, we are committed to preserving the natural beauty of Isla Mujeres and minimizing our environmental impact through various sustainable practices. Our dedication to sustainability encompasses everything from composting to community engagement, ensuring a greener, more eco-friendly experience for our guests.',
  sustainabilitySections: [
    {
      heading: 'Composting and Organic Gardening',
      body: 'We have established a composting system for organic kitchen waste from the restaurant and guest meals. This compost is then used for our on-site gardening, where we grow fresh herbs and flowers. This significantly reduces the need for external fertilizers and promotes a closed-loop system.',
    },
    {
      heading: 'Water Conservation',
      body: 'We have implemented low-flow fixtures in all showers, faucets, and toilets to conserve water. Additionally, we utilize passive water wells and rainwater catchment systems to irrigate our gardens, making the most of natural water resources.',
    },
    {
      heading: 'Community Engagement',
      body: "We are proud to partner with local organizations to promote sustainability initiatives and celebrate Isla Mujeres's cultural heritage. Our team actively participates in island clean-up programs and other community-focused events.",
    },
    {
      heading: 'Eliminating Plastic Waste',
      body: 'In our villas, guests receive complimentary branded reusable water bottles upon arrival, encouraging them to refill at our purified water stations throughout the property. These bottles are also available for hotel guests, with some of the proceeds supporting an orphanage in nearby Cancún. We strictly avoid using plastic bottles, providing purified water in glass jars on nightstands daily for Villa and Hotel Guests.',
    },
    {
      heading: 'Sustainable Sourcing',
      body: 'We source our food locally and seasonally, supporting local farmers and reducing the carbon footprint associated with transporting goods. Our cleaning products and toiletries are eco-friendly, ensuring a minimal environmental impact.',
    },
    {
      heading: 'Eco-Friendly Transportation',
      body: 'Guests are encouraged to explore the island using our bicycles and renting electric golf carts, reducing carbon emissions and promoting a healthier way to travel.',
    },
    {
      heading: 'Green Building Practices',
      body: 'We use sustainable building materials and techniques whenever we undertake new construction or renovations, and our designs incorporate many locally produced and sourced materials. As well, we design for optimum flow for natural ventilation and lighting to reduce energy consumption, creating a comfortable and environmentally friendly atmosphere.',
    },
  ],
  sustainabilityClosing: [
    'At Coco B Isla, we are dedicated to offering a luxurious yet sustainable vacation experience.',
    'We allow our guests to relax and rejuvenate while also supporting and protecting our beautiful environment.',
  ].join('\n\n'),
};

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getVillas(): Promise<Villa[]> {
  const posts = await wpFetch<WPPost<WPVillaAcf>[]>('/wp/v2/villa?per_page=100');
  if (!posts) return [];
  const locale = await getContentLocale();
  const villas = bySortOrder(await Promise.all(posts.map(mapVilla)));
  return villas.map((v) => overlaySlug(v, locale, 'villa'));
}

export async function getVilla(slug: string): Promise<Villa | null> {
  const posts = await wpFetch<WPPost<WPVillaAcf>[]>(
    `/wp/v2/villa?slug=${encodeURIComponent(slug)}`,
  );
  if (!posts || posts.length === 0) return null;
  const locale = await getContentLocale();
  return overlaySlug(await mapVilla(posts[0]), locale, 'villa');
}

export async function getVillaSummaries(): Promise<VillaSummary[]> {
  const posts = await wpFetch<WPPost<WPVillaAcf>[]>('/wp/v2/villa?per_page=100');
  if (!posts) return [];
  const locale = await getContentLocale();
  const translated = getTranslatedList(locale, 'villa');
  return [...posts]
    .sort(
      (a, b) => (toNumberOrNull(a.acf.sort_order) ?? 0) - (toNumberOrNull(b.acf.sort_order) ?? 0),
    )
    .map((post) => {
      const acf = post.acf;
      const match = translated.find((v) => v.slug === post.slug) as
        { title?: string; location?: string; shortDescription?: string } | undefined;
      return {
        title: match?.title ?? title(post),
        guestCapacity: toNumberOrNull(acf.guest_capacity),
        bedrooms: toNumberOrNull(acf.bedrooms),
        bathrooms: toNumberOrNull(acf.bathrooms),
        location: match?.location ?? acf.location ?? '',
        startingPrice: toNumberOrNull(acf.starting_price),
        currency: acf.currency ?? 'USD',
        priceUnit: acf.price_unit ?? '',
        priceOnRequest: Boolean(acf.price_on_request),
        shortDescription: match?.shortDescription ?? acf.short_description ?? '',
      };
    });
}

export async function getRetreats(): Promise<Retreat[]> {
  const posts = await wpFetch<WPPost<WPRetreatAcf>[]>('/wp/v2/retreat?per_page=100');
  if (!posts) return [];
  return bySortOrder(await Promise.all(posts.map(mapRetreat)));
}

export async function getRetreat(slug: string): Promise<Retreat | null> {
  const posts = await wpFetch<WPPost<WPRetreatAcf>[]>(
    `/wp/v2/retreat?slug=${encodeURIComponent(slug)}`,
  );
  if (!posts || posts.length === 0) return null;
  return mapRetreat(posts[0]);
}

export async function getPackages(): Promise<Package[]> {
  const posts = await wpFetch<WPPost<WPPackageAcf>[]>('/wp/v2/package?per_page=100');
  if (!posts) return [];
  const locale = await getContentLocale();
  const packages = bySortOrder(await Promise.all(posts.map(mapPackage)));
  return packages.map((p) => overlaySlug(p, locale, 'package'));
}

export async function getPackage(slug: string): Promise<Package | null> {
  const posts = await wpFetch<WPPost<WPPackageAcf>[]>(
    `/wp/v2/package?slug=${encodeURIComponent(slug)}`,
  );
  if (!posts || posts.length === 0) return null;
  const locale = await getContentLocale();
  return overlaySlug(await mapPackage(posts[0]), locale, 'package');
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const posts = await wpFetch<WPPost<WPTestimonialAcf>[]>('/wp/v2/testimonial?per_page=100');
  if (!posts) return [];
  const locale = await getContentLocale();
  const testimonials = bySortOrder(await Promise.all(posts.map(mapTestimonial)));
  return testimonials.map((t) => overlayId(t, locale, 'testimonial'));
}

export async function getFaqs(): Promise<Faq[]> {
  const posts = await wpFetch<WPPost<WPFaqAcf>[]>('/wp/v2/faq?per_page=100');
  if (!posts) return [];
  const locale = await getContentLocale();
  const faqs = bySortOrder(posts.map(mapFaq));
  return faqs.map((f) => overlayId(f, locale, 'faq'));
}

export async function getServices(): Promise<Service[]> {
  const posts = await wpFetch<WPPost<WPServiceAcf>[]>('/wp/v2/servicio?per_page=100');
  if (!posts || posts.length === 0) return [];
  const locale = await getContentLocale();
  const services = bySortOrder(posts.map(mapService));
  return services.map((s) => overlayId(s, locale, 'service'));
}

export async function getContacts(): Promise<Contact[]> {
  const posts = await wpFetch<WPPost<WPContactAcf>[]>('/wp/v2/contacto?per_page=100');
  if (!posts || posts.length === 0) return [];
  const locale = await getContentLocale();
  const contacts = bySortOrder(posts.map(mapContact));
  return contacts.map((c) => overlayId(c, locale, 'contact'));
}

export async function getHero(): Promise<Hero> {
  // "hero" está pensado como una sola entrada, pero nada en WordPress lo
  // impide técnicamente — orderby=id&order=asc asegura que, si alguna vez
  // se crea una segunda por error, siempre gane la original (la más
  // antigua) en vez de una al azar según el orden por defecto de la API.
  const posts = await wpFetch<WPPost<WPHeroAcf>[]>('/wp/v2/hero?per_page=1&orderby=id&order=asc');
  const acf = posts?.[0]?.acf;
  if (!acf) return DEFAULT_HERO;

  // Hasta 5 fotos para el carrusel del hero — la primera es la única
  // obligatoria (siempre existió como "hero_image"), las demás son
  // opcionales y se agregan en el orden en que están cargadas.
  const imageIds = [
    acf.hero_image,
    acf.hero_image_2,
    acf.hero_image_3,
    acf.hero_image_4,
    acf.hero_image_5,
  ].filter((id): id is number => Boolean(id));
  const images = (await Promise.all(imageIds.map(resolveMediaUrl))).filter((url): url is string =>
    Boolean(url),
  );

  const locale = await getContentLocale();
  return overlaySingleton(
    {
      images: images.length > 0 ? images : DEFAULT_HERO.images,
      imageAlt: acf.hero_image_alt || DEFAULT_HERO.imageAlt,
      eyebrow: acf.hero_eyebrow || DEFAULT_HERO.eyebrow,
      heading: acf.hero_heading || DEFAULT_HERO.heading,
      villasHeading: acf.villas_heading || DEFAULT_HERO.villasHeading,
      villasDescription: acf.villas_description || DEFAULT_HERO.villasDescription,
    },
    locale,
    'hero',
  );
}

export async function getSiteLocation(): Promise<SiteLocation> {
  // Mismo motivo que en getHero(): orden explícito para que una segunda
  // entrada creada por error no gane por casualidad.
  const posts = await wpFetch<WPPost<WPLocationAcf>[]>(
    '/wp/v2/ubicacion?per_page=1&orderby=id&order=asc',
  );
  const acf = posts?.[0]?.acf;
  if (!acf) return DEFAULT_LOCATION;

  const locale = await getContentLocale();
  return overlaySingleton(
    {
      heading: acf.location_heading || DEFAULT_LOCATION.heading,
      description: acf.location_description || DEFAULT_LOCATION.description,
      mapUrl: acf.location_map_url || DEFAULT_LOCATION.mapUrl,
    },
    locale,
    'siteLocation',
  );
}

export async function getAwards(): Promise<Award[]> {
  const posts = await wpFetch<WPPost<WPAwardAcf>[]>('/wp/v2/award?per_page=100');
  if (!posts || posts.length === 0) return [];
  const locale = await getContentLocale();
  const awards = bySortOrder(await Promise.all(posts.map(mapAward)));
  return awards.map((a) => overlayId(a, locale, 'award'));
}

export async function getAbout(): Promise<AboutContent> {
  // Mismo motivo que en getHero()/getSiteLocation(): orden explícito para
  // que una segunda entrada creada por error no gane por casualidad. Los
  // campos del trío y de sustentabilidad son planos y numerados (no un
  // repeater) porque el plugin de repeaters gratuito no los expone en la
  // API REST — mismo patrón que ya usa Villa para su galería.
  const posts = await wpFetch<WPPost<WPAboutAcf>[]>('/wp/v2/about?per_page=1&orderby=id&order=asc');
  const acf = posts?.[0]?.acf;
  if (!acf) return DEFAULT_ABOUT;

  const locale = await getContentLocale();
  return overlaySingleton(
    {
      heading: acf.about_heading || DEFAULT_ABOUT.heading,
      triad: [
        {
          title: acf.triad_1_title || DEFAULT_ABOUT.triad[0].title,
          body: acf.triad_1_body || DEFAULT_ABOUT.triad[0].body,
        },
        {
          title: acf.triad_2_title || DEFAULT_ABOUT.triad[1].title,
          body: acf.triad_2_body || DEFAULT_ABOUT.triad[1].body,
        },
        {
          title: acf.triad_3_title || DEFAULT_ABOUT.triad[2].title,
          body: acf.triad_3_body || DEFAULT_ABOUT.triad[2].body,
        },
      ],
      story: acf.about_story || DEFAULT_ABOUT.story,
      mission: acf.about_mission || DEFAULT_ABOUT.mission,
      tagline: acf.about_tagline || DEFAULT_ABOUT.tagline,
      sustainabilityHeading: acf.sustainability_heading || DEFAULT_ABOUT.sustainabilityHeading,
      sustainabilityIntro: acf.sustainability_intro || DEFAULT_ABOUT.sustainabilityIntro,
      sustainabilitySections: [
        {
          heading:
            acf.sustainability_section_1_heading || DEFAULT_ABOUT.sustainabilitySections[0].heading,
          body: acf.sustainability_section_1_body || DEFAULT_ABOUT.sustainabilitySections[0].body,
        },
        {
          heading:
            acf.sustainability_section_2_heading || DEFAULT_ABOUT.sustainabilitySections[1].heading,
          body: acf.sustainability_section_2_body || DEFAULT_ABOUT.sustainabilitySections[1].body,
        },
        {
          heading:
            acf.sustainability_section_3_heading || DEFAULT_ABOUT.sustainabilitySections[2].heading,
          body: acf.sustainability_section_3_body || DEFAULT_ABOUT.sustainabilitySections[2].body,
        },
        {
          heading:
            acf.sustainability_section_4_heading || DEFAULT_ABOUT.sustainabilitySections[3].heading,
          body: acf.sustainability_section_4_body || DEFAULT_ABOUT.sustainabilitySections[3].body,
        },
        {
          heading:
            acf.sustainability_section_5_heading || DEFAULT_ABOUT.sustainabilitySections[4].heading,
          body: acf.sustainability_section_5_body || DEFAULT_ABOUT.sustainabilitySections[4].body,
        },
        {
          heading:
            acf.sustainability_section_6_heading || DEFAULT_ABOUT.sustainabilitySections[5].heading,
          body: acf.sustainability_section_6_body || DEFAULT_ABOUT.sustainabilitySections[5].body,
        },
        {
          heading:
            acf.sustainability_section_7_heading || DEFAULT_ABOUT.sustainabilitySections[6].heading,
          body: acf.sustainability_section_7_body || DEFAULT_ABOUT.sustainabilitySections[6].body,
        },
      ],
      sustainabilityClosing: acf.sustainability_closing || DEFAULT_ABOUT.sustainabilityClosing,
    },
    locale,
    'about',
  );
}
