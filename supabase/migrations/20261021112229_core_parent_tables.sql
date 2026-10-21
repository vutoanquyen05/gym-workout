BEGIN;

CREATE TABLE public.users (
  id UUID NOT NULL,
  display_name TEXT,
  preferred_weight_unit TEXT NOT NULL DEFAULT 'kg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_auth_user_fkey
    FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE RESTRICT,
  CONSTRAINT users_preferred_weight_unit_check
    CHECK (preferred_weight_unit IN ('kg', 'lb')),
  CONSTRAINT users_version_check CHECK (version >= 1)
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.users
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE public.exercises (
  id UUID NOT NULL,
  owner_id UUID,
  scope TEXT NOT NULL,
  name TEXT NOT NULL,
  primary_muscle_group TEXT NOT NULL,
  equipment TEXT,
  difficulty TEXT,
  instructions TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1,
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_owner_fkey
    FOREIGN KEY (owner_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT exercises_name_nonempty_check
    CHECK (length(trim(name)) > 0),
  CONSTRAINT exercises_primary_muscle_group_nonempty_check
    CHECK (length(trim(primary_muscle_group)) > 0),
  CONSTRAINT exercises_scope_owner_check
    CHECK (
      (scope = 'system' AND owner_id IS NULL)
      OR (scope = 'user' AND owner_id IS NOT NULL)
    ),
  CONSTRAINT exercises_version_check CHECK (version >= 1)
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.exercises
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE public.workout_plans (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1,
  CONSTRAINT workout_plans_pkey PRIMARY KEY (id),
  CONSTRAINT workout_plans_user_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT workout_plans_user_id_id_key UNIQUE (user_id, id),
  CONSTRAINT workout_plans_name_nonempty_check
    CHECK (length(trim(name)) > 0),
  CONSTRAINT workout_plans_version_check CHECK (version >= 1)
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.workout_plans
  FROM PUBLIC, anon, authenticated, service_role;

CREATE TABLE public.workout_sessions (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  plan_id UUID,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1,
  CONSTRAINT workout_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT workout_sessions_user_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE RESTRICT,
  CONSTRAINT workout_sessions_user_id_id_key UNIQUE (user_id, id),
  CONSTRAINT workout_sessions_plan_owner_fkey
    FOREIGN KEY (user_id, plan_id)
    REFERENCES public.workout_plans (user_id, id) ON DELETE RESTRICT,
  CONSTRAINT workout_sessions_title_nonempty_check
    CHECK (length(trim(title)) > 0),
  CONSTRAINT workout_sessions_status_check
    CHECK (status IN ('active', 'paused', 'completed')),
  CONSTRAINT workout_sessions_completion_check
    CHECK (
      (status = 'completed' AND completed_at IS NOT NULL)
      OR (status <> 'completed' AND completed_at IS NULL)
    ),
  CONSTRAINT workout_sessions_version_check CHECK (version >= 1)
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.workout_sessions
  FROM PUBLIC, anon, authenticated, service_role;

COMMIT;