import type { HubSpotFormType } from './schemas';
import type { FormPayload } from './validate';

const FORM_ID_ENV: Record<HubSpotFormType, string> = {
  'villa-wedding': 'HUBSPOT_VILLA_FORM_ID',
  'retreat-host': 'HUBSPOT_RETREAT_FORM_ID',
  'popup-waitlist': 'HUBSPOT_WAITLIST_FORM_ID',
};

const HUBSPOT_NAMES: Record<string, string> = {
  first_name: 'firstname',
  last_name: 'lastname',
};

type SubmissionContext = { hutk?: string; pageUri?: string; pageName?: string };

export async function submitToHubSpot(
  type: HubSpotFormType,
  data: FormPayload,
  context: SubmissionContext,
) {
  const portalId = process.env.HUBSPOT_PORTAL_ID ?? '51822684';
  const formId = process.env[FORM_ID_ENV[type]];
  if (!formId) throw new Error(`${FORM_ID_ENV[type]} no está configurado.`);

  const fields = Object.entries(data).map(([name, value]) => ({
    name: HUBSPOT_NAMES[name] ?? name,
    value: typeof value === 'boolean' ? String(value) : String(value),
  }));

  const response = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, context }),
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error('[hubspot] submission failed', response.status, detail.slice(0, 500));
    throw new Error('HubSpot rechazó el envío.');
  }
}

