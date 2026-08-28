import type { FormPayload } from './validate';

const HUBSPOT_NAMES: Record<string, string> = {
  first_name: 'firstname',
  last_name: 'lastname',
};

// Propiedades tipo "date" en HubSpot — la API de CRM las espera como
// epoch ms a medianoche UTC, no como el string "YYYY-MM-DD" que maneja
// el resto de la app.
const DATE_FIELDS = new Set(['check_in_date', 'check_out_date']);

// El endpoint público de envío de formularios (api.hsforms.com) puede
// devolver 200 y aun así descartar el envío en silencio cuando la
// llamada viene de un servidor (IP de datacenter, sin cookie de
// tracking de HubSpot) — pasó en producción (Vercel) mientras que en
// local, con la misma IP residencial que trackea HubSpot, sí funcionaba.
// La API de CRM autenticada con el token de la private app no tiene ese
// problema: si algo falla, responde con un error real en vez de
// tragárselo.
export async function submitToHubSpot(data: FormPayload) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error('HUBSPOT_ACCESS_TOKEN no está configurado.');

  const email = String(data.email ?? '');
  if (!email) throw new Error('Falta el email.');

  const properties: Record<string, string> = {};
  for (const [name, value] of Object.entries(data)) {
    const key = HUBSPOT_NAMES[name] ?? name;
    properties[key] = DATE_FIELDS.has(name)
      ? String(Date.parse(`${value}T00:00:00Z`))
      : String(value);
  }

  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: [{ idProperty: 'email', id: email, properties }] }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('[hubspot] submission failed', response.status, detail.slice(0, 500));
    throw new Error('HubSpot rechazó el envío.');
  }
}
