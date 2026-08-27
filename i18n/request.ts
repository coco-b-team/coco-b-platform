import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/locales';

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieValue = store.get('locale')?.value;
  const locale = cookieValue && isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
