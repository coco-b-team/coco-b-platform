import type { Metadata } from 'next';
import { PopupWaitlistForm } from '@/components/forms';

export const metadata: Metadata = {
  title: 'Pop-up Hotel Waitlist | Coco B Isla',
  description: 'Join the waitlist for upcoming Coco B pop-up hotel dates.',
};

export default function PopupWaitlistPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <p className="text-xs tracking-widest text-text-muted uppercase">Be the first to know</p>
      <h1 className="mt-1 text-3xl font-semibold">Pop-up hotel waitlist</h1>
      <p className="mt-3 mb-8 text-text-muted">
        Join the list and we will let you know when new dates become available.
      </p>
      <PopupWaitlistForm />
    </section>
  );
}

