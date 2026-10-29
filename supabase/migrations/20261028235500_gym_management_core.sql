BEGIN;

-- =============================================================================
-- Migration: Gym Management Core & Cloud Workout Extension (Phase 2)
-- Scope: 
--   1. Phân hệ Membership: membership_plans, memberships, attendance_logs
--   2. Mở rộng Cloud Workout: exercises (gym_id), workout_plans (gym_id, created_by,
--      assigned_to_user_id, assigned_by_user_id, plan_scope), workout_sessions (gym_id, branch_id, supervised_by_pt_id)
--   3. Row Level Security & Indexes
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Bảng membership_plans (Danh mục Gói tập của Gym)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  price BIGINT NOT NULL,
  duration_days INTEGER NOT NULL,
  session_limit INTEGER,
  scope TEXT NOT NULL DEFAULT 'all_branches',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT membership_plans_name_nonempty_check CHECK (length(trim(name)) > 0),
  CONSTRAINT membership_plans_price_check CHECK (price >= 0),
  CONSTRAINT membership_plans_duration_check CHECK (duration_days > 0),
  CONSTRAINT membership_plans_session_limit_check CHECK (session_limit IS NULL OR session_limit > 0),
  CONSTRAINT membership_plans_scope_check CHECK (scope IN ('all_branches', 'single_branch'))
);

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.membership_plans FROM PUBLIC, anon;
GRANT SELECT ON public.membership_plans TO authenticated;

CREATE INDEX IF NOT EXISTS membership_plans_gym_id_idx ON public.membership_plans(gym_id);
CREATE INDEX IF NOT EXISTS membership_plans_active_idx ON public.membership_plans(gym_id, is_active);

-- -----------------------------------------------------------------------------
-- 2. Bảng memberships (Hợp đồng / Thẻ Hội viên cụ thể)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  branch_id UUID REFERENCES public.branches(id) ON DELETE RESTRICT,
  assigned_pt_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  remaining_sessions INTEGER,
  qr_code_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT memberships_status_check CHECK (status IN ('pending_payment', 'active', 'paused', 'expired', 'cancelled')),
  CONSTRAINT memberships_date_range_check CHECK (end_date >= start_date),
  CONSTRAINT memberships_remaining_sessions_check CHECK (remaining_sessions IS NULL OR remaining_sessions >= 0)
);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.memberships FROM PUBLIC, anon;
GRANT SELECT ON public.memberships TO authenticated;

CREATE INDEX IF NOT EXISTS memberships_gym_user_idx ON public.memberships(gym_id, user_id);
CREATE INDEX IF NOT EXISTS memberships_status_idx ON public.memberships(gym_id, status);
CREATE INDEX IF NOT EXISTS memberships_assigned_pt_idx ON public.memberships(assigned_pt_id) WHERE assigned_pt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS memberships_qr_token_idx ON public.memberships(qr_code_token) WHERE qr_code_token IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. Bảng attendance_logs (Nhật ký Check-in Hội viên)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  check_out_at TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'receptionist_manual',
  checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT attendance_logs_method_check CHECK (method IN ('receptionist_manual', 'desk_qr_scan', 'turnstile_gate')),
  CONSTRAINT attendance_logs_checkout_check CHECK (check_out_at IS NULL OR check_out_at >= check_in_at)
);

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.attendance_logs FROM PUBLIC, anon;
GRANT SELECT ON public.attendance_logs TO authenticated;

CREATE INDEX IF NOT EXISTS attendance_logs_gym_branch_idx ON public.attendance_logs(gym_id, branch_id, check_in_at DESC);
CREATE INDEX IF NOT EXISTS attendance_logs_user_idx ON public.attendance_logs(user_id, check_in_at DESC);

-- -----------------------------------------------------------------------------
-- 4. Mở rộng Phân hệ Training Cloud (Workout Plans, Sessions, Exercises)
-- -----------------------------------------------------------------------------

-- 4.1 Exercises: Thêm hỗ trợ bài tập riêng theo Gym
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS exercises_gym_id_idx ON public.exercises(gym_id) WHERE gym_id IS NOT NULL;

-- 4.2 Workout Plans: Thêm quan hệ Tenant, Phân công PT & Học viên
ALTER TABLE public.workout_plans
  ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS plan_scope TEXT NOT NULL DEFAULT 'personal';

-- Thêm check constraint cho plan_scope
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workout_plans_plan_scope_check'
  ) THEN
    ALTER TABLE public.workout_plans
      ADD CONSTRAINT workout_plans_plan_scope_check
      CHECK (plan_scope IN ('personal', 'template', 'assigned'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS workout_plans_gym_idx ON public.workout_plans(gym_id) WHERE gym_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workout_plans_assigned_to_idx ON public.workout_plans(assigned_to_user_id) WHERE assigned_to_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workout_plans_assigned_by_idx ON public.workout_plans(assigned_by_user_id) WHERE assigned_by_user_id IS NOT NULL;

-- 4.3 Workout Sessions: Thêm quan hệ Tenant, Chi nhánh và PT giám sát
ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supervised_by_pt_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS workout_sessions_gym_idx ON public.workout_sessions(gym_id) WHERE gym_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workout_sessions_supervised_pt_idx ON public.workout_sessions(supervised_by_pt_id) WHERE supervised_by_pt_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 5. Row Level Security Policies
-- -----------------------------------------------------------------------------

-- 5.1 Policies cho membership_plans
CREATE POLICY membership_plans_select_policy ON public.membership_plans
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    -- Chủ sở hữu gym hoặc nhân sự active
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    -- Hoặc hội viên của gym đọc các gói tập đang active
    OR (
      is_active = TRUE
      AND EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.gym_id = membership_plans.gym_id
          AND m.user_id = auth.uid()
      )
    )
  )
);

-- 5.2 Policies cho memberships
CREATE POLICY memberships_select_policy ON public.memberships
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    -- Hội viên tự xem hợp đồng của chính mình
    user_id = auth.uid()
    -- PT xem học viên mình được phân công
    OR assigned_pt_id = auth.uid()
    -- Staff / Owner của gym xem danh sách hội viên
    OR public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

-- 5.3 Policies cho attendance_logs
CREATE POLICY attendance_logs_select_policy ON public.attendance_logs
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    -- Hội viên tự xem lịch sử điểm danh của mình
    user_id = auth.uid()
    -- Nhân sự chi nhánh hoặc Owner xem điểm danh
    OR public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id, branch_id)
  )
);

-- 5.4 Policies mở rộng cho workout_plans (PT & Assigned Member)
CREATE POLICY workout_plans_select_assigned ON public.workout_plans
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    -- Học viên được giao giáo án
    assigned_to_user_id = auth.uid()
    -- PT giao giáo án hoặc PT tạo giáo án
    OR assigned_by_user_id = auth.uid()
    OR created_by = auth.uid()
    -- Giáo án template dùng chung của Gym
    OR (
      gym_id IS NOT NULL
      AND plan_scope = 'template'
      AND (
        public.is_gym_owner(gym_id)
        OR public.is_active_staff(gym_id)
        OR EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.gym_id = workout_plans.gym_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
        )
      )
    )
  )
);

-- 5.5 Policies mở rộng cho workout_sessions (PT giám sát)
CREATE POLICY workout_sessions_select_supervised ON public.workout_sessions
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    -- PT trực tiếp giám sát buổi tập
    supervised_by_pt_id = auth.uid()
    -- Hoặc quản lý/owner gym nơi diễn ra buổi tập
    OR (
      gym_id IS NOT NULL
      AND (
        public.is_gym_owner(gym_id)
        OR public.is_active_staff(gym_id, branch_id)
      )
    )
  )
);

-- 5.6 Policies mở rộng cho exercises (Bài tập thuộc Gym)
CREATE POLICY exercises_select_gym_catalog ON public.exercises
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND gym_id IS NOT NULL
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.gym_id = exercises.gym_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  )
);

COMMIT;
