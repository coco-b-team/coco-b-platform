import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Coco B Isla',
};

const sections = [
  {
    heading: 'SMS & WhatsApp Communications',
    body: 'By providing your mobile phone number through our website, contact forms, booking inquiries, or other communication channels, you expressly consent to receive SMS and WhatsApp messages from Coco B Isla and Coco B Wellness regarding your inquiries, reservations, guest services, retreat information, promotions, special offers, event updates, and other communications related to our services.',
  },
  {
    heading: 'Message Frequency',
    body: 'Message frequency may vary based on your interactions with us, booking status, and service requests.',
  },
  {
    heading: 'Message and Data Rates',
    body: "Standard message and data rates may apply according to your mobile carrier's plan.",
  },
  {
    heading: 'Opt-Out',
    body: 'You may opt out of receiving SMS messages at any time by replying STOP to any text message. To stop receiving WhatsApp messages, reply STOP or contact us directly.',
  },
  {
    heading: 'Help',
    body: 'For assistance, reply HELP to any SMS message or contact us at info@cocobisla.com.',
  },
  {
    heading: 'Consent Not Required',
    body: 'Your consent to receive SMS or WhatsApp messages is not a condition of purchasing any product, accommodation, retreat, or service.',
  },
  {
    heading: 'Information Sharing',
    body: 'Coco B Isla and Coco B Wellness do not sell, rent, or share your mobile phone number or messaging consent with third parties for their marketing purposes. We may share information with trusted service providers solely for the purpose of operating our business, managing reservations, customer service, and delivering communications on our behalf.',
  },
  {
    heading: 'Data Security',
    body: 'We implement reasonable administrative, technical, and physical safeguards to protect your personal information from unauthorized access, disclosure, alteration, or destruction.',
  },
  {
    heading: 'Record of Consent',
    body: 'We maintain records of consent and communication preferences as required by applicable laws and regulations.',
  },
  {
    heading: 'Changes to This Policy',
    body: 'We reserve the right to update this policy from time to time. Any changes will be posted on this page with an updated effective date.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
      <p className="text-xs tracking-widest text-text-muted uppercase">Coco B Isla</p>
      <h1 className="font-body mt-1 text-3xl font-semibold">Privacy Policy</h1>

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
