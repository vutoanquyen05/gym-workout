import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import type { SQLiteVariadicBindParams } from 'expo-sqlite';

import ProgressRoute from '@/app/(tabs)/progress';
import { StatCard } from '@/modules/progress';
import { AppThemeProvider } from '@/shared/design-system/theme-provider';
import {
  StorageProvider,
  initializeDatabase,
  type StorageDatabase,
} from '@/shared/storage';
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

describe('Progress Screen & Module Suite', () => {
  let testDatabase: StorageDatabase;

  beforeEach(async () => {
    const { database } = createTestDatabase();
    await initializeDatabase(database);
    testDatabase = database;
  });

  async function renderProgressScreen() {
    return await render(
      <AppThemeProvider>
        <StorageProvider database={testDatabase}>
          <ProgressRoute />
        </StorageProvider>
      </AppThemeProvider>,
    );
  }

  it('renders empty feedback state when there are no completed sessions', async () => {
    const { getByText } = await renderProgressScreen();

    // Verify Screen Header
    expect(getByText('Tiến trình')).toBeTruthy();

    // Verify Empty FeedbackState
    await waitFor(() => {
      expect(getByText('Chưa có dữ liệu tiến trình')).toBeTruthy();
      expect(
        getByText(
          'Hoàn thành các buổi tập đầu tiên để theo dõi số buổi tập, thời gian và tổng khối lượng nâng.',
        ),
      ).toBeTruthy();
    });
  });

  it('calculates the 3 summary statistics and displays recent activities when completed sessions exist', async () => {
    const repo = new WorkoutSessionRepository(testDatabase);

    // Session 1: 45 phút, 2 hiệp hoàn thành (50kg x 10, 60kg x 8) => Volume = 500 + 480 = 980 kg
    const s1 = await repo.create({
      title: 'Buổi tập Ngực & Tay sau',
      startedAt: '2026-10-28T08:00:00.000Z',
      exercises: [
        {
          exerciseName: 'Đẩy ngực tạ đòn',
          position: 0,
          targetSets: 2,
        },
      ],
    });
    const s1ExId = s1.exercises[0].id;
    await repo.addSet(s1ExId, {
      setNumber: 1,
      weightValue: 50,
      weightUnit: 'kg',
      reps: 10,
      isCompleted: true,
    });
    await repo.addSet(s1ExId, {
      setNumber: 2,
      weightValue: 60,
      weightUnit: 'kg',
      reps: 8,
      isCompleted: true,
    });
    await repo.complete(s1.id, '2026-10-28T08:45:00.000Z');

    // Session 2: 30 phút, 1 hiệp hoàn thành (80kg x 10) => Volume = 800 kg
    const s2 = await repo.create({
      title: 'Buổi tập Chân & Vai',
      startedAt: '2026-10-28T14:00:00.000Z',
      exercises: [
        {
          exerciseName: 'Gánh tạ (Squat)',
          position: 0,
          targetSets: 1,
        },
      ],
    });
    const s2ExId = s2.exercises[0].id;
    await repo.addSet(s2ExId, {
      setNumber: 1,
      weightValue: 80,
      weightUnit: 'kg',
      reps: 10,
      isCompleted: true,
    });
    await repo.complete(s2.id, '2026-10-28T14:30:00.000Z');

    // Session 3: Buổi tập đang diễn ra (chưa hoàn thành) => không được tính vào thống kê
    await repo.create({
      title: 'Buổi tập đang diễn ra',
      startedAt: '2026-10-28T17:00:00.000Z',
      exercises: [
        {
          exerciseName: 'Kéo xà đơn',
          position: 0,
        },
      ],
    });

    const { getByText, getByTestId, queryByText } = await renderProgressScreen();

    // Verify Overview Header
    await waitFor(() => {
      expect(getByText('Tổng quan thống kê')).toBeTruthy();
      expect(getByText('Hoạt động gần đây')).toBeTruthy();
    });

    // 1. Thống kê 1: Tổng số buổi tập = 2
    expect(getByText('Tổng buổi tập')).toBeTruthy();
    const workoutsValue = getByTestId('stat-total-workouts-value');
    expect(workoutsValue.props.children).toBe('2');

    // 2. Thống kê 2: Tổng thời gian tập = 45 + 30 = 75 phút
    expect(getByText('Thời gian tập')).toBeTruthy();
    const durationValue = getByTestId('stat-total-duration-value');
    expect(durationValue.props.children).toBe('75');

    // 3. Thống kê 3: Tổng khối lượng nâng = 980 + 800 = 1780 kg
    expect(getByText('Tổng khối lượng đã nâng')).toBeTruthy();
    const volumeValue = getByTestId('stat-total-volume-value');
    expect(volumeValue.props.children).toBe((1780).toLocaleString('vi-VN'));

    // 4. Danh sách hoạt động gần đây
    expect(getByText('Buổi tập Chân & Vai')).toBeTruthy();
    expect(getByText('Buổi tập Ngực & Tay sau')).toBeTruthy();
    // Buổi tập chưa hoàn thành không xuất hiện trong lịch sử hoàn thành
    expect(queryByText('Buổi tập đang diễn ra')).toBeNull();
  });

  it('renders StatCard component with icon, title, value and unit correctly', async () => {
    const { getByText, getByTestId } = await render(
      <AppThemeProvider>
        <StatCard
          icon="🔥"
          title="Calo tiêu thụ"
          value={450}
          unit="kcal"
          testID="custom-stat"
        />
      </AppThemeProvider>,
    );

    expect(getByText('🔥')).toBeTruthy();
    expect(getByText('Calo tiêu thụ')).toBeTruthy();
    expect(getByTestId('custom-stat-value').props.children).toBe('450');
    expect(getByTestId('custom-stat-unit').props.children).toBe('kcal');
  });
});
