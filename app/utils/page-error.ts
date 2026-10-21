/**
 * Turns a failed page fetch into Nuxt's error page with the right status
 * (404 for unknown slugs, so search engines drop the URL).
 */
export function failPage(error: { statusCode?: number; message?: string } | null | undefined): void {
  if (!error) return;
  const statusCode = error.statusCode === 404 ? 404 : error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
  throw createError({ statusCode, statusMessage: error.message, fatal: true });
}
