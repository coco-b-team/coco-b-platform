import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { getAbout } from '@/lib/wp/client';

export const metadata: Metadata = {
  title: 'About Us | Coco B Isla',
  description:
    'A Caribbean sanctuary in Isla Mujeres — the story, mission, and sustainability practices behind Coco B Isla & Coco B Wellness.',
};

export default async function AboutPage() {
  const about = await getAbout();
  const storyParagraphs = about.story.split('\n\n');
  const closingParagraphs = about.sustainabilityClosing.split('\n\n');

  return (
    <>
      <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
        <p className="text-xs tracking-widest text-text-muted uppercase">About Us</p>
        <h1 className="font-body mt-1 text-3xl font-semibold">{about.heading}</h1>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {about.triad.map((item) => (
            <div key={item.title}>
              <h2 className="text-sm font-semibold tracking-widest text-primary uppercase">{item.title}</h2>
              <p className="mt-3 text-text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 space-y-6 border-t border-border pt-10 text-text-muted">
          {storyParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
          <p className="font-medium text-text">{about.mission}</p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-border pt-10 text-center">
          <p className="text-sm tracking-[0.3em] text-accent uppercase">{about.tagline}</p>
          <Button href="/villas" variant="primary">
            Inquire
          </Button>
        </div>
      </section>

      <section className="bg-background-alt py-16">
        <div className="mx-auto max-w-3xl px-6 sm:px-10">
          <p className="text-xs tracking-widest text-accent uppercase">Sustainability</p>
          <h2 className="font-body mt-1 text-2xl font-semibold">{about.sustainabilityHeading}</h2>
          <p className="mt-4 text-text-muted">{about.sustainabilityIntro}</p>

          <div className="mt-10 divide-y divide-border">
            {about.sustainabilitySections.map((section) => (
              <div key={section.heading} className="py-6 first:pt-0">
                <h3 className="font-body text-lg font-semibold">{section.heading}</h3>
                <p className="mt-2 text-text-muted">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-8 text-text-muted">
            {closingParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
