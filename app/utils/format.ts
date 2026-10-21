/** BCP-47 tag for a site locale (Arabic UI keeps Latin digits for prices). */
export function localeTag(locale: string): string {
  return locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-EG';
}

export function formatPrice(
  amount: number | string | null | undefined,
  locale = 'ar',
  currency = 'EGP',
): string {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat(localeTag(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number | null | undefined, locale = 'ar'): string {
  return new Intl.NumberFormat(localeTag(locale)).format(Number(value ?? 0));
}

export function formatDate(
  date: string | Date | null | undefined,
  locale = 'ar',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat(localeTag(locale), options).format(d);
}

export function formatDateTime(date: string | Date | null | undefined, locale = 'ar'): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "3 hours ago" style label. */
export function formatRelativeTime(date: string | Date, locale = 'ar'): string {
  const diffSeconds = (new Date(date).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(localeTag(locale), { numeric: 'auto' });
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) return rtf.format(Math.round(diffSeconds / seconds), unit);
  }
  return rtf.format(Math.round(diffSeconds), 'second');
}

/** Short human order reference: `ORD-20261020-7K3F9Q` -> `7K3F9Q`. */
export function shortOrderNumber(orderNumber: string): string {
  return orderNumber.split('-').pop() ?? orderNumber;
}

export function initials(name = ''): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
