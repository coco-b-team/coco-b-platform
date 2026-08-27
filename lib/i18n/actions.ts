'use server';

import { cookies } from 'next/headers';
import { isLocale, type Locale } from '@/lib/i18n/locales';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set('locale', locale, { path: '/', maxAge: ONE_YEAR, sameSite: 'lax' });
}
