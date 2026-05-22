/**
 * signOut usecase — UC-01 / FR-04 (PRD §3 UC-01, TECH §5, §12.9).
 *
 * Wipes every locally persisted artifact tied to the signed-in user and returns the
 * auth state machine to GUEST. Steps run in a fixed order so that even if a later
 * step throws, the auth state is already cleared and a re-login is forced on next
 * boot (no "half-logged-in" recovery path).
 *
 *   1. POST /v1/auth/logout best-effort (server-side session revoke; network
 *      failures are swallowed because the user already pressed "로그아웃").
 *   2. Clear auth tokens from SecureStore (access, refresh, expiresAt, phone).
 *   3. Clear every per-buddy bot_token__<buddyId> SecureStore entry + its index.
 *   4. Drop user SQLite tables (buddies/messages/traces/outbox) + schema_version
 *      so the next launch re-runs the v0→v1 migration on a fresh schema.
 *   5. AsyncStorage.clear() — wipes theme/locale/feature flags.
 *   6. Run every registered Zustand store resetter (auth always last so the UI
 *      observes the guest transition only after data is gone).
 *
 * Failures in steps 3–6 are collected and returned so the UI can surface a toast
 * but never block the GUEST transition itself.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authClient as defaultAuthClient } from '@/infrastructure/api/auth-client';
import { secureTokenStore as defaultSecureTokenStore } from '@/infrastructure/storage/secure-token-store';
import { botTokenStore as defaultBotTokenStore } from '@/infrastructure/storage/bot-token-store';
import { purgeUserSqlite as defaultPurgeUserSqlite } from '@/infrastructure/storage/user-data-storage';
import { useAuthStore } from '@/application/stores/auth';

export interface SignOutDeps {
  authClient: {
    logout: (req: { accessToken: string; refreshToken?: string }) => Promise<void>;
  };
  secureTokenStore: {
    load: () => Promise<{ accessToken: string; refreshToken: string | null } | null>;
    clear: () => Promise<void>;
  };
  botTokenStore: {
    clearAll: () => Promise<number>;
  };
  /** Drops user SQLite tables + schema_version so next launch re-migrates. */
  purgeUserSqlite: () => Promise<unknown>;
  asyncStorage: {
    clear: () => Promise<void>;
  };
  /**
   * Zustand-store reset callbacks. Caller passes the resetters that exist in the
   * current build (e.g. buddies/chat/trace/ui/network — see BIZ-264). Auth is reset
   * by the usecase itself, after every other store, so callers must NOT include it.
   */
  storeResetters: Array<() => void>;
}

export interface SignOutResult {
  serverLogoutOk: boolean;
  botTokensCleared: number;
  errors: Array<{ step: string; message: string }>;
}

export function defaultSignOutDeps(
  storeResetters: Array<() => void> = [],
): SignOutDeps {
  return {
    authClient: defaultAuthClient,
    secureTokenStore: defaultSecureTokenStore,
    botTokenStore: defaultBotTokenStore,
    purgeUserSqlite: defaultPurgeUserSqlite,
    asyncStorage: AsyncStorage,
    storeResetters,
  };
}

function record(
  errors: SignOutResult['errors'],
  step: string,
  err: unknown,
): void {
  errors.push({
    step,
    message: err instanceof Error ? err.message : String(err),
  });
}

export async function signOut(deps: SignOutDeps): Promise<SignOutResult> {
  const errors: SignOutResult['errors'] = [];
  let serverLogoutOk = false;
  let botTokensCleared = 0;

  // 1. Best-effort server revoke.
  try {
    const snap = await deps.secureTokenStore.load();
    if (snap?.accessToken) {
      await deps.authClient.logout({
        accessToken: snap.accessToken,
        refreshToken: snap.refreshToken ?? undefined,
      });
      serverLogoutOk = true;
    } else {
      serverLogoutOk = true; // nothing to revoke
    }
  } catch (err) {
    // Network/server errors swallowed — local cleanup still runs.
    record(errors, 'authClient.logout', err);
  }

  // 2. Auth tokens.
  try {
    await deps.secureTokenStore.clear();
  } catch (err) {
    record(errors, 'secureTokenStore.clear', err);
  }

  // 3. Bot tokens (per-buddy SecureStore entries).
  try {
    botTokensCleared = await deps.botTokenStore.clearAll();
  } catch (err) {
    record(errors, 'botTokenStore.clearAll', err);
  }

  // 4. SQLite user tables (forces re-migration on next boot).
  try {
    await deps.purgeUserSqlite();
  } catch (err) {
    record(errors, 'purgeUserSqlite', err);
  }

  // 5. AsyncStorage (theme/locale/flags).
  try {
    await deps.asyncStorage.clear();
  } catch (err) {
    record(errors, 'asyncStorage.clear', err);
  }

  // 6. Reset Zustand stores. Auth last so the UI re-renders into GUEST only after
  // all user data is gone — avoids a flicker where (auth) screens query empty
  // SQLite mid-purge.
  for (const reset of deps.storeResetters) {
    try {
      reset();
    } catch (err) {
      record(errors, 'storeResetter', err);
    }
  }
  try {
    useAuthStore.getState().resetToGuest();
  } catch (err) {
    record(errors, 'useAuthStore.resetToGuest', err);
  }

  return { serverLogoutOk, botTokensCleared, errors };
}
