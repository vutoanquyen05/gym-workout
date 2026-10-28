export type Migration = {
  version: number;
  sql: string;
};

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE exercises (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        primary_muscle_group TEXT NOT NULL CHECK (length(trim(primary_muscle_group)) > 0),
        equipment TEXT,
        difficulty TEXT,
        instructions TEXT,
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE TABLE workout_plans (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        description TEXT,
        is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE TABLE plan_exercises (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        plan_id TEXT NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
        exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
        position INTEGER NOT NULL CHECK (position >= 0),
        target_sets INTEGER NOT NULL CHECK (target_sets > 0),
        target_reps_min INTEGER CHECK (target_reps_min IS NULL OR target_reps_min > 0),
        target_reps_max INTEGER CHECK (target_reps_max IS NULL OR target_reps_max > 0),
        rest_seconds INTEGER CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        CHECK (
          target_reps_min IS NULL OR target_reps_max IS NULL OR target_reps_max >= target_reps_min
        ),
        UNIQUE (plan_id, position)
      );

      CREATE TABLE workout_sessions (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        plan_id TEXT REFERENCES workout_plans(id) ON DELETE SET NULL,
        title TEXT NOT NULL CHECK (length(trim(title)) > 0),
        status TEXT NOT NULL DEFAULT 'active'
          CHECK (status IN ('active', 'paused', 'completed')),
        started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        CHECK (
          (status = 'completed' AND completed_at IS NOT NULL) OR
          (status <> 'completed' AND completed_at IS NULL)
        )
      );

      CREATE TABLE session_exercises (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        session_id TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
        exercise_id TEXT REFERENCES exercises(id) ON DELETE SET NULL,
        exercise_name TEXT NOT NULL CHECK (length(trim(exercise_name)) > 0),
        position INTEGER NOT NULL CHECK (position >= 0),
        target_sets INTEGER CHECK (target_sets IS NULL OR target_sets > 0),
        target_reps_min INTEGER CHECK (target_reps_min IS NULL OR target_reps_min > 0),
        target_reps_max INTEGER CHECK (target_reps_max IS NULL OR target_reps_max > 0),
        rest_seconds INTEGER CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        CHECK (
          target_reps_min IS NULL OR target_reps_max IS NULL OR target_reps_max >= target_reps_min
        ),
        UNIQUE (session_id, position)
      );

      CREATE TABLE workout_sets (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        session_exercise_id TEXT NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
        set_number INTEGER NOT NULL CHECK (set_number > 0),
        weight_value REAL CHECK (weight_value IS NULL OR weight_value >= 0),
        weight_unit TEXT CHECK (weight_unit IS NULL OR weight_unit IN ('kg', 'lb')),
        reps INTEGER CHECK (reps IS NULL OR reps >= 0),
        is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        CHECK (
          (weight_value IS NULL AND weight_unit IS NULL) OR
          (weight_value IS NOT NULL AND weight_unit IS NOT NULL)
        ),
        CHECK (
          (is_completed = 0 AND completed_at IS NULL) OR
          (is_completed = 1 AND completed_at IS NOT NULL AND reps > 0)
        ),
        UNIQUE (session_exercise_id, set_number)
      );

      CREATE INDEX exercises_name_idx ON exercises(name COLLATE NOCASE);
      CREATE INDEX exercises_primary_muscle_group_idx ON exercises(primary_muscle_group);
      CREATE INDEX plan_exercises_exercise_id_idx ON plan_exercises(exercise_id);
      CREATE INDEX workout_sessions_started_at_idx ON workout_sessions(started_at DESC);
      CREATE INDEX workout_sessions_status_idx ON workout_sessions(status);
      CREATE INDEX session_exercises_exercise_id_idx ON session_exercises(exercise_id);
      CREATE INDEX workout_sets_session_exercise_id_idx ON workout_sets(session_exercise_id);
    `,
  },
];

export const DATABASE_NAME = 'gym-workout.db';
export const LATEST_SCHEMA_VERSION = MIGRATIONS.at(-1)?.version ?? 0;
