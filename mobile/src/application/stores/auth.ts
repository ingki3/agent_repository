/**
 * Auth store — TECH §2.4. Owns access/refresh tokens, sign-in step machine,
 * and the persisted-authenticated bit.
 *
 * Foundation (BIZ-268) only ships the empty slice; the token-bearing methods
 * (`hydrateFromSecureStore`, `setTokens`, `signOut`, `markPhoneVerified`) land
 * with M1 sub 2 (BIZ-270) once `SecureTokenStore` and `AuthClient` exist.
 */
import { create } from 'zustand';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
};

export const useAuthStore = create<AuthState>(() => ({
  status: 'unknown',
  accessToken: null,
  refreshToken: null,
}));
