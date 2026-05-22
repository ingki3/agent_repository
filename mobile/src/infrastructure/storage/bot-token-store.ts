/**
 * BotTokenStore — per-buddy Telegram Bot API token persistence (TECH §5.2, §12.9).
 *
 * Tokens are stored in expo-secure-store under keys `bot_token__<buddyId>`. Because
 * SecureStore has no native getAllKeys() on iOS/Android, an index of known buddyIds is
 * persisted under `bot_token_index_v1` so that sign-out can enumerate and wipe every
 * token without depending on the SQLite buddies table (which is also being dropped).
 *
 * The index is itself stored inside SecureStore — keeping all auth-adjacent secrets
 * inside the same vault. Bot token values never appear in plaintext logs.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY_PREFIX = 'bot_token__';
const INDEX_KEY = 'bot_token_index_v1';

const IOS_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

function options(): SecureStore.SecureStoreOptions | undefined {
  return Platform.OS === 'ios' ? IOS_OPTIONS : undefined;
}

function tokenKey(buddyId: string): string {
  return `${KEY_PREFIX}${buddyId}`;
}

async function readIndex(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(INDEX_KEY, options());
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

async function writeIndex(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    await SecureStore.deleteItemAsync(INDEX_KEY, options());
    return;
  }
  await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids), options());
}

export const botTokenStore = {
  /** Persist a bot token for a buddy and add the buddyId to the index. */
  async set(buddyId: string, token: string): Promise<void> {
    await SecureStore.setItemAsync(tokenKey(buddyId), token, options());
    const index = await readIndex();
    if (!index.includes(buddyId)) {
      index.push(buddyId);
      await writeIndex(index);
    }
  },

  async get(buddyId: string): Promise<string | null> {
    return SecureStore.getItemAsync(tokenKey(buddyId), options());
  },

  async remove(buddyId: string): Promise<void> {
    await SecureStore.deleteItemAsync(tokenKey(buddyId), options());
    const index = await readIndex();
    const next = index.filter((id) => id !== buddyId);
    if (next.length !== index.length) await writeIndex(next);
  },

  /** Buddy IDs that currently have a bot token persisted (read from the index). */
  async listBuddyIds(): Promise<string[]> {
    return readIndex();
  },

  /**
   * Wipe every persisted bot token plus the index. Returns the count of token entries
   * deleted (excluding the index key itself) so logout flows can report the result.
   */
  async clearAll(): Promise<number> {
    const ids = await readIndex();
    await Promise.all(
      ids.map((id) => SecureStore.deleteItemAsync(tokenKey(id), options())),
    );
    await SecureStore.deleteItemAsync(INDEX_KEY, options());
    return ids.length;
  },
};

export type BotTokenStore = typeof botTokenStore;
