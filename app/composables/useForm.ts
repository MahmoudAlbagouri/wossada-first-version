import { ApiError } from '~/types/api';

/** Returns `true` when valid, else the error message. */
export type Rule<V = unknown, T = object> = (value: V, values: T) => true | string;

export type FormRules<T> = { [K in keyof T]?: Rule<T[K], T>[] };

/**
 * Small typed form helper used by every form in the app:
 * client-side rules, API field errors mapped onto inputs, a submitting flag
 * and a form-level error for anything that is not tied to a field.
 *
 * ```ts
 * const form = useForm(() => ({ email: '', password: '' }), { email: [v.required(), v.email()] });
 * const submit = form.handleSubmit(async (values) => auth.login(values.email, values.password));
 * ```
 */
export function useForm<T extends object>(initial: () => T, rules: FormRules<T> = {}) {
  const values = reactive(initial()) as T;
  const errors = reactive({}) as Partial<Record<keyof T, string>>;
  const submitting = ref(false);
  const formError = ref<string | null>(null);
  const toast = useToast();

  // Typing in a field clears its error.
  for (const key of Object.keys(values) as (keyof T)[]) {
    watch(
      () => values[key],
      () => {
        if (errors[key]) delete errors[key];
      },
      { deep: true },
    );
  }

  function validateField(key: keyof T): boolean {
    for (const rule of rules[key] ?? []) {
      const result = rule(values[key], values);
      if (result !== true) {
        errors[key] = result;
        return false;
      }
    }
    delete errors[key];
    return true;
  }

  function validate(): boolean {
    let valid = true;
    for (const key of Object.keys(rules) as (keyof T)[]) {
      if (!validateField(key)) valid = false;
    }
    return valid;
  }

  /** Puts API validation messages on their inputs; `false` if none matched. */
  function setApiErrors(error: unknown): boolean {
    if (!(error instanceof ApiError)) return false;
    let matched = false;
    for (const [field, messages] of Object.entries(error.fieldErrors)) {
      if (field in values && messages[0]) {
        errors[field as keyof T] = messages[0];
        matched = true;
      }
    }
    return matched;
  }

  function reset(next: Partial<T> = {}): void {
    Object.assign(values, initial(), next);
    for (const key of Object.keys(errors)) delete errors[key as keyof T];
    formError.value = null;
  }

  function focusFirstError(): void {
    if (!import.meta.client) return;
    nextTick(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  /** Wraps a submit handler with validation, loading state and error mapping. */
  function handleSubmit(handler: (values: T) => Promise<unknown> | unknown) {
    return async (event?: Event): Promise<void> => {
      event?.preventDefault();
      if (submitting.value) return;
      formError.value = null;
      if (!validate()) return focusFirstError();

      submitting.value = true;
      try {
        await handler(values);
      } catch (error) {
        if (setApiErrors(error)) focusFirstError();
        else formError.value = toast.errorMessage(error);
      } finally {
        submitting.value = false;
      }
    };
  }

  return { values, errors, submitting, formError, validate, validateField, setApiErrors, reset, handleSubmit };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Same rule as the API (`validators.decorator.ts`). */
const PHONE_PATTERN = /^\+?\d{8,15}$/;
export const PASSWORD_MIN_LENGTH = 8;
export const OTP_LENGTH = 5;

const isEmpty = (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0);

/** Translated rule factories shared by all forms. */
export function useValidators() {
  const { t } = useI18n();

  return {
    required:
      (message?: string): Rule =>
      (value) =>
        !isEmpty(value) || (message ?? t('validation.required')),
    email: (): Rule => (value) => isEmpty(value) || EMAIL_PATTERN.test(String(value).trim()) || t('validation.email'),
    phone: (): Rule =>
      (value) => isEmpty(value) || PHONE_PATTERN.test(String(value).replace(/[\s-]/g, '')) || t('validation.phone'),
    minLength:
      (min: number): Rule =>
      (value) =>
        isEmpty(value) || String(value).trim().length >= min || t('validation.minLength', { min }),
    maxLength:
      (max: number): Rule =>
      (value) =>
        isEmpty(value) || String(value).length <= max || t('validation.maxLength', { max }),
    min:
      (min: number): Rule =>
      (value) =>
        isEmpty(value) || Number(value) >= min || t('validation.min', { min }),
    max:
      (max: number): Rule =>
      (value) =>
        isEmpty(value) || Number(value) <= max || t('validation.max', { max }),
    password: (): Rule => (value) =>
      isEmpty(value) || String(value).length >= PASSWORD_MIN_LENGTH || t('validation.passwordLength', { min: PASSWORD_MIN_LENGTH }),
    otp: (): Rule => (value) => new RegExp(`^\d{${OTP_LENGTH}}$`).test(String(value ?? '')) || t('validation.otp', { length: OTP_LENGTH }),
    sameAs:
      (field: string): Rule =>
      (value, values) =>
        value === (values as Record<string, unknown>)[field] || t('validation.passwordMismatch'),
  };
}
