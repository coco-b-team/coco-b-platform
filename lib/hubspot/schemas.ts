export const formTypes = ['villa-wedding', 'retreat-host', 'popup-waitlist'] as const;

export type HubSpotFormType = (typeof formTypes)[number];

type FieldRule = {
  required?: boolean;
  type?: 'string' | 'email' | 'number' | 'date' | 'boolean';
  maxLength?: number;
};

export const formSchemas: Record<HubSpotFormType, Record<string, FieldRule>> = {
  'villa-wedding': {
    villa_id: { required: true, maxLength: 100 },
    check_in_date: { required: true, type: 'date' },
    check_out_date: { required: true, type: 'date' },
    guest_count: { required: true, type: 'number' },
    flexible_dates: { type: 'boolean' },
    first_name: { required: true, maxLength: 100 },
    last_name: { required: true, maxLength: 100 },
    email: { required: true, type: 'email', maxLength: 254 },
    phone: { required: true, maxLength: 40 },
    message: { maxLength: 2000 },
    sms_consent: { required: true, type: 'boolean' },
  },
  'retreat-host': {
    first_name: { required: true, maxLength: 100 },
    last_name: { required: true, maxLength: 100 },
    email: { required: true, type: 'email', maxLength: 254 },
    phone: { required: true, maxLength: 40 },
    organization: { maxLength: 150 },
    retreat_type: { required: true, maxLength: 100 },
    preferred_start_date: { type: 'date' },
    preferred_end_date: { type: 'date' },
    estimated_guest_count: { required: true, type: 'number' },
    experience_level: { maxLength: 100 },
    message: { maxLength: 2000 },
  },
  'popup-waitlist': {
    first_name: { required: true, maxLength: 100 },
    last_name: { required: true, maxLength: 100 },
    email: { required: true, type: 'email', maxLength: 254 },
    phone: { maxLength: 40 },
    preferred_dates: { maxLength: 250 },
    guest_count: { type: 'number' },
    marketing_consent: { required: true, type: 'boolean' },
  },
};

export function isFormType(value: string): value is HubSpotFormType {
  return formTypes.includes(value as HubSpotFormType);
}

