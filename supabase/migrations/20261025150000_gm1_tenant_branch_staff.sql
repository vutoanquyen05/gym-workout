BEGIN;

-- =============================================================================
-- Migration: GM-1 Tenant, Branch, Staff Schema & Security Infrastructure
-- Scope: Multi-Tenant Architecture (gyms, branches, gym_staff)
-- Decisions Applied: OD-01 (Staff Invite), OD-02=A (Mutual Exclusivity & Zero Hard Delete), OD-04 (Boundary)
-- Gate: P0.T08 Execution
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Bảng gyms (Tenant gốc)
-- -----------------------------------------------------------------------------
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Kích hoạt RLS & Fail-Closed Default ngay lập tức
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.gyms FROM PUBLIC, anon, authenticated;

CREATE INDEX gyms_owner_id_idx ON public.gyms (owner_id);
CREATE INDEX gyms_status_idx ON public.gyms (status);

-- -----------------------------------------------------------------------------
-- 2. Bảng branches (Chi nhánh vận hành)
-- -----------------------------------------------------------------------------
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT branches_gym_slug_unique UNIQUE (gym_id, slug),
  -- Ràng buộc phục vụ Composite Foreign Key từ gym_staff và các bảng con
  CONSTRAINT branches_id_gym_unique UNIQUE (id, gym_id)
);

-- Kích hoạt RLS & Fail-Closed Default ngay lập tức
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.branches FROM PUBLIC, anon, authenticated;

CREATE INDEX branches_gym_id_idx ON public.branches (gym_id);
CREATE INDEX branches_status_idx ON public.branches (gym_id, status);

-- -----------------------------------------------------------------------------
-- 3. Bảng gym_staff (Phân quyền nhân sự & Multi-Branch)
-- -----------------------------------------------------------------------------
CREATE TABLE public.gym_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  branch_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'receptionist', 'trainer')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'suspended', 'revoked')),
  invited_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  activated_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  -- Composite Foreign Key: Ngăn chặn triệt để gán chi nhánh chéo tenant (Cross-Tenant Branch Assignment)
  -- Sử dụng ON DELETE RESTRICT để tuân thủ Zero Hard Delete (OD-02=A) và bảo vệ audit trail
  CONSTRAINT fk_gym_staff_branch_gym FOREIGN KEY (branch_id, gym_id)
    REFERENCES public.branches(id, gym_id) ON DELETE RESTRICT
);

-- Kích hoạt RLS & Fail-Closed Default ngay lập tức
ALTER TABLE public.gym_staff ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.gym_staff FROM PUBLIC, anon, authenticated;

CREATE INDEX gym_staff_lookup_idx ON public.gym_staff (gym_id, user_id, status);
CREATE INDEX gym_staff_branch_idx ON public.gym_staff (branch_id);

-- Partial Unique Indexes: Bảo đảm tính duy nhất và hỗ trợ Mutual Exclusivity (OD-02=A)
-- 1. Quyền toàn Gym (branch_id IS NULL) cho nhân sự active
CREATE UNIQUE INDEX gym_staff_gym_user_null_branch_idx
  ON public.gym_staff (gym_id, user_id)
  WHERE branch_id IS NULL AND status = 'active';

-- 2. Quyền chi nhánh (branch_id IS NOT NULL) cho nhân sự active
CREATE UNIQUE INDEX gym_staff_gym_branch_user_idx
  ON public.gym_staff (gym_id, branch_id, user_id)
  WHERE branch_id IS NOT NULL AND status = 'active';

-- -----------------------------------------------------------------------------
-- 4. RLS Helper Functions (STABLE, SECURITY DEFINER, Search Path Pinned)
-- -----------------------------------------------------------------------------

-- Helper 1: Kiểm tra quyền Owner của Gym
CREATE OR REPLACE FUNCTION public.is_gym_owner(check_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (auth.uid() IS NOT NULL)
    AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
    AND (
      EXISTS (
        SELECT 1 FROM public.gyms
        WHERE id = check_gym_id
          AND owner_id = auth.uid()
          AND status = 'active'
      ) OR EXISTS (
        SELECT 1 FROM public.gym_staff
        WHERE gym_id = check_gym_id
          AND user_id = auth.uid()
          AND role = 'owner'
          AND status = 'active'
          AND branch_id IS NULL
      )
    );
$$;

REVOKE ALL ON FUNCTION public.is_gym_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_gym_owner(UUID) TO authenticated;

-- Helper 2: Kiểm tra nhân sự active của Gym/Branch (kèm role allowlist tùy chọn)
CREATE OR REPLACE FUNCTION public.is_active_staff(
  check_gym_id UUID,
  check_branch_id UUID DEFAULT NULL,
  allowed_roles TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (auth.uid() IS NOT NULL)
    AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
    AND EXISTS (
      SELECT 1
      FROM public.gym_staff s
      JOIN public.gyms g ON g.id = s.gym_id
      WHERE s.gym_id = check_gym_id
        AND s.user_id = auth.uid()
        AND s.status = 'active'
        AND g.status = 'active'
        AND (
          s.branch_id IS NULL -- Quyền toàn gym
          OR check_branch_id IS NULL -- Không yêu cầu branch cụ thể
          OR s.branch_id = check_branch_id -- Quyền đúng chi nhánh yêu cầu
        )
        AND (
          allowed_roles IS NULL -- Không lọc vai trò
          OR s.role = ANY(allowed_roles) -- Khớp vai trò được cấp phép
        )
    );
$$;

REVOKE ALL ON FUNCTION public.is_active_staff(UUID, UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_staff(UUID, UUID, TEXT[]) TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. RLS Policies & Grants (Fail-Closed Default, Read-Only Client Policy)
-- -----------------------------------------------------------------------------

-- Cấp quyền SELECT tối thiểu cho role authenticated
GRANT SELECT ON public.gyms, public.branches, public.gym_staff TO authenticated;

-- Policy 1: gyms - Cho phép đọc nếu là Owner hoặc Staff active
CREATE POLICY gyms_select_policy ON public.gyms
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    owner_id = auth.uid()
    OR public.is_active_staff(id)
  )
);

-- Policy 2: branches - Cho phép đọc nếu là Owner hoặc Staff active thuộc gym/branch
CREATE POLICY branches_select_policy ON public.branches
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id, id)
  )
);

-- Policy 3: gym_staff - Phân quyền đọc nhân sự
CREATE POLICY gym_staff_select_policy ON public.gym_staff
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    -- User tự đọc bản ghi nhân sự của chính mình
    user_id = auth.uid()
    -- Hoặc Owner đọc toàn bộ nhân sự trong gym
    OR public.is_gym_owner(gym_id)
    -- Hoặc Manager đọc nhân sự trong chi nhánh mình quản lý
    OR (
      branch_id IS NOT NULL
      AND public.is_active_staff(gym_id, branch_id)
      AND EXISTS (
        SELECT 1 FROM public.gym_staff s
        WHERE s.gym_id = gym_staff.gym_id
          AND s.user_id = auth.uid()
          AND s.role = 'manager'
          AND s.status = 'active'
          AND (s.branch_id IS NULL OR s.branch_id = gym_staff.branch_id)
      )
    )
  )
);

COMMIT;
