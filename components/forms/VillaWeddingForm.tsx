'use client';

import { Input } from '@/components/ui/Input';
import { BaseHubSpotForm } from './BaseHubSpotForm';
import { Checkbox, ContactFields, TextArea } from './FormFields';

export function VillaWeddingForm({ villaId = '' }: { villaId?: string }) {
  return (
    <BaseHubSpotForm formType="villa-wedding" submitLabel="Solicitar disponibilidad">
      <input type="hidden" name="villa_id" value={villaId} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Input label="Check-in" name="check_in_date" type="date" required />
        <Input label="Check-out" name="check_out_date" type="date" required />
        <Input label="Huéspedes" name="guest_count" type="number" min={1} max={500} required />
      </div>
      <Checkbox name="flexible_dates" label="Mis fechas son flexibles" />
      <ContactFields />
      <TextArea label="Mensaje o notas" name="message" />
      <Checkbox name="sms_consent" label="Acepto recibir información relacionada con mi solicitud por SMS." required />
    </BaseHubSpotForm>
  );
}

