'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FaXmark, FaCheck } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { Checkbox, TextArea } from '@/components/forms/FormFields';
import { DateRangePicker } from '@/components/forms/DateRangePicker';
import { BaseHubSpotForm } from '@/components/forms/BaseHubSpotForm';
import { estimateGuestCapacity } from '@/lib/villas';
import { COUNTRY_CODES, flagEmoji } from '@/lib/countryCodes';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

// Margen fijo por sobre la capacidad real de la villa — sin explicarlo en
// pantalla, el "+" del contador de huéspedes simplemente deja de avanzar.
const GUEST_CAPACITY_MARGIN = 5;

const REFERRAL_OPTIONS = [
  'Google search',
  'Instagram',
  'Facebook',
  'Referral from a friend',
  'Travel agent',
  'Press or magazine',
  'Other',
];

type ModalVilla = {
  id: number | string;
  title: string;
  mainImage: string | null;
  startingPrice: number | null;
  priceUnit: string;
  priceOnRequest: boolean;
  guestCapacity: number | null;
  bedrooms: number | null;
};

type Step = 'dates' | 'details' | 'success';

function nightsBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function InquiryModal({ villa, onClose }: { villa: ModalVilla; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>('dates');
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [guests, setGuests] = useState(2);
  const [countryIso2, setCountryIso2] = useState('US');
  const [phoneNumber, setPhoneNumber] = useState('');
  const selectedCountry = COUNTRY_CODES.find((c) => c.iso2 === countryIso2) ?? COUNTRY_CODES[0];
  const exitingRef = useRef(false);

  useBodyScrollLock(true);
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 250);
  }

  const nights = nightsBetween(range.start, range.end);
  const subtotal = villa.startingPrice && nights > 0 ? villa.startingPrice * nights : null;
  const canAdvance = Boolean(range.start && range.end);
  const guestMax = (estimateGuestCapacity(villa.guestCapacity, villa.bedrooms) ?? 20) + GUEST_CAPACITY_MARGIN;

  return createPortal(
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-label={step === 'success' ? 'Solicitud enviada' : `Reservar ${villa.title}`}
        tabIndex={-1}
        className={`relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-background shadow-xl transition-all duration-250 ease-out ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {step !== 'success' && (
          <div className="flex shrink-0 items-start justify-between border-b border-border px-6 pt-6 pb-4">
            <div>
              <p className="text-xs tracking-widest text-text-muted uppercase">Villa</p>
              <h2 className="font-body mt-1 text-xl font-semibold uppercase">{villa.title}</h2>
            </div>
            <button
              onClick={handleClose}
              aria-label="Cerrar"
              className="text-text-muted hover:text-text"
            >
              <FaXmark size={20} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 'success' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Logo width={140} height={27} alt="Coco B Isla" />
              <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <FaCheck size={26} className="text-background" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-text">Thank you for your interest.</h3>
              <p className="mt-2 text-text-muted">
                Our Coco B Isla team will reach out to you within 24 hours.
              </p>
            </div>
          ) : (
            <BaseHubSpotForm
              formType="villa-wedding"
              submitLabel="Send request"
              showSubmitButton={step === 'details'}
              hideTurnstile={step !== 'details'}
              onSuccess={() => setStep('success')}
            >
              <input type="hidden" name="villa_id" value={String(villa.id)} />

              <div className={step === 'dates' ? '' : 'hidden'}>
                <p className="mb-4 text-xs tracking-widest text-text-muted uppercase">Plan your stay · Step 1 of 2</p>
                <DateRangePicker
                  initialGuests={guests}
                  guestMax={guestMax}
                  onRangeChange={setRange}
                  onGuestsChange={setGuests}
                />
                <Button
                  onClick={() => setStep('details')}
                  disabled={!canAdvance}
                  className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </Button>
              </div>

              <div className={step === 'details' ? 'flex flex-col gap-5' : 'hidden'}>
                <p className="text-xs tracking-widest text-text-muted uppercase">Plan your stay · Step 2 of 2</p>

                <Input label="First name" name="first_name" required maxLength={100} />
                <Input label="Last name" name="last_name" required maxLength={100} />
                <Input label="E-mail" name="email" type="email" required maxLength={254} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Phone number</label>
                  <div className="flex gap-2">
                    <select
                      value={countryIso2}
                      onChange={(e) => setCountryIso2(e.target.value)}
                      aria-label="Código de país"
                      className="w-44 shrink-0 truncate rounded-lg border border-border px-2 py-2.5 text-text focus:border-primary focus:outline-none"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.iso2} value={c.iso2}>
                          {flagEmoji(c.iso2)} {c.name} ({c.dial})
                        </option>
                      ))}
                    </select>
                    <input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="xx-xxxx-xxxx"
                      required
                      className="flex-1 rounded-lg border border-border px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                  <input
                    type="hidden"
                    name="phone"
                    value={phoneNumber ? `${selectedCountry.dial} ${phoneNumber}` : ''}
                  />
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-text">How did you hear about us?</span>
                  <select
                    name="referral_source"
                    defaultValue=""
                    className="rounded-lg border border-border px-4 py-2.5 text-text focus:border-primary focus:outline-none"
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {REFERRAL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <TextArea label="Message or notes" name="message" />
                <Checkbox
                  name="sms_consent"
                  label="Acepto recibir información relacionada con mi solicitud por SMS."
                  required
                />

                {villa.mainImage && subtotal !== null && (
                  <div className="flex items-center gap-4 rounded-xl border border-border p-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image src={villa.mainImage} alt={villa.title} fill sizes="80px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs tracking-widest text-text-muted uppercase">
                        {nights} {nights === 1 ? 'night' : 'nights'}
                      </p>
                      <p className="font-semibold">
                        Total: ${new Intl.NumberFormat('en-US').format(subtotal)} +21% taxes
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </BaseHubSpotForm>
          )}
        </div>

        {step === 'success' && (
          <div className="shrink-0 border-t border-border p-6">
            <Button onClick={handleClose} className="w-full">
              Exit
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
