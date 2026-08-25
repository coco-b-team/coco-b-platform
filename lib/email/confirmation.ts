import type { HubSpotFormType } from '@/lib/hubspot/schemas';
import type { FormPayload } from '@/lib/hubspot/validate';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function text(data: FormPayload, field: string) {
  const value = data[field];
  return value === undefined ? '' : String(value);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[
        character
      ] ?? character,
  );
}

function confirmationContent(type: HubSpotFormType, data: FormPayload) {
  const firstName = text(data, 'first_name');
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,';

  if (type === 'villa-wedding') {
    const checkIn = text(data, 'check_in_date');
    const checkOut = text(data, 'check_out_date');
    const guests = text(data, 'guest_count');

    return {
      subject: 'Recibimos tu solicitud | Coco B Isla',
      heading: 'Tu solicitud está en camino',
      intro: 'Gracias por considerar Coco B Isla. Nuestro equipo revisará la disponibilidad y se pondrá en contacto contigo pronto.',
      details: [
        ['Check-in', checkIn],
        ['Check-out', checkOut],
        ['Huéspedes', guests],
      ],
      plainText: `${greeting}\n\nGracias por considerar Coco B Isla. Recibimos tu solicitud para ${checkIn}–${checkOut}, para ${guests} huésped(es). Nuestro equipo revisará la disponibilidad y se pondrá en contacto contigo pronto.\n\nCoco B Isla`,
    };
  }

  const preferredDates = text(data, 'preferred_dates');
  return {
    subject: 'Ya estás en la lista | Coco B Isla',
    heading: '¡Bienvenido a la lista!',
    intro: 'Gracias por registrarte. Te avisaremos cuando tengamos novedades y disponibilidad para el pop-up hotel.',
    details: preferredDates ? [['Fechas preferidas', preferredDates]] : [],
    plainText: `${greeting}\n\nGracias por registrarte. Te avisaremos cuando tengamos novedades y disponibilidad para el pop-up hotel.\n\nCoco B Isla`,
  };
}

export async function sendConfirmationEmail(type: HubSpotFormType, data: FormPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = text(data, 'email');
  if (!to) return;

  const from = process.env.EMAIL_FROM ?? 'Coco B Isla <reservations@cocobisla.com>';
  const replyTo = process.env.EMAIL_REPLY_TO ?? 'reservations@cocobisla.com';
  const firstName = text(data, 'first_name');
  const content = confirmationContent(type, data);
  const detailRows = content.details
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b6b63">${escapeHtml(label)}</td><td style="padding:6px 0"><strong>${escapeHtml(value)}</strong></td></tr>`,
    )
    .join('');

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject: content.subject,
      text: content.plainText,
      html: `<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body style="margin:0;background:#f4f1ea;font-family:Arial,sans-serif;color:#292923"><div style="max-width:600px;margin:0 auto;padding:48px 24px"><div style="background:#fff;padding:40px;border-radius:16px"><p style="margin-top:0">${escapeHtml(firstName ? `Hola ${firstName},` : 'Hola,')}</p><h1 style="font-family:Georgia,serif;font-size:30px;font-weight:normal">${escapeHtml(content.heading)}</h1><p style="font-size:16px;line-height:1.7">${escapeHtml(content.intro)}</p>${detailRows ? `<table style="margin:24px 0;border-collapse:collapse">${detailRows}</table>` : ''}<p style="margin:32px 0 0;color:#6b6b63">Coco B Isla</p></div></div></body></html>`,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend rechazó el envío (${response.status}): ${detail.slice(0, 300)}`);
  }
}
