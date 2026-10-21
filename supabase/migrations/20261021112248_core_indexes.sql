BEGIN;

CREATE INDEX exercises_owner_id_idx
  ON public.exercises (owner_id);

CREATE INDEX workout_plans_user_updated_at_idx
  ON public.workout_plans (user_id, updated_at DESC);

CREATE INDEX workout_sessions_user_started_at_idx
  ON public.workout_sessions (user_id, started_at DESC);

CREATE INDEX workout_sessions_plan_id_idx
  ON public.workout_sessions (plan_id)
  WHERE plan_id IS NOT NULL;

CREATE INDEX plan_exercises_user_plan_position_idx
  ON public.plan_exercises (user_id, plan_id, position);

CREATE UNIQUE INDEX plan_exercises_active_position_uidx
  ON public.plan_exercises (plan_id, position)
  WHERE deleted_at IS NULL;

CREATE INDEX plan_exercises_exercise_id_idx
  ON public.plan_exercises (exercise_id);

CREATE INDEX session_exercises_user_session_position_idx
  ON public.session_exercises (user_id, session_id, position);

CREATE UNIQUE INDEX session_exercises_active_position_uidx
  ON public.session_exercises (session_id, position)
  WHERE deleted_at IS NULL;

CREATE INDEX session_exercises_source_exercise_id_idx
  ON public.session_exercises (source_exercise_id)
  WHERE source_exercise_id IS NOT NULL;

CREATE INDEX workout_sets_user_session_exercise_number_idx
  ON public.workout_sets (user_id, session_exercise_id, set_number);

CREATE UNIQUE INDEX workout_sets_active_number_uidx
  ON public.workout_sets (session_exercise_id, set_number)
  WHERE deleted_at IS NULL;

COMMIT;