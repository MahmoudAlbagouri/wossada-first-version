/** Store identity in the current language (from `app.config.ts` / env). */
export function useBrand() {
  const appConfig = useAppConfig();
  const config = useRuntimeConfig();
  const { locale } = useI18n();

  const pick = (value: { ar: string; en: string }) =>
    value[locale.value as 'ar' | 'en'] ?? value.ar;

  const brandName = computed(() => config.public.siteName || pick(appConfig.brand.name));

  return {
    brandName,
    tagline: computed(() => pick(appConfig.brand.tagline)),
    brandDescription: computed(() => pick(appConfig.brand.description)),
    address: computed(() => pick(appConfig.contact.address)),
    logo: appConfig.brand.logo,
    ogImage: appConfig.brand.ogImage,
    contact: appConfig.contact,
    social: appConfig.social,
  };
}
