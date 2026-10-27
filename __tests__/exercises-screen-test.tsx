import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { SQLiteVariadicBindParams } from 'expo-sqlite';

import ExercisesRoute from '@/app/(tabs)/exercises';
import { AppThemeProvider } from '@/shared/design-system/theme-provider';
import {
  StorageProvider,
  initializeDatabase,
  type StorageDatabase,
} from '@/shared/storage';

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

describe('Exercises Screen & Module Suite', () => {
  let testDatabase: StorageDatabase;

  beforeEach(async () => {
    const { database } = createTestDatabase();
    await initializeDatabase(database);
    testDatabase = database;
  });

  async function renderExercisesScreen() {
    return await render(
      <AppThemeProvider>
        <StorageProvider database={testDatabase}>
          <ExercisesRoute />
        </StorageProvider>
      </AppThemeProvider>,
    );
  }

  it('renders screen header, search bar, muscle filter chips, and seeded exercises', async () => {
    const { getByText, getByTestId } = await renderExercisesScreen();

    expect(getByText('Thư viện bài tập')).toBeTruthy();
    expect(getByTestId('exercise-search-input')).toBeTruthy();
    expect(getByTestId('open-add-exercise-button')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('Barbell Bench Press')).toBeTruthy();
      expect(getByText('Barbell Back Squat')).toBeTruthy();
      expect(getByText('Pull-up')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('filters exercises by search keyword', async () => {
    const { getByTestId, queryByText, getByText } = await renderExercisesScreen();

    await waitFor(() => {
      expect(getByText('Barbell Bench Press')).toBeTruthy();
    }, { timeout: 3000 });

    const searchInput = getByTestId('exercise-search-input');
    fireEvent.changeText(searchInput, 'Squat');

    await waitFor(() => {
      expect(getByText('Barbell Back Squat')).toBeTruthy();
      expect(queryByText('Barbell Bench Press')).toBeNull();
      expect(queryByText('Pull-up')).toBeNull();
    }, { timeout: 3000 });
  });

  it('filters exercises by muscle group chip', async () => {
    const { getByTestId, queryByText, getByText } = await renderExercisesScreen();

    await waitFor(() => {
      expect(getByText('Barbell Bench Press')).toBeTruthy();
    }, { timeout: 3000 });

    const chestChip = getByTestId('filter-chip-Ngực');
    fireEvent.press(chestChip);

    await waitFor(() => {
      expect(getByText('Barbell Bench Press')).toBeTruthy();
      expect(getByText('Incline Dumbbell Press')).toBeTruthy();
      expect(queryByText('Barbell Back Squat')).toBeNull();
      expect(queryByText('Pull-up')).toBeNull();
    }, { timeout: 3000 });
  });

  it('shows empty feedback state when search yields no match and resets filters', async () => {
    const { getByTestId, getByText } = await renderExercisesScreen();

    await waitFor(() => {
      expect(getByText('Barbell Bench Press')).toBeTruthy();
    }, { timeout: 3000 });

    const searchInput = getByTestId('exercise-search-input');
    fireEvent.changeText(searchInput, 'non_existent_exercise_123');

    await waitFor(() => {
      expect(getByText('Không tìm thấy bài tập nào')).toBeTruthy();
      expect(getByText('Xóa bộ lọc')).toBeTruthy();
    }, { timeout: 3000 });

    fireEvent.press(getByText('Xóa bộ lọc'));

    await waitFor(() => {
      expect(getByText('Barbell Bench Press')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('opens add exercise modal, validates required fields, and creates a new custom exercise', async () => {
    const { getByTestId, getByText, queryByText } = await renderExercisesScreen();

    await waitFor(() => {
      expect(getByText('Barbell Bench Press')).toBeTruthy();
    }, { timeout: 3000 });

    // Mở modal thêm bài tập
    fireEvent.press(getByTestId('open-add-exercise-button'));

    await waitFor(() => {
      expect(getByTestId('exercise-form-modal')).toBeTruthy();
      expect(getByText('Thêm bài tập mới')).toBeTruthy();
    }, { timeout: 3000 });

    // Thử submit khi tên rỗng -> validation error
    fireEvent.press(getByTestId('submit-exercise-button'));

    await waitFor(() => {
      expect(getByText('Tên bài tập không được để trống.')).toBeTruthy();
    }, { timeout: 3000 });

    // Điền thông tin bài tập tùy chỉnh
    fireEvent.changeText(getByTestId('exercise-name-input'), 'Bulgarian Split Squat');

    await waitFor(() => {
      expect(queryByText('Tên bài tập không được để trống.')).toBeNull();
    }, { timeout: 3000 });

    fireEvent.press(getByTestId('muscle-chip-Chân'));
    fireEvent.press(getByTestId('equipment-chip-Dumbbell'));
    fireEvent.changeText(
      getByTestId('exercise-instructions-input'),
      'Một chân đặt lên ghế sau, hạ gối trước vuông góc 90 độ.',
    );

    // Submit lưu bài tập
    fireEvent.press(getByTestId('submit-exercise-button'));

    // Modal đóng lại và bài tập mới xuất hiện
    await waitFor(() => {
      expect(getByText('Bulgarian Split Squat')).toBeTruthy();
    }, { timeout: 3000 });
  });
});
