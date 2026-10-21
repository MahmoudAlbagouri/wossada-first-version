const COOKIE = 'i18n_locale';

/**
 * Arabic-first store: a page visit without a saved language is treated as
 * Arabic instead of guessing from `Accept-Language`. Every URL therefore has
 * one indexable language for crawlers; the switcher saves the visitor's choice.
 */
export default defineEventHandler((event) => {
  if (getCookie(event, COOKIE)) return;
  if (!getRequestHeader(event, 'accept')?.includes('text/html')) return;

  const cookies = event.node.req.headers.cookie;
  event.node.req.headers.cookie = cookies ? `${cookies}; ${COOKIE}=ar` : `${COOKIE}=ar`;
  setCookie(event, COOKIE, 'ar', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
});
