import type { StorageDatabase } from '@/shared/storage/database';
import type {
  CreateExerciseInput,
  Exercise,
} from '@/shared/storage/types';

type ExerciseRow = {
  id: string;
  name: string;
  primary_muscle_group: string;
  equipment: string | null;
  difficulty: string | null;
  instructions: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
};

function mapExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    primaryMuscleGroup: row.primary_muscle_group,
    equipment: row.equipment,
    difficulty: row.difficulty,
    instructions: row.instructions,
    isArchived: row.is_archived === 1,
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

export class ExerciseRepository {
  constructor(private readonly database: StorageDatabase) {}

  async create(input: CreateExerciseInput): Promise<Exercise> {
    const name = requireText(input.name, 'Exercise name');
    const primaryMuscleGroup = requireText(input.primaryMuscleGroup, 'Primary muscle group');
    const result = await this.database.runAsync(
      `INSERT INTO exercises (
        name, primary_muscle_group, equipment, difficulty, instructions
      ) VALUES (?, ?, ?, ?, ?)`,
      name,
      primaryMuscleGroup,
      input.equipment?.trim() || null,
      input.difficulty?.trim() || null,
      input.instructions?.trim() || null,
    );
    const row = await this.database.getFirstAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE rowid = ?',
      result.lastInsertRowId,
    );

    if (!row) {
      throw new Error('Exercise was inserted but could not be read back.');
    }

    return mapExercise(row);
  }

  async getById(id: string): Promise<Exercise | null> {
    const row = await this.database.getFirstAsync<ExerciseRow>(
      'SELECT * FROM exercises WHERE id = ?',
      id,
    );

    return row ? mapExercise(row) : null;
  }

  async list({
    search,
    includeArchived = false,
    limit = 100,
    offset = 0,
  }: {
    search?: string;
    includeArchived?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Exercise[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      throw new RangeError('Exercise list limit must be an integer between 1 and 500.');
    }
    if (!Number.isInteger(offset) || offset < 0) {
      throw new RangeError('Exercise list offset must be a non-negative integer.');
    }

    const conditions = includeArchived ? [] : ['is_archived = 0'];
    const parameters: (string | number)[] = [];
    const term = search?.trim();

    if (term) {
      conditions.push('(name LIKE ? COLLATE NOCASE OR primary_muscle_group LIKE ? COLLATE NOCASE)');
      parameters.push(`%${term}%`, `%${term}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await this.database.getAllAsync<ExerciseRow>(
      `SELECT * FROM exercises ${whereClause}
       ORDER BY name COLLATE NOCASE ASC
       LIMIT ? OFFSET ?`,
      ...parameters,
      limit,
      offset,
    );

    return rows.map(mapExercise);
  }

  async archive(id: string): Promise<boolean> {
    const result = await this.database.runAsync(
      `UPDATE exercises
       SET is_archived = 1, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND is_archived = 0`,
      id,
    );

    return result.changes > 0;
  }
}
