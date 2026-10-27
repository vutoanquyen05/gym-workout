import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Platform, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import type { SQLiteVariadicBindParams } from 'expo-sqlite';

import RootLayout from '@/app/_layout';
import {
  StorageProvider,
  useDatabase,
  useStorage,
  type StorageDatabase,
} from '@/shared/storage';

jest.mock('@/modules/auth/services/supabase-client', () => ({
  getSupabaseClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signOut: jest.fn(async () => ({ error: null })),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
  })),
}));

jest.mock('expo-router', () => {
  const ReactRouter = require('react');
  const { View: MockView } = require('react-native');
  return {
    Stack: Object.assign(
      ({ children }: { children: React.ReactNode }) => (
        <MockView testID="mock-stack">{children}</MockView>
      ),
      {
        Screen: ({ name }: { name: string }) => (
          <MockView testID={`mock-screen-${name}`} />
        ),
      },
    ),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    DarkTheme: { dark: true, colors: {} },
    DefaultTheme: { dark: false, colors: {} },
  };
});

jest.mock('@/components/animated-icon', () => {
  const ReactIcon = require('react');
  const { View: MockView } = require('react-native');
  return {
    AnimatedSplashOverlay: () => <MockView testID="mock-animated-splash" />,
  };
});

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => true),
}));

type NativeStatement = {
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
};

type NativeDatabase = {
  exec(source: string): void;
  prepare(source: string): NativeStatement;
  close(): void;
};

const { DatabaseSync } = jest.requireActual<{
  DatabaseSync: new (path: string) => NativeDatabase;
}>('node:sqlite');

function createTestDatabase() {
  const nativeDatabase = new DatabaseSync(':memory:');
  const database: StorageDatabase = {
    async execAsync(source) {
      nativeDatabase.exec(source);
    },
    async runAsync(source, ...params: SQLiteVariadicBindParams) {
      const result = nativeDatabase.prepare(source).run(...params);

      return {
        changes: Number(result.changes),
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },
    async getFirstAsync<T>(source: string, ...params: SQLiteVariadicBindParams) {
      const row = nativeDatabase.prepare(source).get(...params);

      return (row as T | undefined) ?? null;
    },
    async getAllAsync<T>(source: string, ...params: SQLiteVariadicBindParams) {
      return nativeDatabase.prepare(source).all(...params) as T[];
    },
    async withTransactionAsync(task) {
      nativeDatabase.exec('BEGIN');
      try {
        await task();
        nativeDatabase.exec('COMMIT');
      } catch (error) {
        nativeDatabase.exec('ROLLBACK');
        throw error;
      }
    },
  };

  return { database, nativeDatabase };
}

function StorageConsumerProbe() {
  const { isReady, database, exerciseRepository, error } = useStorage();

  return (
    <View>
      <Text testID="probe-is-ready">{String(isReady)}</Text>
      <Text testID="probe-has-db">{String(database !== null)}</Text>
      <Text testID="probe-has-repo">{String(exerciseRepository !== null)}</Text>
      <Text testID="probe-error">{error ? error.message : 'none'}</Text>
    </View>
  );
}

function DatabaseConsumerProbe() {
  const db = useDatabase();
  return <Text testID="probe-db-ready">{String(db !== null)}</Text>;
}

function ConditionalDatabaseProbe() {
  const { isReady } = useStorage();
  if (!isReady) return null;
  return <DatabaseConsumerProbe />;
}

describe('Storage Runtime & RootLayout Integration Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('StorageProvider Lifecycle', () => {
    it('initializes database and creates repositories upon mount', async () => {
      const { database } = createTestDatabase();
      const onInitialized = jest.fn();

      const { getByTestId } = await render(
        <StorageProvider database={database} onInitialized={onInitialized}>
          <StorageConsumerProbe />
          <ConditionalDatabaseProbe />
        </StorageProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('probe-is-ready').props.children).toBe('true');
      });

      expect(getByTestId('probe-has-db').props.children).toBe('true');
      expect(getByTestId('probe-has-repo').props.children).toBe('true');
      expect(getByTestId('probe-error').props.children).toBe('none');
      expect(getByTestId('probe-db-ready').props.children).toBe('true');
      expect(onInitialized).toHaveBeenCalledWith(database);
    });

    it('captures initialization errors and provides retry capability', async () => {
      let fail = true;
      const { database } = createTestDatabase();
      const failingDatabase: StorageDatabase = {
        ...database,
        async execAsync(source) {
          if (fail) {
            throw new Error('Simulated SQLite disk I/O error');
          }
          return database.execAsync(source);
        },
      };

      let retryFn: () => Promise<void> = async () => undefined;
      function RetryProbe() {
        const { error, retry } = useStorage();
        retryFn = retry;
        return <Text testID="retry-error">{error?.message ?? 'none'}</Text>;
      }

      const { getByTestId } = await render(
        <StorageProvider database={failingDatabase}>
          <RetryProbe />
        </StorageProvider>,
      );

      await waitFor(() => {
        expect(getByTestId('retry-error').props.children).toBe(
          'Simulated SQLite disk I/O error',
        );
      });

      fail = false;
      await act(async () => {
        await retryFn();
      });

      await waitFor(() => {
        expect(getByTestId('retry-error').props.children).toBe('none');
      });
    });

    it('handles web platform and initializes sqlite storage successfully', async () => {
      const originalOS = Platform.OS;
      try {
        Platform.OS = 'web';
        const { database } = createTestDatabase();

        const { getByTestId } = await render(
          <StorageProvider database={database}>
            <StorageConsumerProbe />
          </StorageProvider>,
        );

        await waitFor(() => {
          expect(getByTestId('probe-is-ready').props.children).toBe('true');
        });
        expect(getByTestId('probe-error').props.children).toBe('none');
      } finally {
        Platform.OS = originalOS;
      }
    });

    it('throws error when useStorage or useDatabase is used outside StorageProvider', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(render(<StorageConsumerProbe />)).rejects.toThrow(
        'useStorage must be used within a StorageProvider',
      );

      await expect(render(<DatabaseConsumerProbe />)).rejects.toThrow(
        'useStorage must be used within a StorageProvider',
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('RootLayout Integration', () => {
    it('defers rendering Stack until SQLite database is initialized, then renders AppNavigator', async () => {
      const { database } = createTestDatabase();

      const { getByTestId } = await render(<RootLayout database={database} />);

      await waitFor(() => {
        expect(getByTestId('mock-stack')).toBeTruthy();
      });

      expect(getByTestId('mock-animated-splash')).toBeTruthy();
    });

    it('renders error fallback screen and calls SplashScreen.hideAsync when database fails', async () => {
      const failingOpenDatabase = jest.fn(async () => {
        throw new Error('Corrupt SQLite database file');
      });

      const { getByTestId, getByText, queryByTestId } = await render(
        <RootLayout openDatabase={failingOpenDatabase} />,
      );

      await waitFor(() => {
        expect(getByTestId('storage-error-fallback')).toBeTruthy();
      });

      expect(getByText('Corrupt SQLite database file')).toBeTruthy();
      expect(getByText('Không thể khởi động lưu trữ cục bộ')).toBeTruthy();
      expect(getByText('Thử lại')).toBeTruthy();
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
      expect(queryByTestId('mock-stack')).toBeNull();
    });

    it('allows retry on error fallback screen', async () => {
      let succeed = false;
      const { database } = createTestDatabase();
      const flakyOpenDatabase = jest.fn(async () => {
        if (!succeed) {
          throw new Error('Database locked');
        }
        return database;
      });

      const { getByTestId, getByText, queryByTestId } = await render(
        <RootLayout openDatabase={flakyOpenDatabase} />,
      );

      await waitFor(() => {
        expect(getByTestId('storage-error-fallback')).toBeTruthy();
      });

      succeed = true;
      const retryButton = getByText('Thử lại');
      await act(async () => {
        fireEvent.press(retryButton);
      });

      await waitFor(() => {
        expect(getByTestId('mock-stack')).toBeTruthy();
      });
      expect(queryByTestId('storage-error-fallback')).toBeNull();
    });
  });
});
