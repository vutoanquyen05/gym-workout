BEGIN;

CREATE POLICY users_select_own
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'is_anonymous') IS DISTINCT FROM 'true'
    AND id = (SELECT auth.uid())
  );

CREATE POLICY exercises_select_system_or_own
  ON public.exercises
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'is_anonymous') IS DISTINCT FROM 'true'
    AND (
      scope = 'system'
      OR (scope = 'user' AND owner_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY workout_plans_select_own
  ON public.workout_plans
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'is_anonymous') IS DISTINCT FROM 'true'
    AND user_id = (SELECT auth.uid())
  );

CREATE POLICY plan_exercises_select_own_parent_and_exercise
  ON public.plan_exercises
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'is_anonymous') IS DISTINCT FROM 'true'
    AND user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.workout_plans AS plan
      WHERE plan.id = plan_exercises.plan_id
        AND plan.user_id = plan_exercises.user_id
    )
    AND EXISTS (
      SELECT 1
      FROM public.exercises AS exercise
      WHERE exercise.id = plan_exercises.exercise_id
        AND (
          exercise.scope = 'system'
          OR (
            exercise.scope = 'user'
            AND exercise.owner_id = (SELECT auth.uid())
          )
        )
    )
  );

CREATE POLICY workout_sessions_select_own
  ON public.workout_sessions
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'is_anonymous') IS DISTINCT FROM 'true'
    AND user_id = (SELECT auth.uid())
  );

CREATE POLICY session_exercises_select_own_parent
  ON public.session_exercises
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'is_anonymous') IS DISTINCT FROM 'true'
    AND user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.workout_sessions AS session
      WHERE session.id = session_exercises.session_id
        AND session.user_id = session_exercises.user_id
    )
  );

CREATE POLICY workout_sets_select_own_parent
  ON public.workout_sets
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'is_anonymous') IS DISTINCT FROM 'true'
    AND user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.session_exercises AS session_exercise
      WHERE session_exercise.id = workout_sets.session_exercise_id
        AND session_exercise.user_id = workout_sets.user_id
    )
  );

REVOKE ALL PRIVILEGES ON TABLE
  public.users,
  public.exercises,
  public.workout_plans,
  public.plan_exercises,
  public.workout_sessions,
  public.session_exercises,
  public.workout_sets
  FROM PUBLIC, anon, authenticated, service_role;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON TABLE
  public.users,
  public.exercises,
  public.workout_plans,
  public.plan_exercises,
  public.workout_sessions,
  public.session_exercises,
  public.workout_sets
  TO authenticated;

COMMIT;