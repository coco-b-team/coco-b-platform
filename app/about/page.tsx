import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About Us | Coco B Isla',
  description: 'A Caribbean sanctuary in Isla Mujeres — the story, mission, and sustainability practices behind Coco B Isla & Coco B Wellness.',
};

const triad = [
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
];

const story = [
  'For over a decade, we dreamed of creating a beautiful Caribbean sanctuary where our guests could unwind, refresh, and immerse themselves in comfort, tranquility, and timeless style. A place where stress dissolves in the beautiful blue sea, sunsets take your breath away, and the daily grind gives way to a welcome fragrance in the morning air.',
  "Welcome to Coco B Isla & Coco B Wellness, our sanctuary in Isla Mujeres, the Isle of Women. This island is the home of Ixchel, the Mayan Goddess of Love and Fertility, and one of the Caribbean's most beautiful islands, celebrating Mexican and Mayan cultures afloat on the crystal blue Caribbean waters.",
  "Whether you decide to do absolutely nothing or immerse yourself in the island and region's magical culture, our mission is your delight. Coco B is dedicated to offering a beautiful luxury vacation and wellness sanctuary where like-minded guests will practice, relax, connect, and delight in the splendor of our environment, the island, and the region.",
  'We welcome instructors and studios worldwide to take advantage of our intimate wellness location or for you to join one of our yoga and wellness vacation experiences.',
];

const mission = 'Our Mission is to deliver inspirational whole-health integrative wellness in a fun, relaxing, beautiful, and restorative environment.';

const sustainabilityIntro =
  'At Coco B Isla, we are committed to preserving the natural beauty of Isla Mujeres and minimizing our environmental impact through various sustainable practices. Our dedication to sustainability encompasses everything from composting to community engagement, ensuring a greener, more eco-friendly experience for our guests.';

const sustainabilitySections = [
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
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
        <p className="text-xs tracking-widest text-text-muted uppercase">About Us</p>
        <h1 className="font-body mt-1 text-3xl font-semibold">A Caribbean Sanctuary</h1>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {triad.map((item) => (
            <div key={item.title}>
              <h2 className="text-sm font-semibold tracking-widest text-primary uppercase">{item.title}</h2>
              <p className="mt-3 text-text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 space-y-6 border-t border-border pt-10 text-text-muted">
          {story.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <p className="font-medium text-text">{mission}</p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-border pt-10 text-center">
          <p className="text-sm tracking-[0.3em] text-accent uppercase">Breathe · Nourish · Flow</p>
          <Button href="/villas" variant="primary">
            Inquire
          </Button>
        </div>
      </section>

      <section className="bg-background-alt py-16">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <p className="text-xs tracking-widest text-accent uppercase">Sustainability</p>
          <h2 className="font-body mt-1 text-2xl font-semibold">Sustainability at Coco B Isla</h2>
          <p className="mt-4 text-text-muted">{sustainabilityIntro}</p>

          <div className="mt-10 divide-y divide-border">
            {sustainabilitySections.map((section) => (
              <div key={section.heading} className="py-6 first:pt-0">
                <h3 className="font-body text-lg font-semibold">{section.heading}</h3>
                <p className="mt-2 text-text-muted">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-8 text-text-muted">
            <p>At Coco B Isla, we are dedicated to offering a luxurious yet sustainable vacation experience.</p>
            <p>We allow our guests to relax and rejuvenate while also supporting and protecting our beautiful environment.</p>
          </div>
        </div>
      </section>
    </>
  );
}
