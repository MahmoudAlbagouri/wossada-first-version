import { ApiError } from '~/types/api';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  action?: { label: string; to: string };
  duration: number;
}

let nextId = 1;

/** App-wide notifications rendered by `<ToastHost />` in `app.vue`. */
export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => []);
  const { t } = useI18n();

  function dismiss(id: number): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  function show(
    type: ToastType,
    message: string,
    options: Partial<Pick<Toast, 'title' | 'action' | 'duration'>> = {},
  ): number {
    const id = nextId++;
    const duration = options.duration ?? (type === 'error' ? 6000 : 3500);
    toasts.value = [...toasts.value.slice(-3), { id, type, message, duration, ...options }];
    if (import.meta.client && duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }

  /** Friendly message for any thrown error (API, network or unknown). */
  function errorMessage(error: unknown, fallback = t('errors.generic')): string {
    if (error instanceof ApiError) {
      if (error.status === 0) return t('errors.network');
      return error.message || fallback;
    }
    return fallback;
  }

  return {
    toasts,
    dismiss,
    success: (message: string, options?: Parameters<typeof show>[2]) => show('success', message, options),
    info: (message: string, options?: Parameters<typeof show>[2]) => show('info', message, options),
    warning: (message: string, options?: Parameters<typeof show>[2]) => show('warning', message, options),
    error: (message: string, options?: Parameters<typeof show>[2]) => show('error', message, options),
    /** `toast.fromError(e)` shows the API message, or a generic one. */
    fromError: (error: unknown, fallback?: string) => show('error', errorMessage(error, fallback)),
    errorMessage,
  };
}
