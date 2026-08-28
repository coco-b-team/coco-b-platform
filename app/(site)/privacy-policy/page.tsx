import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Privacy Policy | Coco B Isla',
};

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('privacyPolicy');
  const sections = t.raw('sections') as { heading: string; body: string }[];

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <p className="text-text-muted text-xs tracking-widest uppercase">{t('eyebrow')}</p>
      <h1 className="font-body mt-1 text-3xl font-semibold">{t('title')}</h1>

      <div className="divide-border mt-10 divide-y">
        {sections.map((section) => (
          <div key={section.heading} className="py-6 first:pt-0">
            <h2 className="font-body text-lg font-semibold">{section.heading}</h2>
            <p className="text-text-muted mt-2">{section.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
