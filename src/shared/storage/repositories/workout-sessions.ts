import type { StorageDatabase } from '@/shared/storage/database';
import type {
  CreateWorkoutSetInput,
  SessionExercise,
  SessionExerciseInput,
  WorkoutSession,
  WorkoutSessionDetail,
  WorkoutSessionStatus,
  WorkoutSet,
} from '@/shared/storage/types';

type WorkoutSessionRow = {
  id: string;
  plan_id: string | null;
  title: string;
  status: WorkoutSessionStatus;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type SessionExerciseRow = {
  id: string;
  session_id: string;
  exercise_id: string | null;
  exercise_name: string;
  position: number;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
  rest_seconds: number | null;
};

type WorkoutSetRow = {
  id: string;
  session_exercise_id: string;
  set_number: number;
  weight_value: number | null;
  weight_unit: 'kg' | 'lb' | null;
  reps: number | null;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapWorkoutSession(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    planId: row.plan_id,
    title: row.title,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSessionExercise(row: SessionExerciseRow): SessionExercise {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    position: row.position,
    targetSets: row.target_sets,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,
    restSeconds: row.rest_seconds,
  };
}

function mapWorkoutSet(row: WorkoutSetRow): WorkoutSet {
  return {
    id: row.id,
    sessionExerciseId: row.session_exercise_id,
    setNumber: row.set_number,
    weightValue: row.weight_value,
    weightUnit: row.weight_unit,
    reps: row.reps,
    isCompleted: row.is_completed === 1,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function requireText(value: string, field: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new RangeError(`${field} must not be empty.`);
  }

  return trimmed;
}

function normalizeTimestamp(value: string, field: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) {
    throw new RangeError(`${field} must be an ISO-8601 timestamp with a timezone.`);
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`${field} must be a valid ISO-8601 timestamp.`);
  }

  return new Date(timestamp).toISOString();
}

function validateSessionExercises(exercises: SessionExerciseInput[]) {
  const positions = new Set<number>();

  for (const exercise of exercises) {
    requireText(exercise.exerciseName, 'Session exercise name');
    if (!Number.isInteger(exercise.position) || exercise.position < 0) {
      throw new RangeError('Session exercise position must be a non-negative integer.');
    }
    if (positions.has(exercise.position)) {
      throw new RangeError(`Duplicate session exercise position ${exercise.position}.`);
    }
    positions.add(exercise.position);
    if (exercise.targetSets != null && (!Number.isInteger(exercise.targetSets) || exercise.targetSets < 1)) {
      throw new RangeError('Target sets must be a positive integer.');
    }
    if (
      exercise.targetRepsMin != null &&
      (!Number.isInteger(exercise.targetRepsMin) || exercise.targetRepsMin < 1)
    ) {
      throw new RangeError('Minimum target repetitions must be a positive integer.');
    }
    if (
      exercise.targetRepsMax != null &&
      (!Number.isInteger(exercise.targetRepsMax) || exercise.targetRepsMax < 1)
    ) {
      throw new RangeError('Maximum target repetitions must be a positive integer.');
    }
    if (
      exercise.targetRepsMin != null &&
      exercise.targetRepsMax != null &&
      exercise.targetRepsMax < exercise.targetRepsMin
    ) {
      throw new RangeError('Maximum target repetitions must be at least the minimum.');
    }
    if (exercise.restSeconds != null && (!Number.isInteger(exercise.restSeconds) || exercise.restSeconds < 0)) {
      throw new RangeError('Rest time must be a non-negative integer.');
    }
  }
}

function validateWorkoutSet(input: CreateWorkoutSetInput) {
  if (!Number.isInteger(input.setNumber) || input.setNumber < 1) {
    throw new RangeError('Set number must be a positive integer.');
  }
  if (input.weightValue != null && (!Number.isFinite(input.weightValue) || input.weightValue < 0)) {
    throw new RangeError('Weight must be a non-negative finite number.');
  }
  if ((input.weightValue == null) !== (input.weightUnit == null)) {
    throw new RangeError('Weight value and weight unit must be provided together.');
  }
  if (input.reps != null && (!Number.isInteger(input.reps) || input.reps < 0)) {
    throw new RangeError('Repetitions must be a non-negative integer.');
  }
  if (input.isCompleted && (!Number.isInteger(input.reps) || (input.reps ?? 0) < 1)) {
    throw new RangeError('A completed set must have at least one repetition.');
  }
}

export class WorkoutSessionRepository {
  constructor(private readonly database: StorageDatabase) {}

  async create({
    title,
    planId = null,
    startedAt = new Date().toISOString(),
    exercises,
  }: {
    title: string;
    planId?: string | null;
    startedAt?: string;
    exercises: SessionExerciseInput[];
  }): Promise<WorkoutSessionDetail> {
    const normalizedTitle = requireText(title, 'Workout session title');
    const normalizedStartedAt = normalizeTimestamp(startedAt, 'Workout session start time');
    validateSessionExercises(exercises);
    let sessionId = '';

    await this.database.withTransactionAsync(async () => {
      const result = await this.database.runAsync(
        `INSERT INTO workout_sessions (plan_id, title, started_at)
         VALUES (?, ?, ?)`,
        planId,
        normalizedTitle,
        normalizedStartedAt,
      );
      const sessionRow = await this.database.getFirstAsync<WorkoutSessionRow>(
        'SELECT * FROM workout_sessions WHERE rowid = ?',
        result.lastInsertRowId,
      );

      if (!sessionRow) {
        throw new Error('Workout session was inserted but could not be read back.');
      }

      sessionId = sessionRow.id;

      for (const exercise of exercises) {
        await this.database.runAsync(
          `INSERT INTO session_exercises (
            session_id, exercise_id, exercise_name, position,
            target_sets, target_reps_min, target_reps_max, rest_seconds
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          sessionId,
          exercise.exerciseId ?? null,
          requireText(exercise.exerciseName, 'Session exercise name'),
          exercise.position,
          exercise.targetSets ?? null,
          exercise.targetRepsMin ?? null,
          exercise.targetRepsMax ?? null,
          exercise.restSeconds ?? null,
        );
      }
    });

    const created = await this.getById(sessionId);
    if (!created) {
      throw new Error('Workout session transaction completed but the session could not be read.');
    }

    return created;
  }

  async getById(id: string): Promise<WorkoutSessionDetail | null> {
    const sessionRow = await this.database.getFirstAsync<WorkoutSessionRow>(
      'SELECT * FROM workout_sessions WHERE id = ?',
      id,
    );
    if (!sessionRow) {
      return null;
    }

    const exerciseRows = await this.database.getAllAsync<SessionExerciseRow>(
      `SELECT * FROM session_exercises
       WHERE session_id = ?
       ORDER BY position ASC`,
      id,
    );
    const exercises = await Promise.all(
      exerciseRows.map(async (exerciseRow) => {
        const setRows = await this.database.getAllAsync<WorkoutSetRow>(
          `SELECT * FROM workout_sets
           WHERE session_exercise_id = ?
           ORDER BY set_number ASC`,
          exerciseRow.id,
        );

        return {
          ...mapSessionExercise(exerciseRow),
          sets: setRows.map(mapWorkoutSet),
        };
      }),
    );

    return { ...mapWorkoutSession(sessionRow), exercises };
  }

  async listRecent({ limit = 50 }: { limit?: number } = {}): Promise<WorkoutSession[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      throw new RangeError('Workout session list limit must be an integer between 1 and 500.');
    }

    const rows = await this.database.getAllAsync<WorkoutSessionRow>(
      `SELECT * FROM workout_sessions
       ORDER BY started_at DESC
       LIMIT ?`,
      limit,
    );

    return rows.map(mapWorkoutSession);
  }

  async addSet(
    sessionExerciseId: string,
    input: CreateWorkoutSetInput,
  ): Promise<WorkoutSet> {
    validateWorkoutSet(input);
    const completedAt = input.isCompleted ? new Date().toISOString() : null;
    const result = await this.database.runAsync(
      `INSERT INTO workout_sets (
        session_exercise_id, set_number, weight_value, weight_unit, reps,
        is_completed, completed_at
      )
      SELECT ?, ?, ?, ?, ?, ?, ?
      WHERE EXISTS (
        SELECT 1
        FROM session_exercises se
        JOIN workout_sessions ws ON ws.id = se.session_id
        WHERE se.id = ? AND ws.status = 'active'
      )`,
      sessionExerciseId,
      input.setNumber,
      input.weightValue ?? null,
      input.weightUnit ?? null,
      input.reps ?? null,
      input.isCompleted ? 1 : 0,
      completedAt,
      sessionExerciseId,
    );

    if (result.changes === 0) {
      const session = await this.database.getFirstAsync<{ status: WorkoutSessionStatus }>(
        `SELECT ws.status
         FROM workout_sessions ws
         JOIN session_exercises se ON se.session_id = ws.id
         WHERE se.id = ?`,
        sessionExerciseId,
      );

      if (!session) {
        throw new Error(`Session exercise "${sessionExerciseId}" does not exist.`);
      }
      throw new Error(`Cannot add a set to a ${session.status} workout session.`);
    }

    await this.database.runAsync(
      `UPDATE workout_sessions
       SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = (
         SELECT session_id FROM session_exercises WHERE id = ?
       )`,
      sessionExerciseId,
    );

    const row = await this.database.getFirstAsync<WorkoutSetRow>(
      'SELECT * FROM workout_sets WHERE rowid = ?',
      result.lastInsertRowId,
    );

    if (!row) {
      throw new Error('Workout set was inserted but could not be read back.');
    }

    return mapWorkoutSet(row);
  }

  async complete(id: string, completedAt = new Date().toISOString()): Promise<boolean> {
    const normalizedCompletedAt = normalizeTimestamp(completedAt, 'Workout session completion time');
    const result = await this.database.runAsync(
      `UPDATE workout_sessions
       SET status = 'completed', completed_at = ?, updated_at = ?
       WHERE id = ? AND status IN ('active', 'paused')`,
      normalizedCompletedAt,
      normalizedCompletedAt,
      id,
    );

    return result.changes > 0;
  }
}
