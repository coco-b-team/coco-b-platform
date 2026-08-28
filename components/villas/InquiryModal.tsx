'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  validatePhoneNumberLength,
  type CountryCode as LibPhoneCountryCode,
} from 'libphonenumber-js';
import { FaXmark, FaCheck, FaCalendarDays, FaUsers } from 'react-icons/fa6';
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

type Step = 'intro' | 'dates' | 'details' | 'success';

// Mismo patrón que lib/hubspot/validate.ts del lado del servidor — se
// repite acá (en vez de importarlo) porque ese módulo no está pensado
// para el cliente, y es una regex chica y estable.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cuánto se muestra la transición de carga antes de pasar al paso 1 — lo
// suficiente para sentirse intencional, sin llegar a frenar a alguien que
// ya usó el modal antes y solo quiere completar el formulario.
const INTRO_DURATION_MS = 1300;

function nightsBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateRange(start: Date, end: Date, locale: string) {
  const fmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

// Un solo rombo — la misma forma que usa el isotipo del logo y el
// DiamondDivider del splash real, para que este motivo de fondo se sienta
// parte de la misma marca en vez de un patrón genérico.
function Diamond({ x, y, size, opacity }: { x: number; y: number; size: number; opacity: number }) {
  return (
    <rect
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      transform={`rotate(45 ${x} ${y})`}
      stroke="currentColor"
      strokeWidth={1}
      fill="none"
      opacity={opacity}
    />
  );
}

// Un motivo de dos rombos por esquina, solo en las dos esquinas opuestas
// (el modal es angosto, cuatro esquinas se sentirían recargadas) — el
// mismo lenguaje decorativo que SplashScreen, a menor escala.
function IntroOrnament() {
  return (
    <svg
      viewBox="0 0 440 440"
      className="text-accent pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <Diamond x={44} y={44} size={22} opacity={0.3} />
      <Diamond x={74} y={74} size={11} opacity={0.18} />
      <Diamond x={396} y={396} size={22} opacity={0.3} />
      <Diamond x={366} y={366} size={11} opacity={0.18} />
    </svg>
  );
}

// Pantalla de transición al abrir el modal — reemplaza la aparición
// instantánea del formulario por un momento breve y de marca antes de
// pedirle datos a la persona.
function IntroTransition({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="from-text via-primary to-primary-light relative flex h-110 flex-col items-center justify-center overflow-hidden bg-linear-to-br px-8 text-center">
      <IntroOrnament />
      <Logo variant="splash" width={180} height={34} alt="Coco B Isla" className="relative" />
      <p className="text-background relative mt-8 text-lg font-medium">{title}</p>
      <p className="text-background/80 relative mt-2 max-w-xs text-sm">{subtitle}</p>
      <div className="relative mt-8 flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="border-background/80 h-2.5 w-2.5 rotate-45 animate-pulse border"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function InquiryModal({ villa, onClose }: { villa: ModalVilla; onClose: () => void }) {
  const t = useTranslations('inquiryModal');
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>('intro');
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [guests, setGuests] = useState(2);
  const [countryIso2, setCountryIso2] = useState('US');
  const [phoneNumber, setPhoneNumber] = useState('');
  const selectedCountry = COUNTRY_CODES.find((c) => c.iso2 === countryIso2) ?? COUNTRY_CODES[0];
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
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

  useEffect(() => {
    if (step !== 'intro') return;
    const timer = setTimeout(() => setStep('dates'), INTRO_DURATION_MS);
    return () => clearTimeout(timer);
  }, [step]);

  function handleClose() {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setVisible(false);
    setTimeout(onClose, 250);
  }

  // Recién muestra el error de formato una vez que la persona salió del
  // campo una vez (blur) o ya intentó enviar — no antes, para no marcar
  // "inválido" mientras todavía está escribiendo la primera vez. Una vez
  // mostrado, sí se actualiza en cada tecla (por eso el chequeo de
  // `emailTouched` también corre en el onChange).
  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    if (!emailTouched) return;
    const value = e.target.value.trim();
    setEmailError(value && !EMAIL_REGEX.test(value) ? t('invalidEmail') : '');
  }

  function handleEmailBlur(e: FocusEvent<HTMLInputElement>) {
    setEmailTouched(true);
    const value = e.target.value.trim();
    setEmailError(value && !EMAIL_REGEX.test(value) ? t('invalidEmail') : '');
  }

  // A diferencia del email, acá también se bloquea activamente escribir
  // más dígitos de los que el país seleccionado puede tener — no solo se
  // avisa después. `validatePhoneNumberLength` conoce el largo real de
  // cada plan de numeración (no es un maxLength fijo: varía por país).
  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    let digits = e.target.value.replace(/\D/g, '');
    const country = selectedCountry.iso2 as LibPhoneCountryCode;
    // Recorta desde el final en vez de solo bloquear la última tecla — así
    // también funciona bien si el número llega pegado (paste) de una vez,
    // no solo tecleado dígito a dígito.
    while (digits.length > 0 && validatePhoneNumberLength(digits, country) === 'TOO_LONG') {
      digits = digits.slice(0, -1);
    }
    setPhoneNumber(digits);
    if (phoneTouched) {
      setPhoneError(digits && validatePhoneNumberLength(digits, country) ? t('invalidPhone') : '');
    }
  }

  function handlePhoneBlur() {
    setPhoneTouched(true);
    const country = selectedCountry.iso2 as LibPhoneCountryCode;
    setPhoneError(
      phoneNumber && validatePhoneNumberLength(phoneNumber, country) ? t('invalidPhone') : '',
    );
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
        {step === 'intro' && (
          <IntroTransition
            title={t('preparingTitle')}
            subtitle={t('preparingSubtitle', { name: villa.title })}
          />
        )}

        {(step === 'dates' || step === 'details') && (
          <div className="relative shrink-0">
            <div className="relative h-28 w-full overflow-hidden">
              {villa.mainImage ? (
                <Image
                  src={villa.mainImage}
                  alt={villa.title}
                  fill
                  sizes="448px"
                  className="object-cover"
                />
              ) : (
                <div className="bg-primary h-full w-full" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/10" />
              <Logo variant="white" width={84} height={16} className="absolute top-5 left-6" />
              <button
                onClick={handleClose}
                aria-label={t('close')}
                className="absolute top-4 right-5 text-white/90 hover:text-white"
              >
                <FaXmark size={20} />
              </button>
              <div className="absolute inset-x-6 bottom-4">
                <p className="text-xs tracking-widest text-white/80 uppercase">
                  {t('villaEyebrow')}
                </p>
                <h2 className="font-body mt-1 text-xl font-semibold text-white uppercase">
                  {villa.title}
                </h2>
              </div>
            </div>
            <div className="bg-background-alt h-1 w-full">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: step === 'dates' ? '50%' : '100%' }}
              />
            </div>
          </div>
        )}

        {step !== 'intro' && (
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

                  {range.start && range.end && (
                    <div className="border-border bg-background-alt/60 flex flex-col gap-2 rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-text flex min-w-0 items-center gap-1.5 text-sm font-medium">
                          <FaCalendarDays size={12} className="text-primary shrink-0" />
                          <span className="truncate">
                            {formatDateRange(range.start, range.end, locale)}
                          </span>
                        </p>
                        <p className="text-text flex shrink-0 items-center gap-1.5 text-sm font-medium">
                          <FaUsers size={12} className="shrink-0" />
                          {t('guestsCount', { count: guests })}
                        </p>
                      </div>
                      {subtotal !== null && (
                        <div className="border-border flex items-center justify-between gap-3 border-t pt-2">
                          <span className="text-text-muted text-xs tracking-widest uppercase">
                            {t('nights', { count: nights })}
                          </span>
                          <span className="text-text text-sm font-semibold">
                            {t('total', {
                              amount: new Intl.NumberFormat('en-US').format(subtotal),
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Input label={t('firstName')} name="first_name" required maxLength={100} />
                  <Input label={t('lastName')} name="last_name" required maxLength={100} />
                  <Input
                    label={t('email')}
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    error={emailError}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text text-sm font-medium">{t('phoneNumber')}</label>
                    <div className="flex gap-2">
                      <CountryCodeSelect
                        value={countryIso2}
                        onChange={(iso2) => {
                          setCountryIso2(iso2);
                          if (phoneTouched && phoneNumber) {
                            setPhoneError(
                              validatePhoneNumberLength(phoneNumber, iso2 as LibPhoneCountryCode)
                                ? t('invalidPhone')
                                : '',
                            );
                          }
                        }}
                        ariaLabel={t('countryCodeAriaLabel')}
                      />
                      <input
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        placeholder={t('phonePlaceholder')}
                        required
                        aria-invalid={Boolean(phoneError)}
                        className={`text-text placeholder:text-text-muted focus:border-primary flex-1 rounded-lg border px-4 py-2.5 focus:outline-none ${
                          phoneError ? 'border-error' : 'border-border'
                        }`}
                      />
                    </div>
                    {phoneError && <p className="text-error text-sm">{phoneError}</p>}
                    <input
                      type="hidden"
                      name="phone"
                      value={phoneNumber ? `${selectedCountry.dial} ${phoneNumber}` : ''}
                    />
                  </div>

                  <label className="border-border flex flex-col gap-1.5 border-t pt-5">
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
                  <Checkbox name="sms_consent" label={t('smsConsent')} />
                </div>
              </BaseHubSpotForm>
            )}
          </div>
        )}

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
