import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PopupWaitlistForm } from '@/components/forms';

export const metadata: Metadata = {
  title: 'Pop-up Hotel Waitlist | Coco B Isla',
  description: 'Join the waitlist for upcoming Coco B pop-up hotel dates.',
};

export default async function PopupWaitlistPage() {
  const t = await getTranslations('waitlist');
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <p className="text-xs tracking-widest text-text-muted uppercase">{t('eyebrow')}</p>
      <h1 className="mt-1 text-3xl font-semibold">{t('title')}</h1>
      <p className="mt-3 mb-8 text-text-muted">{t('intro')}</p>
      <PopupWaitlistForm />
    </section>
  );
}

