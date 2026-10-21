import type { Translation } from '~/types/models';

/**
 * Locale-aware helpers for templates: names from translation arrays,
 * prices, dates and the brand strings from `app.config.ts`.
 */
export function useLocalized() {
  const { locale } = useI18n();
  const appConfig = useAppConfig();

  const lang = computed(() => locale.value);
  const isRtl = computed(() => locale.value === 'ar');

  return {
    lang,
    isRtl,
    name: (
      entity: { translations?: readonly (Translation & { name?: string | null })[] | null } | null | undefined,
      fallback = '',
    ) => translatedName(entity, locale.value, fallback),
    pick: <T extends Translation>(translations: readonly T[] | null | undefined) =>
      pickTranslation(translations, locale.value),
    /** Picks the `{ ar, en }` value for the current locale. */
    text: (value: { ar: string; en: string } | string | undefined) =>
      typeof value === 'string' ? value : (value?.[locale.value as 'ar' | 'en'] ?? value?.ar ?? ''),
    price: (amount: number | string | null | undefined) =>
      formatPrice(amount, locale.value, appConfig.brand.currency),
    number: (value: number | null | undefined) => formatNumber(value, locale.value),
    date: (value: string | Date | null | undefined) => formatDate(value, locale.value),
    dateTime: (value: string | Date | null | undefined) => formatDateTime(value, locale.value),
    relative: (value: string | Date) => formatRelativeTime(value, locale.value),
    /** City/governorate entities carry `nameAr` / `nameEn` columns. */
    placeName: (place: { nameAr: string; nameEn: string } | null | undefined) =>
      place ? (locale.value === 'ar' ? place.nameAr : place.nameEn || place.nameAr) : '',
  };
}
