import type { SQLiteRunResult, SQLiteVariadicBindParams } from 'expo-sqlite';

import { DATABASE_NAME, LATEST_SCHEMA_VERSION, MIGRATIONS } from '@/shared/storage/schema';

export interface StorageDatabase {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, ...params: SQLiteVariadicBindParams): Promise<SQLiteRunResult>;
  getFirstAsync<T>(
    source: string,
    ...params: SQLiteVariadicBindParams
  ): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: SQLiteVariadicBindParams): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export class UnsupportedSchemaVersionError extends Error {
  constructor(databaseVersion: number, supportedVersion: number) {
    super(
      `Database schema version ${databaseVersion} is newer than supported version ${supportedVersion}.`,
    );
    this.name = 'UnsupportedSchemaVersionError';
  }
}

export class WebPlatformStorageError extends Error {
  constructor(
    message = 'Cơ sở dữ liệu SQLite ngoại tuyến không hỗ trợ trên nền tảng web. Vui lòng chạy ứng dụng trên thiết bị di động (Android / iOS).',
  ) {
    super(message);
    this.name = 'WebPlatformStorageError';
  }
}

export async function openAppDatabase(): Promise<StorageDatabase> {
  const { openDatabaseAsync } = await import('expo-sqlite');
  return openDatabaseAsync(DATABASE_NAME);
}

type UserVersionRow = {
  user_version: number;
};

export async function initializeDatabase(database: StorageDatabase) {
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const versionRow = await database.getFirstAsync<UserVersionRow>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion > LATEST_SCHEMA_VERSION) {
    throw new UnsupportedSchemaVersionError(currentVersion, LATEST_SCHEMA_VERSION);
  }

  if (currentVersion === LATEST_SCHEMA_VERSION) {
    return;
  }

  await database.withTransactionAsync(async () => {
    const latestVersionRow = await database.getFirstAsync<UserVersionRow>('PRAGMA user_version');
    let version = latestVersionRow?.user_version ?? 0;

    if (version > LATEST_SCHEMA_VERSION) {
      throw new UnsupportedSchemaVersionError(version, LATEST_SCHEMA_VERSION);
    }

    for (const migration of MIGRATIONS) {
      if (migration.version <= version) {
        continue;
      }

      if (migration.version !== version + 1) {
        throw new Error(`Missing database migration for version ${version + 1}.`);
      }

      await database.execAsync(migration.sql);
      await database.execAsync(`PRAGMA user_version = ${migration.version};`);
      version = migration.version;
    }

    if (version !== LATEST_SCHEMA_VERSION) {
      throw new Error(
        `Database migration stopped at version ${version}; expected ${LATEST_SCHEMA_VERSION}.`,
      );
    }
  });
}
