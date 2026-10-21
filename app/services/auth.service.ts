/** Password recovery (sign-in, sign-up and refresh live in the auth store). */
export function useAuthService() {
  const api = useApi();

  return {
    forgotPassword: (email: string) =>
      api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email } }),
    verifyOtp: (email: string, otp: string) =>
      api<{ valid: true }>('/auth/verify-otp', { method: 'POST', body: { email, otp } }),
    resetPassword: (body: { email: string; otp: string; newPassword: string; confirmPassword: string }) =>
      api<{ message: string }>('/auth/reset-password', { method: 'POST', body }),
  };
}

/** Carries the e-mail and verified code between the three recovery pages (never in the URL). */
export const usePasswordReset = () => useState('password-reset', () => ({ email: '', otp: '' }));
