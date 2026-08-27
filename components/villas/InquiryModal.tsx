'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FaXmark, FaCheck } from 'react-icons/fa6';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { Checkbox, TextArea } from '@/components/forms/FormFields';
import { DateRangePicker } from '@/components/forms/DateRangePicker';
import { BaseHubSpotForm } from '@/components/forms/BaseHubSpotForm';
import { CountryCodeSelect } from '@/components/villas/CountryCodeSelect';
import { estimateGuestCapacity } from '@/lib/villas';
import { COUNTRY_CODES } from '@/lib/countryCodes';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

// Margen fijo por sobre la capacidad real de la villa — sin explicarlo en
// pantalla, el "+" del contador de huéspedes simplemente deja de avanzar.
const GUEST_CAPACITY_MARGIN = 5;

// `value` es lo que se manda a HubSpot como `referral_source` — queda fijo
// en inglés en los 3 idiomas para que el reporte en HubSpot no se
// fragmente por idioma. Solo `labelKey` (el texto visible del <option>)
// cambia con el locale.
const REFERRAL_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'Google search', labelKey: 'referral.google' },
  { value: 'Instagram', labelKey: 'referral.instagram' },
  { value: 'Facebook', labelKey: 'referral.facebook' },
  { value: 'Referral from a friend', labelKey: 'referral.friend' },
  { value: 'Travel agent', labelKey: 'referral.travelAgent' },
  { value: 'Press or magazine', labelKey: 'referral.press' },
  { value: 'Other', labelKey: 'referral.other' },
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
  const t = useTranslations('inquiryModal');
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>('dates');
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [guests, setGuests] = useState(2);
  const [countryIso2, setCountryIso2] = useState('US');
  const [phoneNumber, setPhoneNumber] = useState('');
  const selectedCountry = COUNTRY_CODES.find((c) => c.iso2 === countryIso2) ?? COUNTRY_CODES[0];
  const exitingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);
  const trapRef = useFocusTrap(true);

  // Los pasos 1 y 2 comparten el mismo contenedor con scroll (nunca se
  // desmontan, solo se ocultan con CSS) — sin esto, si alguien scrollea
  // dentro del paso 1 antes de avanzar, el paso 2 arranca mostrando esa
  // misma posición en vez de su propio inicio.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

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
  const guestMax =
    (estimateGuestCapacity(villa.guestCapacity, villa.bedrooms) ?? 20) + GUEST_CAPACITY_MARGIN;

  return createPortal(
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <button
        aria-label={t('close')}
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-250 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />

      <div
        ref={trapRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-label={
          step === 'success'
            ? t('requestSentAriaLabel')
            : t('reserveAriaLabel', { name: villa.title })
        }
        tabIndex={-1}
        className={`bg-background relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl shadow-xl transition-all duration-250 ease-out ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {step !== 'success' && (
          <div className="border-border flex shrink-0 items-start justify-between border-b px-6 pt-6 pb-4">
            <div>
              <p className="text-text-muted text-xs tracking-widest uppercase">
                {t('villaEyebrow')}
              </p>
              <h2 className="font-body mt-1 text-xl font-semibold uppercase">{villa.title}</h2>
            </div>
            <button
              onClick={handleClose}
              aria-label={t('close')}
              className="text-text-muted hover:text-text"
            >
              <FaXmark size={20} />
            </button>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {step === 'success' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Logo width={140} height={27} alt="Coco B Isla" />
              <div className="bg-primary mt-8 flex h-16 w-16 items-center justify-center rounded-full">
                <FaCheck size={26} className="text-background" />
              </div>
              <h3 className="text-text mt-6 text-lg font-semibold">{t('thankYouTitle')}</h3>
              <p className="text-text-muted mt-2">{t('thankYouBody')}</p>
            </div>
          ) : (
            <BaseHubSpotForm
              formType="villa-wedding"
              submitLabel={t('sendRequest')}
              showSubmitButton={step === 'details'}
              hideTurnstile={step !== 'details'}
              onSuccess={() => setStep('success')}
            >
              <input type="hidden" name="villa_id" value={villa.title} />
              {/* No es un campo de HubSpot — se usa server-side solo para
                  saber qué calendario de disponibilidad actualizar. */}
              <input type="hidden" name="villa_key" value={String(villa.id)} />

              <div className={step === 'dates' ? '' : 'hidden'}>
                <p className="text-text-muted mb-4 text-xs tracking-widest uppercase">
                  {t('step1')}
                </p>
                <DateRangePicker
                  villaKey={String(villa.id)}
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
                  {t('next')}
                </Button>
              </div>

              <div className={step === 'details' ? 'flex flex-col gap-5' : 'hidden'}>
                <p className="text-text-muted text-xs tracking-widest uppercase">{t('step2')}</p>

                <Input label={t('firstName')} name="first_name" required maxLength={100} />
                <Input label={t('lastName')} name="last_name" required maxLength={100} />
                <Input label={t('email')} name="email" type="email" required maxLength={254} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-text text-sm font-medium">{t('phoneNumber')}</label>
                  <div className="flex gap-2">
                    <CountryCodeSelect
                      value={countryIso2}
                      onChange={setCountryIso2}
                      ariaLabel={t('countryCodeAriaLabel')}
                    />
                    <input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t('phonePlaceholder')}
                      required
                      className="border-border text-text placeholder:text-text-muted focus:border-primary flex-1 rounded-lg border px-4 py-2.5 focus:outline-none"
                    />
                  </div>
                  <input
                    type="hidden"
                    name="phone"
                    value={phoneNumber ? `${selectedCountry.dial} ${phoneNumber}` : ''}
                  />
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-text text-sm font-medium">{t('howDidYouHear')}</span>
                  <select
                    name="referral_source"
                    defaultValue=""
                    className="border-border text-text focus:border-primary rounded-lg border px-4 py-2.5 focus:outline-none"
                  >
                    <option value="" disabled>
                      {t('selectOption')}
                    </option>
                    {REFERRAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                </label>

                <TextArea label={t('message')} name="message" />
                <Checkbox name="sms_consent" label={t('smsConsent')} required />

                {villa.mainImage && subtotal !== null && (
                  <div className="border-border flex items-center gap-4 rounded-xl border p-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={villa.mainImage}
                        alt={villa.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-text-muted text-xs tracking-widest uppercase">
                        {t('nights', { count: nights })}
                      </p>
                      <p className="font-semibold">
                        {t('total', { amount: new Intl.NumberFormat('en-US').format(subtotal) })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </BaseHubSpotForm>
          )}
        </div>

        {step === 'success' && (
          <div className="border-border shrink-0 border-t p-6">
            <Button onClick={handleClose} className="w-full">
              {t('exit')}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
