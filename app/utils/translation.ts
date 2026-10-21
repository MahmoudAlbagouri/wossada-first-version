import type { Translation } from '~/types/models';

/** Translation for `locale`, else the first one (API may return one or all). */
export function pickTranslation<T extends Translation>(
  translations: readonly T[] | null | undefined,
  locale: string,
): T | undefined {
  if (!translations?.length) return undefined;
  return translations.find((t) => t.languageCode === locale) ?? translations[0];
}

/** `name` of the best translation, with a fallback for empty entities. */
export function translatedName(
  entity: { translations?: readonly (Translation & { name?: string | null })[] | null } | null | undefined,
  locale: string,
  fallback = '',
): string {
  return pickTranslation(entity?.translations, locale)?.name ?? fallback;
}

/** Builds the `[{ languageCode, ... }]` payload from a `{ ar: {...}, en: {...} }` form. */
export function toTranslations<T extends Record<string, unknown>>(
  byLang: Record<string, T>,
  isFilled: (value: T) => boolean,
): (T & { languageCode: string })[] {
  return Object.entries(byLang)
    .filter(([, value]) => isFilled(value))
    .map(([languageCode, value]) => ({ languageCode, ...value }));
}

/** Inverse of `toTranslations` for edit forms. */
export function fromTranslations<T extends Translation, V>(
  translations: readonly T[] | undefined,
  languages: readonly string[],
  map: (t: T | undefined) => V,
): Record<string, V> {
  return Object.fromEntries(
    languages.map((code) => [code, map(translations?.find((t) => t.languageCode === code))]),
  );
}

/** Languages the back office edits content in. */
export const ADMIN_LANGUAGES = ['ar', 'en'] as const;
export type AdminLanguage = (typeof ADMIN_LANGUAGES)[number];
