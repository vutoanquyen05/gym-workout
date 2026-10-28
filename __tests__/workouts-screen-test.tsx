import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { SQLiteVariadicBindParams } from 'expo-sqlite';

import WorkoutsRoute from '@/app/(tabs)/workouts';
import { WorkoutPlanForm } from '@/modules/workouts';
import { AppThemeProvider } from '@/shared/design-system/theme-provider';
import {
  StorageProvider,
  initializeDatabase,
  type StorageDatabase,
} from '@/shared/storage';
import { WorkoutPlanRepository } from '@/shared/storage/repositories/workout-plans';
import { WorkoutSessionRepository } from '@/shared/storage/repositories/workout-sessions';

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

describe('Workouts Screen & Module Suite', () => {
  let testDatabase: StorageDatabase;

  beforeEach(async () => {
    const { database } = createTestDatabase();
    await initializeDatabase(database);
    testDatabase = database;
  });

  async function renderWorkoutsScreen() {
    return await render(
      <AppThemeProvider>
        <StorageProvider database={testDatabase}>
          <WorkoutsRoute />
        </StorageProvider>
      </AppThemeProvider>,
    );
  }

  it('renders workouts screen header and auto-seeds 2 sample workout plans', async () => {
    const { getByText, getByTestId, getAllByText } = await renderWorkoutsScreen();

    // Verify Screen Header
    expect(getByText('Giáo án của tôi')).toBeTruthy();
    expect(getByTestId('open-add-plan-button')).toBeTruthy();

    // Verify Auto-seeded Plans appear
    await waitFor(
      () => {
        expect(getByText('Full Body Cơ Bản')).toBeTruthy();
        expect(getByText('Upper Body Sức Mạnh')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    // Verify Start Workout buttons are rendered
    const startButtons = getAllByText('Bắt đầu tập');
    expect(startButtons.length).toBeGreaterThanOrEqual(2);

    // Verify exercise count metadata
    expect(getByText('2 kế hoạch')).toBeTruthy();
  });

  it('handles starting a workout by selecting a plan and displaying the active plan banner', async () => {
    const { getByText, getAllByText, getByTestId } = await renderWorkoutsScreen();

    await waitFor(
      () => {
        expect(getByText('Full Body Cơ Bản')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    const startButtons = getAllByText('Bắt đầu tập');
    fireEvent.press(startButtons[0]);

    await waitFor(() => {
      expect(getByTestId('active-plan-banner')).toBeTruthy();
      expect(getByText(/ĐANG CHUẨN BỊ TẬP:/)).toBeTruthy();
    });
  });

  it('renders recent completed workout sessions or empty state', async () => {
    // 1. Initial render with no completed sessions
    const { getByText, queryByText, unmount } = await renderWorkoutsScreen();

    await waitFor(
      () => {
        expect(getByText('Chưa có buổi tập nào hoàn thành')).toBeTruthy();
      },
      { timeout: 3000 },
    );
    unmount();

    // 2. Insert a completed session into database
    const sessionRepo = new WorkoutSessionRepository(testDatabase);
    const createdSession = await sessionRepo.create({
      title: 'Buổi Tập Ngực Sáng Thứ 2',
      startedAt: '2026-10-28T08:00:00.000Z',
      exercises: [
        {
          exerciseName: 'Barbell Bench Press',
          position: 0,
          targetSets: 4,
          targetRepsMin: 8,
          targetRepsMax: 10,
        },
      ],
    });
    await sessionRepo.complete(createdSession.id, '2026-10-28T09:15:00.000Z');

    // 3. Re-render screen to check recent sessions section
    const renderedAfter = await renderWorkoutsScreen();
    await waitFor(
      () => {
        expect(renderedAfter.getByText('Buổi Tập Ngực Sáng Thứ 2')).toBeTruthy();
        expect(renderedAfter.getByText('Hoàn thành')).toBeTruthy();
        expect(renderedAfter.getByText('1 buổi gần nhất')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    expect(renderedAfter.queryByText('Chưa có buổi tập nào hoàn thành')).toBeNull();
  });
  it('opens add plan modal, validates required plan name, and creates a new custom plan', async () => {
    const { getByTestId, getByText, queryByText } = await renderWorkoutsScreen();

    // Wait for auto-seed
    await waitFor(
      () => {
        expect(getByText('Full Body Cơ Bản')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    // Mở modal thêm giáo án
    fireEvent.press(getByTestId('open-add-plan-button'));

    await waitFor(
      () => {
        expect(getByTestId('workout-plan-form-modal')).toBeTruthy();
        expect(getByText('Tạo giáo án mới')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    // Thử submit khi tên rỗng -> validation error
    fireEvent.press(getByTestId('submit-plan-button'));

    await waitFor(
      () => {
        expect(getByText('Tên giáo án không được để trống.')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    // Điền thông tin giáo án
    fireEvent.changeText(getByTestId('plan-name-input'), 'Leg Day Tăng Cơ');

    await waitFor(
      () => {
        expect(queryByText('Tên giáo án không được để trống.')).toBeNull();
      },
      { timeout: 3000 },
    );

    fireEvent.changeText(
      getByTestId('plan-description-input'),
      'Tập trung cơ đùi trước và bắp chuối',
    );

    // Submit lưu giáo án
    fireEvent.press(getByTestId('submit-plan-button'));

    // Modal đóng lại và giáo án mới xuất hiện trong danh sách
    await waitFor(
      () => {
        expect(getByText('Leg Day Tăng Cơ')).toBeTruthy();
      },
      { timeout: 3000 },
    );
  });
});
