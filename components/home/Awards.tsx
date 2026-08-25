import { getAwards } from '@/lib/wp/client';
import { AwardsCarousel } from './AwardsCarousel';
import type { Award } from '@/lib/wp/types';

// Respaldo por si WordPress no responde o todavía no tiene premios
// cargados — mismo contenido que estaba fijo en el código antes.
const FALLBACK_AWARDS: Award[] = [
  {
    id: -1,
    year: '2024',
    title: "Traveler's Choice",
    source: 'TripAdvisor',
    description: 'Top 10% of properties worldwide',
    logo: '/images/awards/tripadvisor.webp',
    sortOrder: 1,
  },
  {
    id: -2,
    year: '2024',
    title: 'Best Luxury Villa',
    source: 'Luxury Travel Magazine',
    description: 'Caribbean & Mexico Edition',
    logo: '/images/awards/luxury-travel-magazine.webp',
    sortOrder: 2,
  },
  {
    id: -3,
    year: '2022',
    title: "Traveler's Choice",
    source: 'Conde Nast Traveler',
    description: 'Best island retreat center',
    logo: '/images/awards/conde-nast-traveler.webp',
    sortOrder: 3,
  },
  {
    id: -4,
    year: '2016',
    title: 'Winner 2016',
    source: 'Boutique Hotels Award',
    description: 'Best private villa hotel',
    logo: '/images/awards/boutique-hotel-awards.webp',
    sortOrder: 4,
  },
];

export async function Awards() {
  const fetched = await getAwards();
  const awards = fetched.length > 0 ? fetched : FALLBACK_AWARDS;
  return <AwardsCarousel awards={awards} />;
}
