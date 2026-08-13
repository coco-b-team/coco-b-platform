'use client';

import { Input } from '@/components/ui/Input';
import { BaseHubSpotForm } from './BaseHubSpotForm';
import { ContactFields, TextArea } from './FormFields';

export function RetreatHostForm() {
  return (
    <BaseHubSpotForm formType="retreat-host" submitLabel="Consultar el espacio">
      <ContactFields />
      <Input label="Organización o marca" name="organization" maxLength={150} />
      <Input label="Tipo de retreat" name="retreat_type" required maxLength={100} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Input label="Fecha inicial preferida" name="preferred_start_date" type="date" />
        <Input label="Fecha final preferida" name="preferred_end_date" type="date" />
        <Input label="Huéspedes estimados" name="estimated_guest_count" type="number" min={1} max={500} required />
      </div>
      <Input label="Experiencia organizando retreats" name="experience_level" maxLength={100} />
      <TextArea label="Cuéntanos sobre tu retreat" name="message" />
    </BaseHubSpotForm>
  );
}

