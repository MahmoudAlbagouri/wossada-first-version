import type { FetchError, FetchOptions, ResponseType } from 'ofetch';
import { ApiError, type ApiErrorBody, type ApiResponse } from '~/types/api';

export type ApiOptions = Omit<FetchOptions<'json'>, 'body'> & {
  body?: unknown;
  /** Internal: set on the single retry after a token refresh. */
  _retried?: boolean;
  /** Return the raw blob (file downloads) instead of unwrapping `data`. */
  raw?: boolean;
};

export type ApiClient = <T>(url: string, options?: ApiOptions) => Promise<T>;

/** `$fetch` without Nitro's route typing (the API is a separate server). */
type Fetcher = <T>(url: string, options?: FetchOptions<ResponseType>) => Promise<T>;

function toApiError(error: unknown): ApiError {
  const fetchError = error as FetchError<ApiErrorBody>;
  const body = fetchError.data;
  const status = fetchError.response?.status ?? fetchError.statusCode ?? 0;
  if (body && typeof body === 'object' && 'message' in body) {
    return new ApiError(body.message, status, body.errors ?? {}, body.error);
  }
  return new ApiError(status === 0 ? 'NETWORK_ERROR' : fetchError.message, status);
}

/**
 * The only HTTP client of the app (`useApi()` / `$api`):
 * base URL, language + auth headers, envelope unwrapping, one transparent
 * token refresh on 401, and normalized `ApiError`s.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const locale = () => (nuxtApp.$i18n as { locale: { value: string } }).locale.value;

  const http = $fetch.create({
    baseURL: config.public.apiBase,
    retry: 0,
    onRequest({ options }) {
      const headers = new Headers(options.headers as HeadersInit | undefined);
      headers.set('Accept', 'application/json');
      headers.set('lang', locale());
      headers.set('Accept-Language', locale());
      if (auth.accessToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${auth.accessToken}`);
      }
      options.headers = headers;
    },
  }) as unknown as Fetcher;

  const api: ApiClient = async <T>(url: string, options: ApiOptions = {}): Promise<T> => {
    try {
      if (options.raw) {
        return await http<T>(url, { ...(options as FetchOptions), responseType: 'blob' });
      }
      const response = await http<ApiResponse<T>>(url, options as FetchOptions);
      return response.data;
    } catch (error) {
      const status = (error as FetchError).response?.status;
      const canRefresh =
        status === 401 && !options._retried && !!auth.refreshToken && !url.startsWith('/auth/');

      if (canRefresh && (await auth.refresh())) {
        return api<T>(url, { ...options, _retried: true });
      }
      if (status === 401 && auth.isLoggedIn) {
        auth.clearSession();
        if (import.meta.client) {
          const route = useRoute();
          await navigateTo({ path: '/login', query: { redirect: route.fullPath } });
        }
      }
      throw toApiError(error);
    }
  };

  return { provide: { api } };
});
