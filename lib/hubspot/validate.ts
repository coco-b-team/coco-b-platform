import { formSchemas, type HubSpotFormType } from './schemas';

// Solo caracteres que realmente aparecen en emails reales — ver el mismo
// comentario en InquiryModal.tsx, donde se repite esta regex del lado del
// cliente.
const EMAIL = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type FormPayload = Record<string, string | number | boolean>;

export function validatePayload(type: HubSpotFormType, input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { data: null, error: 'Datos inválidos.' } as const;
  }

  const raw = input as Record<string, unknown>;
  const data: FormPayload = {};

  for (const [name, rule] of Object.entries(formSchemas[type])) {
    const value = raw[name];
    const missing = value === undefined || value === null || value === '' || value === false;

    if (rule.required && missing) {
      return { data: null, error: `Falta el campo ${name}.` } as const;
    }
    if (missing) continue;

    if (rule.type === 'boolean') {
      if (typeof value !== 'boolean')
        return { data: null, error: `El campo ${name} es inválido.` } as const;
      data[name] = value;
      continue;
    }

    const text = String(value).trim();
    if (rule.maxLength && text.length > rule.maxLength) {
      return { data: null, error: `El campo ${name} es demasiado largo.` } as const;
    }
    if (rule.type === 'email' && !EMAIL.test(text)) {
      return { data: null, error: 'El email no es válido.' } as const;
    }
    if (
      rule.type === 'date' &&
      (!DATE.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`)))
    ) {
      return { data: null, error: `La fecha ${name} no es válida.` } as const;
    }
    if (rule.type === 'number') {
      const number = Number(value);
      if (!Number.isInteger(number) || number < 1 || number > 500) {
        return { data: null, error: `El campo ${name} no es válido.` } as const;
      }
      data[name] = number;
      continue;
    }
    data[name] = text;
  }

  if (type === 'villa-wedding' && String(data.check_in_date) >= String(data.check_out_date)) {
    return { data: null, error: 'El check-out debe ser posterior al check-in.' } as const;
  }
  return { data, error: null } as const;
}
