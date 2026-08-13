'use client';

import { Input } from '@/components/ui/Input';
import { BaseHubSpotForm } from './BaseHubSpotForm';
import { Checkbox } from './FormFields';

export function PopupWaitlistForm() {
  return (
    <BaseHubSpotForm formType="popup-waitlist" submitLabel="Unirme a la lista">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Nombre" name="first_name" required maxLength={100} />
        <Input label="Apellido" name="last_name" required maxLength={100} />
        <Input label="Email" name="email" type="email" required maxLength={254} />
        <Input label="Teléfono (opcional)" name="phone" type="tel" maxLength={40} />
        <Input label="Fechas preferidas" name="preferred_dates" maxLength={250} />
        <Input label="Huéspedes" name="guest_count" type="number" min={1} max={500} />
      </div>
      <Checkbox name="marketing_consent" label="Acepto recibir novedades y disponibilidad del pop-up hotel." required />
    </BaseHubSpotForm>
  );
}

