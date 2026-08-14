import type { Metadata } from 'next';
import { RetreatHostForm } from '@/components/forms';

export const metadata: Metadata = {
  title: 'Host a Retreat | Coco B Isla',
  description: 'Tell us about the retreat you would like to host at Coco B Isla.',
};

export default function RetreatHostPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <p className="text-xs tracking-widest text-text-muted uppercase">For facilitators</p>
      <h1 className="mt-1 text-3xl font-semibold">Host your retreat at Coco B</h1>
      <p className="mt-3 mb-8 text-text-muted">
        Tell us about your group, preferred dates, and the experience you want to create.
      </p>
      <RetreatHostForm />
    </section>
  );
}

