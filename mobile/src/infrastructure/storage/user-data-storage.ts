/**
 * UserDataStorage — sign-out helper to wipe locally persisted user data (TECH §12.9).
 *
 * On logout the app must drop every SQLite table that holds user-scoped content
 * (buddies, messages, traces, outbox) and the schema_version bookkeeping row, so that
 * the next app boot triggers a fresh migration run (v0 → v1).
 *
 * This module intentionally opens its own expo-sqlite handle rather than reusing a
 * shared singleton from `database.ts`. The buddy/chat SQLite module (BIZ-264) owns
 * connection lifecycle; logout must work even after the app code has closed its
 * connection, so we open, drop, close.
 */
import { openDatabaseSync } from 'expo-sqlite';

const DATABASE_NAME = 'agentclient.db';

const USER_TABLES = ['outbox', 'traces', 'messages', 'buddies'] as const;

export interface PurgeReport {
  droppedTables: string[];
  /** True if `schema_version` table existed and was reset. Forces re-migration on next boot. */
  schemaVersionReset: boolean;
}

export async function purgeUserSqlite(
  databaseName: string = DATABASE_NAME,
): Promise<PurgeReport> {
  const db = openDatabaseSync(databaseName);
  const dropped: string[] = [];
  let schemaVersionReset = false;
  try {
    for (const table of USER_TABLES) {
      db.execSync(`DROP TABLE IF EXISTS ${table};`);
      dropped.push(table);
    }
    const versionRow = db.getFirstSync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'",
    );
    if (versionRow) {
      db.execSync('DROP TABLE IF EXISTS schema_version;');
      schemaVersionReset = true;
    }
  } finally {
    db.closeSync();
  }
  return { droppedTables: dropped, schemaVersionReset };
}

export const userDataStorage = {
  purgeUserSqlite,
  databaseName: DATABASE_NAME,
};
