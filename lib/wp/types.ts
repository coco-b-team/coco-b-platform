// Formas normalizadas — las que consume el resto del sitio.
// Los nombres de los campos ACF vienen tal cual están definidos en WordPress
// (ver content-model.md), solo se pasan a camelCase y las imágenes se
// resuelven a su URL final.

export type Villa = {
  id: number;
  slug: string;
  title: string;
  label: string;
  shortDescription: string;
  longDescription: string;
  mainImage: string | null;
  gallery: string[];
  suiteCapacity: number | null;
  guestCapacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  minimumStayNights: number | null;
  location: string;
  useCases: string[];
  startingPrice: number | null;
  currency: string;
  priceUnit: string;
  priceOnRequest: boolean;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  sortOrder: number;
  showOnLanding: boolean;
};

// Versión liviana de Villa, solo texto — sin resolver imágenes. Pensada
// para contextos donde no hace falta mostrar fotos (por ejemplo, el
// system prompt del chat), para no pagar el costo de varias consultas de
// medios por villa cuando esos datos ni se van a usar.
export type VillaSummary = {
  title: string;
  guestCapacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  location: string;
  startingPrice: number | null;
  currency: string;
  priceUnit: string;
  priceOnRequest: boolean;
  shortDescription: string;
};

export type Retreat = {
  id: number;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  mainImage: string | null;
  startDate: string | null;
  endDate: string | null;
  durationNights: number | null;
  maximumCapacity: number | null;
  minimumCapacity: number | null;
  level: string | false;
  hostName: string;
  startingPrice: number | null;
  currency: string;
  availabilityStatus: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  sortOrder: number;
  showOnLanding: boolean;
};

export type Package = {
  id: number;
  slug: string;
  title: string;
  packageType: string;
  shortDescription: string;
  longDescription: string;
  mainImage: string | null;
  totalSuiteCapacity: number | null;
  guestCapacity: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  relatedVillas: number[];
  startingPrice: number | null;
  currency: string;
  discountLabel: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  sortOrder: number;
  showOnLanding: boolean;
};

export type Testimonial = {
  id: number;
  quote: string;
  authorDetail: string;
  authorImage: string | null;
  reviewDate: string;
  testimonialType: string;
  rating: number | null;
  isFeatured: boolean;
  sortOrder: number;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
  category: string;
  showOnLanding: boolean;
  sortOrder: number;
};

export type Service = {
  id: number;
  label: string;
  icon: string;
  sortOrder: number;
};

export type Contact = {
  id: number;
  title: string;
  email: string;
  phone: string;
  sortOrder: number;
};

export type Award = {
  id: number;
  title: string;
  year: string;
  source: string;
  description: string;
  logo: string | null;
  sortOrder: number;
};

export type AboutContent = {
  heading: string;
  triad: { title: string; body: string }[];
  story: string;
  mission: string;
  tagline: string;
  sustainabilityHeading: string;
  sustainabilityIntro: string;
  sustainabilitySections: { heading: string; body: string }[];
  sustainabilityClosing: string;
};

export type Hero = {
  images: string[];
  imageAlt: string;
  eyebrow: string;
  heading: string;
  villasHeading: string;
  villasDescription: string;
};

export type SiteLocation = {
  heading: string;
  description: string;
  mapUrl: string;
};

// Formas crudas tal como las devuelve la REST API de WordPress — solo lo
// que se usa para mapear a los tipos normalizados de arriba.

export type WPRendered = { rendered: string };

export type WPPost<Acf> = {
  id: number;
  slug: string;
  title: WPRendered;
  acf: Acf;
};

export type WPVillaAcf = {
  label: string;
  short_description: string;
  long_description: string;
  main_image: number | null;
  suite_capacity: number | string;
  guest_capacity: number | string;
  bedrooms: number | string;
  bathrooms: number | string;
  minimum_stay_nights: number | string;
  location: string;
  use_cases: string[] | null;
  starting_price: number | string;
  currency: string;
  price_unit: string;
  price_on_request: boolean;
  primary_cta_label: string;
  primary_cta_url: string;
  sort_order: number | string;
  show_on_landing: boolean;
  gallery_image_1: number | null;
  gallery_image_2: number | null;
  gallery_image_3: number | null;
  gallery_image_4: number | null;
  gallery_image_5: number | null;
  gallery_image_6: number | null;
  gallery_image_7: number | null;
  gallery_image_8: number | null;
  gallery_image_9: number | null;
  gallery_image_10: number | null;
};

export type WPRetreatAcf = {
  retreat_category: string;
  short_description: string;
  long_description: string;
  main_image: number | null;
  start_date: string | null;
  end_date: string | null;
  duration_nights: number | string;
  maximum_capacity: number | string;
  minimum_capacity: number | string;
  level: string | false;
  host_name: string;
  starting_price: number | string;
  currency: string;
  availability_status: string;
  primary_cta_label: string;
  primary_cta_url: string;
  sort_order: number | string;
  show_on_landing: boolean;
};

export type WPPackageAcf = {
  package_type: string;
  short_description: string;
  long_description: string;
  main_image: number | null;
  total_suite_capacity: number | string;
  guest_capacity: number | string;
  bedrooms: number | string;
  bathrooms: number | string;
  related_villas: number[] | null;
  starting_price: number | string;
  currency: string;
  discount_label: string;
  primary_cta_label: string;
  primary_cta_url: string;
  sort_order: number | string;
  show_on_landing: boolean;
};

export type WPTestimonialAcf = {
  quote: string;
  author_detail: string;
  author_image: number | null;
  testimonial_date: string;
  testimonial_type: string;
  rating: number | string;
  is_featured: boolean;
  sort_order: number | string;
};

export type WPFaqAcf = {
  answer: string;
  faq_category: string;
  show_on_landing: boolean;
  sort_order: number | string;
};

export type WPServiceAcf = {
  service_icon: string;
  sort_order: number | string;
};

export type WPContactAcf = {
  contact_title: string;
  contact_email: string;
  contact_phone: string;
  sort_order: number | string;
};

export type WPHeroAcf = {
  hero_image: number | null;
  hero_image_2: number | null;
  hero_image_3: number | null;
  hero_image_4: number | null;
  hero_image_5: number | null;
  hero_image_alt: string;
  hero_eyebrow: string;
  hero_heading: string;
  villas_heading: string;
  villas_description: string;
};

export type WPLocationAcf = {
  location_heading: string;
  location_description: string;
  location_map_url: string;
};

export type WPAwardAcf = {
  award_year: string;
  award_source: string;
  award_description: string;
  award_logo: number | null;
  sort_order: number | string;
};

export type WPAboutAcf = {
  about_heading: string;
  triad_1_title: string;
  triad_1_body: string;
  triad_2_title: string;
  triad_2_body: string;
  triad_3_title: string;
  triad_3_body: string;
  about_story: string;
  about_mission: string;
  about_tagline: string;
  sustainability_heading: string;
  sustainability_intro: string;
  sustainability_section_1_heading: string;
  sustainability_section_1_body: string;
  sustainability_section_2_heading: string;
  sustainability_section_2_body: string;
  sustainability_section_3_heading: string;
  sustainability_section_3_body: string;
  sustainability_section_4_heading: string;
  sustainability_section_4_body: string;
  sustainability_section_5_heading: string;
  sustainability_section_5_body: string;
  sustainability_section_6_heading: string;
  sustainability_section_6_body: string;
  sustainability_section_7_heading: string;
  sustainability_section_7_body: string;
  sustainability_closing: string;
};
