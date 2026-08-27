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
      <p className="text-xs tracking-widest text-text-muted uppercase">{t('eyebrow')}</p>
      <h1 className="font-body mt-1 text-3xl font-semibold">{t('title')}</h1>

      <div className="mt-10 divide-y divide-border">
        {sections.map((section) => (
          <div key={section.heading} className="py-6 first:pt-0">
            <h2 className="font-body text-lg font-semibold">{section.heading}</h2>
            <p className="mt-2 text-text-muted">{section.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
