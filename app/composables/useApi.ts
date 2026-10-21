import type { ApiClient } from '~/plugins/01.api';

/**
 * Typed access to the shared API client (see `plugins/01.api.ts`).
 * The Nuxt app is captured now, the client is resolved per call, so stores
 * created while plugins are still booting keep working.
 */
export function useApi(): ApiClient {
  const nuxtApp = useNuxtApp();
  return (url, options) => (nuxtApp.$api as ApiClient)(url, options);
}
