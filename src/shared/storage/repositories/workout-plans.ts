import type { StorageDatabase } from '@/shared/storage/database';
import type {
  AddPlanExerciseInput,
  CreatePlanInput,
  Exercise,
  PlanExercise,
  WorkoutPlan,
  WorkoutPlanDetail,
} from '@/shared/storage/types';

type WorkoutPlanRow = {
  id: string;
  name: string;
  description: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
};

type PlanExerciseRow = {
  id: string;
  plan_id: string;
  exercise_id: string;
  position: number;
  target_sets: number;
  target_reps_min: number | null;
  target_reps_max: number | null;
  rest_seconds: number | null;
  exercise_name: string;
  primary_muscle_group: string;
  equipment: string | null;
  difficulty: string | null;
  instructions: string | null;
  exercise_is_archived: number;
  exercise_created_at: string;
  exercise_updated_at: string;
};

function mapWorkoutPlan(row: WorkoutPlanRow): WorkoutPlan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPlanExercise(row: PlanExerciseRow): PlanExercise {
  return {
    id: row.id,
    planId: row.plan_id,
    exerciseId: row.exercise_id,
    position: row.position,
    targetSets: row.target_sets,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,
    restSeconds: row.rest_seconds,
  };
}

function mapExercise(row: PlanExerciseRow): Exercise {
  return {
    id: row.exercise_id,
    name: row.exercise_name,
    primaryMuscleGroup: row.primary_muscle_group,
    equipment: row.equipment,
    difficulty: row.difficulty,
    instructions: row.instructions,
    isArchived: row.exercise_is_archived === 1,
    createdAt: row.exercise_created_at,
    updatedAt: row.exercise_updated_at,
  };
}

function requireText(value: string, field: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new RangeError(`${field} must not be empty.`);
  }

  return trimmed;
}

function validatePlanExercise(input: AddPlanExerciseInput) {
  if (!Number.isInteger(input.position) || input.position < 0) {
    throw new RangeError('Plan exercise position must be a non-negative integer.');
  }
  if (!Number.isInteger(input.targetSets) || input.targetSets < 1) {
    throw new RangeError('Target sets must be a positive integer.');
  }
  if (
    input.targetRepsMin != null &&
    (!Number.isInteger(input.targetRepsMin) || input.targetRepsMin < 1)
  ) {
    throw new RangeError('Minimum target repetitions must be a positive integer.');
  }
  if (
    input.targetRepsMax != null &&
    (!Number.isInteger(input.targetRepsMax) || input.targetRepsMax < 1)
  ) {
    throw new RangeError('Maximum target repetitions must be a positive integer.');
  }
  if (
    input.targetRepsMin != null &&
    input.targetRepsMax != null &&
    input.targetRepsMax < input.targetRepsMin
  ) {
    throw new RangeError('Maximum target repetitions must be at least the minimum.');
  }
  if (input.restSeconds != null && (!Number.isInteger(input.restSeconds) || input.restSeconds < 0)) {
    throw new RangeError('Rest time must be a non-negative integer.');
  }
}

const PLAN_EXERCISE_SELECT = `
  SELECT pe.*, e.name AS exercise_name,
    e.primary_muscle_group, e.equipment, e.difficulty, e.instructions,
    e.is_archived AS exercise_is_archived,
    e.created_at AS exercise_created_at, e.updated_at AS exercise_updated_at
  FROM plan_exercises pe
  JOIN exercises e ON e.id = pe.exercise_id
`;

export class WorkoutPlanRepository {
  constructor(private readonly database: StorageDatabase) {}

  async create(input: CreatePlanInput): Promise<WorkoutPlan> {
    const name = requireText(input.name, 'Workout plan name');
    const result = await this.database.runAsync(
      'INSERT INTO workout_plans (name, description) VALUES (?, ?)',
      name,
      input.description?.trim() || null,
    );
    const row = await this.database.getFirstAsync<WorkoutPlanRow>(
      'SELECT * FROM workout_plans WHERE rowid = ?',
      result.lastInsertRowId,
    );

    if (!row) {
      throw new Error('Workout plan was inserted but could not be read back.');
    }

    return mapWorkoutPlan(row);
  }

  async getById(id: string): Promise<WorkoutPlanDetail | null> {
    const row = await this.database.getFirstAsync<WorkoutPlanRow>(
      'SELECT * FROM workout_plans WHERE id = ?',
      id,
    );
    if (!row) {
      return null;
    }

    const exerciseRows = await this.database.getAllAsync<PlanExerciseRow>(
      `${PLAN_EXERCISE_SELECT}
       WHERE pe.plan_id = ?
       ORDER BY pe.position ASC`,
      id,
    );

    return {
      ...mapWorkoutPlan(row),
      exercises: exerciseRows.map((exerciseRow) => ({
        ...mapPlanExercise(exerciseRow),
        exercise: mapExercise(exerciseRow),
      })),
    };
  }

  async list({ includeArchived = false }: { includeArchived?: boolean } = {}) {
    const rows = await this.database.getAllAsync<WorkoutPlanRow>(
      `SELECT * FROM workout_plans ${includeArchived ? '' : 'WHERE is_archived = 0'}
       ORDER BY updated_at DESC, name COLLATE NOCASE ASC`,
    );

    return rows.map(mapWorkoutPlan);
  }

  async addExercise(planId: string, input: AddPlanExerciseInput): Promise<PlanExercise> {
    validatePlanExercise(input);
    const result = await this.database.runAsync(
      `INSERT INTO plan_exercises (
        plan_id, exercise_id, position, target_sets, target_reps_min, target_reps_max, rest_seconds
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      planId,
      input.exerciseId,
      input.position,
      input.targetSets,
      input.targetRepsMin ?? null,
      input.targetRepsMax ?? null,
      input.restSeconds ?? null,
    );
    const row = await this.database.getFirstAsync<PlanExerciseRow>(
      'SELECT * FROM plan_exercises WHERE rowid = ?',
      result.lastInsertRowId,
    );

    if (!row) {
      throw new Error('Plan exercise was inserted but could not be read back.');
    }

    await this.database.runAsync(
      `UPDATE workout_plans
       SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
      planId,
    );

    return mapPlanExercise(row);
  }

  async archive(id: string): Promise<boolean> {
    const result = await this.database.runAsync(
      `UPDATE workout_plans
       SET is_archived = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND is_archived = 0`,
      id,
    );

    return result.changes > 0;
  }
}
