import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Coco B Isla',
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <h1 className="font-body text-2xl font-normal">Privacy Policy</h1>
      <p className="mt-6 text-text-muted">
        Estamos preparando esta página. Si tienes preguntas sobre cómo manejamos tu información,
        escríbenos a{' '}
        <a href="mailto:reservations@cocobisla.com" className="text-primary underline">
          reservations@cocobisla.com
        </a>
        .
      </p>
    </section>
  );
}
