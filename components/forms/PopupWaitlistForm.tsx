'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { BaseHubSpotForm } from './BaseHubSpotForm';
import { Checkbox } from './FormFields';

export function PopupWaitlistForm() {
  const t = useTranslations('waitlist');
  const tFields = useTranslations('forms.fields');
  return (
    <BaseHubSpotForm formType="popup-waitlist" submitLabel={t('submitLabel')}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label={tFields('firstName')} name="first_name" required maxLength={100} />
        <Input label={tFields('lastName')} name="last_name" required maxLength={100} />
        <Input label={tFields('email')} name="email" type="email" required maxLength={254} />
        <Input label={t('phoneOptional')} name="phone" type="tel" maxLength={40} />
        <Input label={t('preferredDates')} name="preferred_dates" maxLength={250} />
        <Input label={t('guests')} name="guest_count" type="number" min={1} max={500} />
      </div>
      <Checkbox name="marketing_consent" label={t('consent')} required />
    </BaseHubSpotForm>
  );
}

