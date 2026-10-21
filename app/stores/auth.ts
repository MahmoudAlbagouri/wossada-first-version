import { defineStore } from 'pinia';
import type { ApiResponse } from '~/types/api';
import type { AuthSession, User, UserRole } from '~/types/models';

interface TokenClaims {
  sub: string;
  email: string;
  role: UserRole;
  exp?: number;
}

const ACCESS_COOKIE = 'auth_token';
const REFRESH_COOKIE = 'refresh_token';
const DAY = 60 * 60 * 24;

/** Reads JWT claims for UI decisions (the API still verifies every request). */
function decodeClaims(token: string | null | undefined): TokenClaims | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1] ?? '';
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json))) as TokenClaims;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig();
  const cookieOptions = {
    sameSite: 'lax' as const,
    secure: !import.meta.dev,
    path: '/',
  };
  const accessToken = useCookie<string | null>(ACCESS_COOKIE, { ...cookieOptions, maxAge: 7 * DAY });
  const refreshToken = useCookie<string | null>(REFRESH_COOKIE, { ...cookieOptions, maxAge: 30 * DAY });
  const user = ref<User | null>(null);
  const shop = useShopService();

  const claims = computed(() => decodeClaims(accessToken.value));
  const isLoggedIn = computed(() => !!accessToken.value);
  const role = computed<UserRole | null>(() => user.value?.role ?? claims.value?.role ?? null);
  const isAdmin = computed(() => role.value === 'admin');
  const displayName = computed(() => user.value?.name ?? claims.value?.email ?? '');

  let refreshing: Promise<boolean> | null = null;

  /** Auth calls bypass `$api` so a failing refresh can never loop. */
  const authFetch = <T>(path: string, init: { body?: unknown; token?: string } = {}) =>
    $fetch<ApiResponse<T>>(path, {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: init.body as Record<string, unknown> | undefined,
      headers: init.token ? { Authorization: `Bearer ${init.token}` } : undefined,
    }).then((r) => r.data);

  function setSession(session: AuthSession): void {
    accessToken.value = session.access_token;
    refreshToken.value = session.refresh_token;
    user.value = session.user;
  }

  function clearSession(): void {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
  }

  async function login(identifier: string, password: string): Promise<User> {
    const session = await authFetch<AuthSession>('/auth/login', { body: { identifier, password } });
    setSession(session);
    return session.user;
  }

  async function register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<User> {
    const session = await authFetch<AuthSession>('/auth/register', { body: payload });
    setSession(session);
    return session.user;
  }

  /** Concurrent 401s share one refresh request. */
  function refresh(): Promise<boolean> {
    if (!refreshToken.value) return Promise.resolve(false);
    refreshing ??= authFetch<AuthSession>('/auth/refresh-token', { token: refreshToken.value })
      .then((session) => {
        setSession(session);
        return true;
      })
      .catch(() => {
        clearSession();
        return false;
      })
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  }

  async function fetchUser(): Promise<User | null> {
    if (!accessToken.value) return null;
    try {
      user.value = await shop.getProfile();
    } catch {
      // `$api` already refreshed or cleared the session if the token was bad.
    }
    return user.value;
  }

  async function logout(): Promise<void> {
    const token = accessToken.value;
    clearSession();
    if (token) await authFetch('/auth/logout', { token }).catch(() => undefined);
  }

  return {
    accessToken,
    refreshToken,
    user,
    claims,
    isLoggedIn,
    role,
    isAdmin,
    displayName,
    setSession,
    clearSession,
    login,
    register,
    refresh,
    fetchUser,
    logout,
  };
});
