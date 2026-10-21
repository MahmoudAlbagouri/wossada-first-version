export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** `danger` styles the confirm button red (deletes, cancellations). */
  tone?: 'danger' | 'primary';
  icon?: string;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve?: (value: boolean) => void;
}

/**
 * Promise-based confirmation dialog rendered once by `<ConfirmHost />`:
 * `if (await confirm({ title: 'Delete?' , tone: 'danger' })) ...`
 */
export function useConfirm() {
  const state = useState<ConfirmState>('confirm-dialog', () => ({ open: false, title: '' }));

  function confirm(options: ConfirmOptions): Promise<boolean> {
    state.value.resolve?.(false);
    return new Promise<boolean>((resolve) => {
      state.value = { ...options, open: true, resolve };
    });
  }

  function settle(value: boolean): void {
    state.value.resolve?.(value);
    state.value = { ...state.value, open: false, resolve: undefined };
  }

  return { state, confirm, settle };
}
