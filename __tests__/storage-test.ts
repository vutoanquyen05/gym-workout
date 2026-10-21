import type { SQLiteVariadicBindParams } from 'expo-sqlite';
import {
  ExerciseRepository,
  initializeDatabase,
  UnsupportedSchemaVersionError,
  WorkoutPlanRepository,
  WorkoutSessionRepository,
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

  return { database, close: () => nativeDatabase.close() };
}

describe('SQLite storage', () => {
  let database: StorageDatabase;
  let closeDatabase: () => void;

  beforeEach(async () => {
    const testDatabase = createTestDatabase();
    database = testDatabase.database;
    closeDatabase = testDatabase.close;
    await initializeDatabase(database);
  });

  afterEach(() => {
    closeDatabase();
  });

  it('applies the versioned schema once and rejects a newer schema', async () => {
    await initializeDatabase(database);
    const tables = await database.getAllAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
    );
    const version = await database.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    );

    expect(tables.map(({ name }) => name)).toEqual([
      'exercises',
      'plan_exercises',
      'session_exercises',
      'workout_plans',
      'workout_sessions',
      'workout_sets',
    ]);
    expect(version?.user_version).toBe(1);

    await database.execAsync('PRAGMA user_version = 999');
    await expect(initializeDatabase(database)).rejects.toBeInstanceOf(
      UnsupportedSchemaVersionError,
    );
  });

  it('rolls back a failed migration without advancing the schema version', async () => {
    const testDatabase = createTestDatabase();
    await testDatabase.database.execAsync(
      'CREATE TABLE workout_plans (id TEXT PRIMARY KEY)',
    );

    try {
      await expect(initializeDatabase(testDatabase.database)).rejects.toThrow();

      const tables = await testDatabase.database.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
      );
      const version = await testDatabase.database.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version',
      );

      expect(tables.map(({ name }) => name)).toEqual(['workout_plans']);
      expect(version?.user_version).toBe(0);
    } finally {
      testDatabase.close();
    }
  });

  it('binds exercise search text and persists archived state', async () => {
    const repository = new ExerciseRepository(database);
    const injectionText = `'; DROP TABLE exercises; --`;
    const created = await repository.create({
      name: injectionText,
      primaryMuscleGroup: 'Back',
    });

    expect(await repository.list({ search: injectionText })).toEqual([created]);
    expect(await repository.archive(created.id)).toBe(true);
    expect(await repository.list()).toEqual([]);
    expect((await repository.getById(created.id))?.isArchived).toBe(true);
    expect((await repository.list({ includeArchived: true })).map(({ id }) => id)).toEqual([
      created.id,
    ]);
  });

  it('preserves session snapshots and sets when source plan and exercise are deleted', async () => {
    const exerciseRepository = new ExerciseRepository(database);
    const planRepository = new WorkoutPlanRepository(database);
    const sessionRepository = new WorkoutSessionRepository(database);
    const exercise = await exerciseRepository.create({
      name: 'Goblet squat',
      primaryMuscleGroup: 'Legs',
    });
    const plan = await planRepository.create({ name: 'Leg day' });

    await planRepository.addExercise(plan.id, {
      exerciseId: exercise.id,
      position: 0,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      restSeconds: 90,
    });

    const session = await sessionRepository.create({
      title: plan.name,
      planId: plan.id,
      startedAt: '2026-10-19T10:00:00+02:00',
      exercises: [
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          position: 0,
          targetSets: 3,
        },
      ],
    });
    const sessionExercise = session.exercises[0];
    const set = await sessionRepository.addSet(sessionExercise.id, {
      setNumber: 1,
      weightValue: 12.5,
      weightUnit: 'kg',
      reps: 10,
      isCompleted: true,
    });

    expect(session.startedAt).toBe('2026-10-19T08:00:00.000Z');
    expect(set.isCompleted).toBe(true);
    expect(await sessionRepository.complete(session.id)).toBe(true);
    await expect(
      sessionRepository.addSet(sessionExercise.id, {
        setNumber: 2,
        reps: 10,
      }),
    ).rejects.toThrow('Cannot add a set to a completed workout session.');

    await database.runAsync('DELETE FROM workout_plans WHERE id = ?', plan.id);
    await database.runAsync('DELETE FROM exercises WHERE id = ?', exercise.id);

    const savedSession = await sessionRepository.getById(session.id);
    expect(savedSession).toMatchObject({
      planId: null,
      status: 'completed',
      exercises: [
        {
          exerciseId: null,
          exerciseName: 'Goblet squat',
          sets: [
            {
              id: set.id,
              weightValue: 12.5,
              weightUnit: 'kg',
              reps: 10,
            },
          ],
        },
      ],
    });
    expect(await planRepository.getById(plan.id)).toBeNull();
  });

  it('rolls back a session if a session exercise violates a foreign key', async () => {
    const repository = new WorkoutSessionRepository(database);

    await expect(
      repository.create({
        title: 'Should roll back',
        exercises: [
          { exerciseName: 'Valid snapshot', position: 0 },
          {
            exerciseId: 'missing-exercise',
            exerciseName: 'Invalid relation',
            position: 1,
          },
        ],
      }),
    ).rejects.toThrow();

    const sessions = await database.getAllAsync<{ id: string }>(
      'SELECT id FROM workout_sessions',
    );
    expect(sessions).toEqual([]);
  });
});
