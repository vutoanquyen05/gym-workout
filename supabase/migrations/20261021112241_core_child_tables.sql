BEGIN;

CREATE TABLE public.plan_exercises (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  position INTEGER NOT NULL,
  target_sets INTEGER NOT NULL,
  target_reps_min INTEGER,
  target_reps_max INTEGER,
  rest_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1,
  CONSTRAINT plan_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT plan_exercises_user_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT plan_exercises_plan_owner_fkey
    FOREIGN KEY (user_id, plan_id)
    REFERENCES public.workout_plans (user_id, id) ON DELETE CASCADE,
  CONSTRAINT plan_exercises_exercise_fkey
    FOREIGN KEY (exercise_id) REFERENCES public.exercises (id) ON DELETE RESTRICT,
  CONSTRAINT plan_exercises_position_check CHECK (position >= 0),
  CONSTRAINT plan_exercises_target_sets_check CHECK (target_sets > 0),
  CONSTRAINT plan_exercises_target_reps_min_check
    CHECK (target_reps_min IS NULL OR target_reps_min > 0),
  CONSTRAINT plan_exercises_target_reps_max_check
    CHECK (target_reps_max IS NULL OR target_reps_max > 0),
  CONSTRAINT plan_exercises_target_reps_range_check
    CHECK (
      target_reps_min IS NULL
      OR target_reps_max IS NULL
      OR target_reps_max >= target_reps_min
    ),
  CONSTRAINT plan_exercises_rest_seconds_check
    CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  CONSTRAINT plan_exercises_version_check CHECK (version >= 1)
);

ALTER TABLE public.plan_exercises ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.plan_exercises
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE public.session_exercises (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  source_exercise_id UUID,
  exercise_name TEXT NOT NULL,
  primary_muscle_group TEXT,
  equipment TEXT,
  difficulty TEXT,
  instructions TEXT,
  position INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps_min INTEGER,
  target_reps_max INTEGER,
  rest_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1,
  CONSTRAINT session_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT session_exercises_user_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT session_exercises_session_owner_fkey
    FOREIGN KEY (user_id, session_id)
    REFERENCES public.workout_sessions (user_id, id) ON DELETE CASCADE,
  CONSTRAINT session_exercises_source_exercise_fkey
    FOREIGN KEY (source_exercise_id)
    REFERENCES public.exercises (id) ON DELETE SET NULL,
  CONSTRAINT session_exercises_name_nonempty_check
    CHECK (length(trim(exercise_name)) > 0),
  CONSTRAINT session_exercises_position_check CHECK (position >= 0),
  CONSTRAINT session_exercises_target_sets_check
    CHECK (target_sets IS NULL OR target_sets > 0),
  CONSTRAINT session_exercises_target_reps_min_check
    CHECK (target_reps_min IS NULL OR target_reps_min > 0),
  CONSTRAINT session_exercises_target_reps_max_check
    CHECK (target_reps_max IS NULL OR target_reps_max > 0),
  CONSTRAINT session_exercises_target_reps_range_check
    CHECK (
      target_reps_min IS NULL
      OR target_reps_max IS NULL
      OR target_reps_max >= target_reps_min
    ),
  CONSTRAINT session_exercises_rest_seconds_check
    CHECK (rest_seconds IS NULL OR rest_seconds >= 0),
  CONSTRAINT session_exercises_version_check CHECK (version >= 1),
  CONSTRAINT session_exercises_user_id_id_key UNIQUE (user_id, id)
);

ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.session_exercises
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE public.workout_sets (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_exercise_id UUID NOT NULL,
  set_number INTEGER NOT NULL,
  weight_grams BIGINT,
  reps INTEGER,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1,
  CONSTRAINT workout_sets_pkey PRIMARY KEY (id),
  CONSTRAINT workout_sets_user_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT workout_sets_session_exercise_owner_fkey
    FOREIGN KEY (user_id, session_exercise_id)
    REFERENCES public.session_exercises (user_id, id) ON DELETE CASCADE,
  CONSTRAINT workout_sets_number_check CHECK (set_number > 0),
  CONSTRAINT workout_sets_weight_check
    CHECK (weight_grams IS NULL OR weight_grams >= 0),
  CONSTRAINT workout_sets_reps_check CHECK (reps IS NULL OR reps >= 0),
  CONSTRAINT workout_sets_completion_check
    CHECK (
      (is_completed = FALSE AND completed_at IS NULL)
      OR (
        is_completed = TRUE
        AND completed_at IS NOT NULL
        AND reps IS NOT NULL
        AND reps > 0
      )
    ),
  CONSTRAINT workout_sets_version_check CHECK (version >= 1)
);

ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.workout_sets
  FROM PUBLIC, anon, authenticated, service_role;

COMMIT;