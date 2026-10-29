/**
 * Public origin of the store for absolute links (share buttons, canonical,
 * Open Graph, JSON-LD), without a trailing slash.
 *
 * It is `NUXT_PUBLIC_SITE_URL` / `NUXT_SITE_URL` when set; otherwise
 * nuxt-site-config resolves the domain the request came in on, so a
 * deployment that forgot the variable never hands out localhost links.
 */
export function useSiteUrl(): string {
  return (useSiteConfig().url || useRequestURL().origin).replace(/\/$/, '');
}
