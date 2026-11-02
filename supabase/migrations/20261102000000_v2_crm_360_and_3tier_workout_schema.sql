BEGIN;

-- =============================================================================
-- Migration: v2.0 CRM 360° & 3-Tier Workout Coaching Platform Schema
-- Scope:
--   1. Mở rộng gym_staff: Thông tin liên hệ, tiểu sử & RLS chính sách quản lý
--   2. CRM Hội viên 360°: Tạo bảng gym_members độc lập Auth (OD-07)
--   3. Quản lý Thẻ & Thu ngân: Nâng cấp membership_plans, memberships, attendance_logs,
--      tạo bảng payment_transactions (BIGINT VND, hóa đơn, audit trail)
--   4. Trạm Xếp Bài Tập 3 Tầng: Mở rộng exercises, tạo workout_programs, program_days,
--      program_day_exercises, body_measurements (OD-08)
--   5. Thiết lập Row Level Security (RLS) fail-closed toàn diện
--   6. Khối Backfill an toàn cho các bản ghi memberships hiện có
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. MỞ RỘNG BẢNG gym_staff (HỒ SƠ NHÂN SỰ & QUẢN TRỊ TRỰC TIẾP)
-- -----------------------------------------------------------------------------
ALTER TABLE public.gym_staff
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS specialty TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Cấp quyền ghi trên gym_staff cho authenticated
GRANT INSERT, UPDATE ON TABLE public.gym_staff TO authenticated;

-- RLS INSERT: Cho phép Gym Owner hoặc Branch Manager thêm nhân viên
DROP POLICY IF EXISTS gym_staff_insert_policy ON public.gym_staff;
CREATE POLICY gym_staff_insert_policy ON public.gym_staff
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR (branch_id IS NOT NULL AND public.is_active_staff(gym_id, branch_id, ARRAY['manager']))
  )
);

-- RLS UPDATE: Cho phép Gym Owner, Branch Manager hoặc nhân sự tự cập nhật thông tin cá nhân
DROP POLICY IF EXISTS gym_staff_update_policy ON public.gym_staff;
CREATE POLICY gym_staff_update_policy ON public.gym_staff
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR user_id = auth.uid()
    OR (branch_id IS NOT NULL AND public.is_active_staff(gym_id, branch_id, ARRAY['manager']))
  )
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR user_id = auth.uid()
    OR (branch_id IS NOT NULL AND public.is_active_staff(gym_id, branch_id, ARRAY['manager']))
  )
);

-- -----------------------------------------------------------------------------
-- 2. TẠO BẢNG HỒ SƠ HỘI VIÊN CRM 360° (public.gym_members - OD-07)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  home_branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  linked_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_pt_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  member_code TEXT NOT NULL,
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) > 0),
  phone TEXT NOT NULL CHECK (length(trim(phone)) > 0),
  email TEXT,
  gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  address TEXT,
  emergency_contact TEXT,
  health_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT gym_members_gym_member_code_unique UNIQUE (gym_id, member_code)
);

-- Kích hoạt RLS & Fail-Closed
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.gym_members FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.gym_members TO authenticated;

-- Indexes tối ưu tra cứu CRM
CREATE INDEX IF NOT EXISTS gym_members_gym_phone_idx ON public.gym_members(gym_id, phone);
CREATE INDEX IF NOT EXISTS gym_members_gym_name_idx ON public.gym_members(gym_id, full_name);
CREATE INDEX IF NOT EXISTS gym_members_gym_status_idx ON public.gym_members(gym_id, status);
CREATE INDEX IF NOT EXISTS gym_members_linked_user_idx ON public.gym_members(linked_user_id) WHERE linked_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS gym_members_assigned_pt_idx ON public.gym_members(assigned_pt_id) WHERE assigned_pt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS gym_members_branch_idx ON public.gym_members(home_branch_id) WHERE home_branch_id IS NOT NULL;

-- RLS Policies cho gym_members
CREATE POLICY gym_members_select_policy ON public.gym_members
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    OR (linked_user_id IS NOT NULL AND linked_user_id = auth.uid())
  )
);

CREATE POLICY gym_members_insert_policy ON public.gym_members
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

CREATE POLICY gym_members_update_policy ON public.gym_members
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    OR (linked_user_id IS NOT NULL AND linked_user_id = auth.uid())
  )
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    OR (linked_user_id IS NOT NULL AND linked_user_id = auth.uid())
  )
);

CREATE POLICY gym_members_delete_policy ON public.gym_members
FOR DELETE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND public.is_gym_owner(gym_id)
);

-- -----------------------------------------------------------------------------
-- 3. NÂNG CẤP GÓI TẬP, THẺ HỘI VIÊN, ĐIỂM DANH & TẠO payment_transactions
-- -----------------------------------------------------------------------------

-- 3.1 Nâng cấp membership_plans
ALTER TABLE public.membership_plans
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'membership',
  ADD COLUMN IF NOT EXISTS description TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'membership_plans_plan_type_check'
  ) THEN
    ALTER TABLE public.membership_plans
      ADD CONSTRAINT membership_plans_plan_type_check
      CHECK (plan_type IN ('membership', 'pt_package', 'combo'));
  END IF;
END $$;

-- 3.2 Nâng cấp memberships: Gắn member_id và cho phép user_id nullable
ALTER TABLE public.memberships
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.gym_members(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.memberships
  ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS memberships_member_id_idx ON public.memberships(member_id) WHERE member_id IS NOT NULL;

-- Cập nhật RLS SELECT memberships hỗ trợ kiểm tra qua member_id
DROP POLICY IF EXISTS memberships_select_policy ON public.memberships;
CREATE POLICY memberships_select_policy ON public.memberships
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    user_id = auth.uid()
    OR assigned_pt_id = auth.uid()
    OR public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    OR (
      member_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.gym_members gm
        WHERE gm.id = memberships.member_id AND gm.linked_user_id = auth.uid()
      )
    )
  )
);

-- 3.3 Nâng cấp attendance_logs: Gắn member_id, user_id nullable và RLS quầy
ALTER TABLE public.attendance_logs
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.gym_members(id) ON DELETE CASCADE;

ALTER TABLE public.attendance_logs
  ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS attendance_logs_member_id_idx ON public.attendance_logs(member_id) WHERE member_id IS NOT NULL;

GRANT INSERT, UPDATE ON TABLE public.attendance_logs TO authenticated;

DROP POLICY IF EXISTS attendance_logs_select_policy ON public.attendance_logs;
CREATE POLICY attendance_logs_select_policy ON public.attendance_logs
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    user_id = auth.uid()
    OR public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id, branch_id)
    OR (
      member_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.gym_members gm
        WHERE gm.id = attendance_logs.member_id AND gm.linked_user_id = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS attendance_logs_insert_policy ON public.attendance_logs;
CREATE POLICY attendance_logs_insert_policy ON public.attendance_logs
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id, branch_id)
  )
);

DROP POLICY IF EXISTS attendance_logs_update_policy ON public.attendance_logs;
CREATE POLICY attendance_logs_update_policy ON public.attendance_logs
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id, branch_id)
  )
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id, branch_id)
  )
);

-- 3.4 Tạo bảng payment_transactions (Hóa đơn & Thu ngân POS - OD-05)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE RESTRICT,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  invoice_code TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'other')),
  payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('completed', 'pending', 'refunded', 'cancelled')),
  notes TEXT,
  recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT payment_transactions_gym_invoice_unique UNIQUE (gym_id, invoice_code)
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.payment_transactions FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.payment_transactions TO authenticated;

CREATE INDEX IF NOT EXISTS payment_transactions_gym_paid_at_idx ON public.payment_transactions(gym_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS payment_transactions_member_id_idx ON public.payment_transactions(member_id);
CREATE INDEX IF NOT EXISTS payment_transactions_membership_id_idx ON public.payment_transactions(membership_id) WHERE membership_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payment_transactions_invoice_code_idx ON public.payment_transactions(invoice_code);

CREATE POLICY payment_transactions_select_policy ON public.payment_transactions
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    OR EXISTS (
      SELECT 1 FROM public.gym_members gm
      WHERE gm.id = payment_transactions.member_id AND gm.linked_user_id = auth.uid()
    )
  )
);

CREATE POLICY payment_transactions_insert_policy ON public.payment_transactions
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

CREATE POLICY payment_transactions_update_policy ON public.payment_transactions
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND public.is_gym_owner(gym_id)
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND public.is_gym_owner(gym_id)
);

-- -----------------------------------------------------------------------------
-- 4. TRẠM XẾP BÀI TẬP 3 TẦNG (OD-08) & CHỈ SỐ CƠ THỂ
-- -----------------------------------------------------------------------------

-- 4.1 Mở rộng quyền ghi trên exercises (Thêm bài tập riêng của phòng gym)
GRANT INSERT, UPDATE ON TABLE public.exercises TO authenticated;

DROP POLICY IF EXISTS exercises_insert_gym_catalog ON public.exercises;
CREATE POLICY exercises_insert_gym_catalog ON public.exercises
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND gym_id IS NOT NULL
  AND (public.is_gym_owner(gym_id) OR public.is_active_staff(gym_id))
);

DROP POLICY IF EXISTS exercises_update_gym_catalog ON public.exercises;
CREATE POLICY exercises_update_gym_catalog ON public.exercises
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND gym_id IS NOT NULL
  AND (public.is_gym_owner(gym_id) OR public.is_active_staff(gym_id))
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND gym_id IS NOT NULL
  AND (public.is_gym_owner(gym_id) OR public.is_active_staff(gym_id))
);

-- 4.2 Bảng workout_programs (Tầng 2: Giáo án Tổng thể - Template hoặc Assigned)
CREATE TABLE IF NOT EXISTS public.workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  program_scope TEXT NOT NULL DEFAULT 'template' CHECK (program_scope IN ('template', 'assigned')),
  template_source_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.gym_members(id) ON DELETE CASCADE,
  created_by_staff_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  goal TEXT NOT NULL DEFAULT 'general' CHECK (goal IN ('fat_loss', 'hypertrophy', 'strength', 'endurance', 'general')),
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_weeks INT4 NOT NULL DEFAULT 4 CHECK (duration_weeks > 0),
  days_per_week INT4 NOT NULL DEFAULT 3 CHECK (days_per_week BETWEEN 1 AND 7),
  schedule_mode TEXT NOT NULL DEFAULT 'rolling_split' CHECK (schedule_mode IN ('rolling_split', 'fixed_weekday')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT workout_programs_scope_member_check CHECK (
    (program_scope = 'template' AND member_id IS NULL)
    OR (program_scope = 'assigned' AND member_id IS NOT NULL)
  )
);

ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.workout_programs FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.workout_programs TO authenticated;

CREATE INDEX IF NOT EXISTS workout_programs_gym_id_idx ON public.workout_programs(gym_id);
CREATE INDEX IF NOT EXISTS workout_programs_member_id_idx ON public.workout_programs(member_id) WHERE member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS workout_programs_scope_idx ON public.workout_programs(gym_id, program_scope);
CREATE INDEX IF NOT EXISTS workout_programs_created_by_idx ON public.workout_programs(created_by_staff_id) WHERE created_by_staff_id IS NOT NULL;

CREATE POLICY workout_programs_select_policy ON public.workout_programs
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    OR (
      member_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.gym_members gm
        WHERE gm.id = workout_programs.member_id AND gm.linked_user_id = auth.uid()
      )
    )
    OR (
      program_scope = 'template'
      AND is_active = true
      AND EXISTS (
        SELECT 1 FROM public.gym_members gm
        JOIN public.memberships m ON m.member_id = gm.id
        WHERE gm.gym_id = workout_programs.gym_id
          AND gm.linked_user_id = auth.uid()
          AND m.status = 'active'
      )
    )
  )
);

CREATE POLICY workout_programs_insert_policy ON public.workout_programs
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

CREATE POLICY workout_programs_update_policy ON public.workout_programs
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

CREATE POLICY workout_programs_delete_policy ON public.workout_programs
FOR DELETE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

-- 4.3 Bảng program_days (Tầng 3: Các Buổi tập trong Giáo án)
CREATE TABLE IF NOT EXISTS public.program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  day_number INT4 NOT NULL CHECK (day_number > 0),
  day_label TEXT NOT NULL CHECK (length(trim(day_label)) > 0),
  focus_muscle_groups TEXT,
  weekday INT4 CHECK (weekday IS NULL OR (weekday >= 1 AND weekday <= 7)),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT program_days_program_day_number_unique UNIQUE (program_id, day_number)
);

ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.program_days FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.program_days TO authenticated;

CREATE INDEX IF NOT EXISTS program_days_program_id_idx ON public.program_days(program_id, day_number);

CREATE POLICY program_days_select_policy ON public.program_days
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.workout_programs wp
    WHERE wp.id = program_days.program_id
      AND (
        public.is_gym_owner(wp.gym_id)
        OR public.is_active_staff(wp.gym_id)
        OR (
          wp.member_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.gym_members gm
            WHERE gm.id = wp.member_id AND gm.linked_user_id = auth.uid()
          )
        )
        OR (
          wp.program_scope = 'template'
          AND wp.is_active = true
          AND EXISTS (
            SELECT 1 FROM public.gym_members gm
            JOIN public.memberships m ON m.member_id = gm.id
            WHERE gm.gym_id = wp.gym_id
              AND gm.linked_user_id = auth.uid()
              AND m.status = 'active'
          )
        )
      )
  )
);

CREATE POLICY program_days_insert_policy ON public.program_days
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.workout_programs wp
    WHERE wp.id = program_days.program_id
      AND (public.is_gym_owner(wp.gym_id) OR public.is_active_staff(wp.gym_id))
  )
);

CREATE POLICY program_days_update_policy ON public.program_days
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.workout_programs wp
    WHERE wp.id = program_days.program_id
      AND (public.is_gym_owner(wp.gym_id) OR public.is_active_staff(wp.gym_id))
  )
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.workout_programs wp
    WHERE wp.id = program_days.program_id
      AND (public.is_gym_owner(wp.gym_id) OR public.is_active_staff(wp.gym_id))
  )
);

CREATE POLICY program_days_delete_policy ON public.program_days
FOR DELETE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.workout_programs wp
    WHERE wp.id = program_days.program_id
      AND (public.is_gym_owner(wp.gym_id) OR public.is_active_staff(wp.gym_id))
  )
);

-- 4.4 Bảng program_day_exercises (Tầng Chi tiết: Bài tập Chỉ định trong Buổi)
CREATE TABLE IF NOT EXISTS public.program_day_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_day_id UUID NOT NULL REFERENCES public.program_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  order_index INT4 NOT NULL DEFAULT 0 CHECK (order_index >= 0),
  superset_group TEXT,
  target_sets INT4 NOT NULL DEFAULT 3 CHECK (target_sets > 0),
  target_reps TEXT NOT NULL DEFAULT '8-12',
  target_weight_kg NUMERIC(6,2),
  target_rpe NUMERIC(3,1) CHECK (target_rpe IS NULL OR (target_rpe >= 1 AND target_rpe <= 10)),
  rest_seconds INT4 NOT NULL DEFAULT 90 CHECK (rest_seconds >= 0),
  tempo TEXT,
  coaching_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT program_day_exercises_day_order_unique UNIQUE (program_day_id, order_index)
);

ALTER TABLE public.program_day_exercises ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.program_day_exercises FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.program_day_exercises TO authenticated;

CREATE INDEX IF NOT EXISTS program_day_exercises_day_id_idx ON public.program_day_exercises(program_day_id, order_index);
CREATE INDEX IF NOT EXISTS program_day_exercises_exercise_id_idx ON public.program_day_exercises(exercise_id);

CREATE POLICY program_day_exercises_select_policy ON public.program_day_exercises
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.program_days pd
    JOIN public.workout_programs wp ON wp.id = pd.program_id
    WHERE pd.id = program_day_exercises.program_day_id
      AND (
        public.is_gym_owner(wp.gym_id)
        OR public.is_active_staff(wp.gym_id)
        OR (
          wp.member_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.gym_members gm
            WHERE gm.id = wp.member_id AND gm.linked_user_id = auth.uid()
          )
        )
        OR (
          wp.program_scope = 'template'
          AND wp.is_active = true
          AND EXISTS (
            SELECT 1 FROM public.gym_members gm
            JOIN public.memberships m ON m.member_id = gm.id
            WHERE gm.gym_id = wp.gym_id
              AND gm.linked_user_id = auth.uid()
              AND m.status = 'active'
          )
        )
      )
  )
);

CREATE POLICY program_day_exercises_insert_policy ON public.program_day_exercises
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.program_days pd
    JOIN public.workout_programs wp ON wp.id = pd.program_id
    WHERE pd.id = program_day_exercises.program_day_id
      AND (public.is_gym_owner(wp.gym_id) OR public.is_active_staff(wp.gym_id))
  )
);

CREATE POLICY program_day_exercises_update_policy ON public.program_day_exercises
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.program_days pd
    JOIN public.workout_programs wp ON wp.id = pd.program_id
    WHERE pd.id = program_day_exercises.program_day_id
      AND (public.is_gym_owner(wp.gym_id) OR public.is_active_staff(wp.gym_id))
  )
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.program_days pd
    JOIN public.workout_programs wp ON wp.id = pd.program_id
    WHERE pd.id = program_day_exercises.program_day_id
      AND (public.is_gym_owner(wp.gym_id) OR public.is_active_staff(wp.gym_id))
  )
);

CREATE POLICY program_day_exercises_delete_policy ON public.program_day_exercises
FOR DELETE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1 FROM public.program_days pd
    JOIN public.workout_programs wp ON wp.id = pd.program_id
    WHERE pd.id = program_day_exercises.program_day_id
      AND (public.is_gym_owner(wp.gym_id) OR public.is_active_staff(wp.gym_id))
  )
);

-- 4.5 Bảng body_measurements (Lịch sử Cân đo Thể trạng & InBody Hội viên)
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  recorded_by_staff_id UUID REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
  height_cm NUMERIC(5,2) CHECK (height_cm IS NULL OR height_cm > 0),
  body_fat_pct NUMERIC(4,2) CHECK (body_fat_pct IS NULL OR (body_fat_pct >= 0 AND body_fat_pct <= 100)),
  skeletal_muscle_kg NUMERIC(5,2) CHECK (skeletal_muscle_kg IS NULL OR skeletal_muscle_kg >= 0),
  waist_cm NUMERIC(5,2),
  chest_cm NUMERIC(5,2),
  hip_cm NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.body_measurements FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.body_measurements TO authenticated;

CREATE INDEX IF NOT EXISTS body_measurements_member_idx ON public.body_measurements(member_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS body_measurements_gym_idx ON public.body_measurements(gym_id);

CREATE POLICY body_measurements_select_policy ON public.body_measurements
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
    OR EXISTS (
      SELECT 1 FROM public.gym_members gm
      WHERE gm.id = body_measurements.member_id AND gm.linked_user_id = auth.uid()
    )
  )
);

CREATE POLICY body_measurements_insert_policy ON public.body_measurements
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

CREATE POLICY body_measurements_update_policy ON public.body_measurements
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

CREATE POLICY body_measurements_delete_policy ON public.body_measurements
FOR DELETE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

-- -----------------------------------------------------------------------------
-- 5. ĐỒNG BỘ AUTH.USERS & KHỐI BACKFILL DỮ LIỆU AN TOÀN CHO HỘI VIÊN HIỆN CÓ
-- -----------------------------------------------------------------------------
-- Đồng bộ tài khoản auth.users vào public.users để chống lỗi khóa ngoại linked_user_id_fkey
INSERT INTO public.users (id, display_name)
SELECT au.id, coalesce(au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1), 'Hội viên')
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  r RECORD;
  v_member_id UUID;
  v_member_code TEXT;
  v_name TEXT;
  v_phone TEXT;
  v_seq INT := 1000;
BEGIN
  FOR r IN
    SELECT m.id AS membership_id, m.gym_id, m.branch_id, m.user_id, u.id AS valid_user_id, u.display_name, u.phone
    FROM public.memberships m
    LEFT JOIN public.users u ON u.id = m.user_id
    WHERE m.member_id IS NULL
  LOOP
    v_name := coalesce(nullif(trim(r.display_name), ''), 'Hội viên khởi tạo');
    v_phone := coalesce(nullif(trim(r.phone), ''), '0900' || lpad(v_seq::text, 6, '0'));
    v_member_code := 'MEM-' || lpad(v_seq::text, 6, '0');
    v_seq := v_seq + 1;

    -- Kiểm tra xem hội viên với số điện thoại hoặc linked_user_id này đã có trong gym chưa
    SELECT id INTO v_member_id
    FROM public.gym_members
    WHERE gym_id = r.gym_id
      AND (
        (r.valid_user_id IS NOT NULL AND linked_user_id = r.valid_user_id)
        OR phone = v_phone
      )
    LIMIT 1;

    -- Nếu chưa có, tạo mới hồ sơ CRM (chỉ gán linked_user_id khi user thực sự tồn tại trong public.users)
    IF v_member_id IS NULL THEN
      INSERT INTO public.gym_members (
        gym_id,
        home_branch_id,
        linked_user_id,
        member_code,
        full_name,
        phone,
        status
      ) VALUES (
        r.gym_id,
        r.branch_id,
        r.valid_user_id,
        v_member_code,
        v_name,
        v_phone,
        'active'
      )
      RETURNING id INTO v_member_id;
    END IF;

    -- Cập nhật con trỏ member_id vào bảng memberships
    UPDATE public.memberships
    SET member_id = v_member_id
    WHERE id = r.membership_id;
  END LOOP;
END $$;

COMMIT;

