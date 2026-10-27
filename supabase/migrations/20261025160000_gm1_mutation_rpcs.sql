BEGIN;

-- =============================================================================
-- Migration: GM-1 Mutation RPCs (Server-Side ACID Mutation Gateway)
-- Scope: Multi-Tenant Tenant Onboarding, Branch Management, Staff RBAC Lifecycle
-- Decisions Applied: OD-01 (Staff Onboarding), OD-02=A (Mutual Exclusivity & Zero Hard Delete), OD-04 (Boundary RPC)
-- Tasks: P1.T04 (Staff Flow), P1.T05 (Admin Web Auth/Lookup)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. RPC: rpc_create_gym
-- Cho phép user đã đăng nhập tạo 1 phòng gym mới và tự động thiết lập chi nhánh chính
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_create_gym(
  p_name TEXT,
  p_slug TEXT,
  p_main_branch_name TEXT DEFAULT 'Chi nhánh chính',
  p_main_branch_slug TEXT DEFAULT 'main',
  p_main_branch_address TEXT DEFAULT NULL,
  p_main_branch_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_gym_id UUID;
  v_branch_id UUID;
  v_staff_id UUID;
  v_clean_name TEXT;
  v_clean_slug TEXT;
  v_clean_branch_name TEXT;
  v_clean_branch_slug TEXT;
BEGIN
  -- 1. Caller verification guard
  v_user_id := auth.uid();
  IF v_user_id IS NULL OR (auth.jwt() ->> 'is_anonymous')::boolean IS TRUE THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be an authenticated non-anonymous user'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Validation
  v_clean_name := trim(p_name);
  v_clean_slug := lower(trim(p_slug));
  IF v_clean_name IS NULL OR length(v_clean_name) = 0 THEN
    RAISE EXCEPTION 'Validation failed: Gym name is required' USING ERRCODE = '22023';
  END IF;
  IF v_clean_slug IS NULL OR length(v_clean_slug) = 0 THEN
    RAISE EXCEPTION 'Validation failed: Gym slug is required' USING ERRCODE = '22023';
  END IF;

  v_clean_branch_name := coalesce(nullif(trim(p_main_branch_name), ''), 'Chi nhánh chính');
  v_clean_branch_slug := coalesce(nullif(lower(trim(p_main_branch_slug)), ''), 'main');

  -- 3. Insert gym
  INSERT INTO public.gyms (name, slug, owner_id, status)
  VALUES (v_clean_name, v_clean_slug, v_user_id, 'active')
  RETURNING id INTO v_gym_id;

  -- 4. Insert default main branch
  INSERT INTO public.branches (gym_id, name, slug, address, phone, status)
  VALUES (v_gym_id, v_clean_branch_name, v_clean_branch_slug, p_main_branch_address, p_main_branch_phone, 'active')
  RETURNING id INTO v_branch_id;

  -- 5. Insert owner record into gym_staff (toàn gym, branch_id IS NULL)
  INSERT INTO public.gym_staff (gym_id, branch_id, user_id, role, status, activated_at)
  VALUES (v_gym_id, NULL, v_user_id, 'owner', 'active', timezone('utc', now()))
  RETURNING id INTO v_staff_id;

  RETURN jsonb_build_object(
    'gym_id', v_gym_id,
    'branch_id', v_branch_id,
    'staff_id', v_staff_id,
    'name', v_clean_name,
    'slug', v_clean_slug
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_create_gym(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_create_gym(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- -----------------------------------------------------------------------------
-- 2. RPC: rpc_manage_branch
-- Cho phép Owner tạo mới hoặc cập nhật thông tin/trạng thái chi nhánh
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_manage_branch(
  p_gym_id UUID,
  p_branch_id UUID DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_res_branch_id UUID;
  v_action TEXT;
  v_clean_name TEXT;
  v_clean_slug TEXT;
  v_new_status TEXT;
BEGIN
  -- 1. Caller verification
  v_user_id := auth.uid();
  IF v_user_id IS NULL OR (auth.jwt() ->> 'is_anonymous')::boolean IS TRUE THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be an authenticated non-anonymous user'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Authorization: Only Gym Owner can manage branches
  IF NOT public.is_gym_owner(p_gym_id) THEN
    RAISE EXCEPTION 'Forbidden: Only active gym owner can manage branches'
      USING ERRCODE = '42501';
  END IF;

  -- 3. Branch creation or update
  IF p_branch_id IS NULL THEN
    -- CREATE BRANCH
    v_clean_name := trim(p_name);
    v_clean_slug := lower(trim(p_slug));
    IF v_clean_name IS NULL OR length(v_clean_name) = 0 THEN
      RAISE EXCEPTION 'Validation failed: Branch name is required' USING ERRCODE = '22023';
    END IF;
    IF v_clean_slug IS NULL OR length(v_clean_slug) = 0 THEN
      RAISE EXCEPTION 'Validation failed: Branch slug is required' USING ERRCODE = '22023';
    END IF;

    v_new_status := coalesce(p_status, 'active');
    IF v_new_status NOT IN ('active', 'suspended', 'archived') THEN
      RAISE EXCEPTION 'Validation failed: Invalid branch status %', v_new_status USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.branches (gym_id, name, slug, address, phone, status)
    VALUES (p_gym_id, v_clean_name, v_clean_slug, p_address, p_phone, v_new_status)
    RETURNING id INTO v_res_branch_id;

    v_action := 'created';
  ELSE
    -- UPDATE BRANCH
    IF NOT EXISTS (
      SELECT 1 FROM public.branches WHERE id = p_branch_id AND gym_id = p_gym_id
    ) THEN
      RAISE EXCEPTION 'Branch not found or does not belong to specified gym'
        USING ERRCODE = 'P0002';
    END IF;

    IF p_status IS NOT NULL AND p_status NOT IN ('active', 'suspended', 'archived') THEN
      RAISE EXCEPTION 'Validation failed: Invalid branch status %', p_status USING ERRCODE = '22023';
    END IF;

    UPDATE public.branches
    SET
      name = coalesce(nullif(trim(p_name), ''), name),
      slug = coalesce(nullif(lower(trim(p_slug)), ''), slug),
      address = coalesce(p_address, address),
      phone = coalesce(p_phone, phone),
      status = coalesce(p_status, status),
      updated_at = timezone('utc', now())
    WHERE id = p_branch_id AND gym_id = p_gym_id
    RETURNING id, status INTO v_res_branch_id, v_new_status;

    v_action := 'updated';
  END IF;

  RETURN jsonb_build_object(
    'branch_id', v_res_branch_id,
    'gym_id', p_gym_id,
    'action', v_action,
    'status', v_new_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_manage_branch(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_manage_branch(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- -----------------------------------------------------------------------------
-- 3. RPC: rpc_revoke_or_update_staff
-- Quản lý nhân sự, thực thi Mutual Exclusivity (OD-02=A), Zero Hard Delete
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_revoke_or_update_staff(
  p_gym_id UUID,
  p_staff_user_id UUID,
  p_action TEXT, -- 'assign', 'update_role', 'revoke', 'suspend', 'activate'
  p_branch_id UUID DEFAULT NULL,
  p_role TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_staff_id UUID;
  v_target_role TEXT;
  v_result_status TEXT;
  v_is_owner BOOLEAN;
BEGIN
  -- 1. Caller verification
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR (auth.jwt() ->> 'is_anonymous')::boolean IS TRUE THEN
    RAISE EXCEPTION 'Unauthorized: Caller must be an authenticated non-anonymous user'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Advisory xact lock to prevent concurrency races on staff assignments (OD-02=A)
  PERFORM pg_advisory_xact_lock(hashtext('gym_staff_' || p_gym_id::text || '_' || p_staff_user_id::text));

  -- 3. Authorization check
  v_is_owner := public.is_gym_owner(p_gym_id);
  IF NOT v_is_owner THEN
    -- Nếu không phải Owner, kiểm tra xem có phải Manager toàn gym hoặc Manager của chi nhánh p_branch_id không
    IF p_branch_id IS NULL OR NOT public.is_active_staff(p_gym_id, p_branch_id, ARRAY['manager']) THEN
      RAISE EXCEPTION 'Forbidden: Only gym owner or branch manager can manage staff'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- 4. Protection: Cannot modify gym owner user_id
  IF EXISTS (
    SELECT 1 FROM public.gyms WHERE id = p_gym_id AND owner_id = p_staff_user_id
  ) AND p_action IN ('revoke', 'suspend') THEN
    RAISE EXCEPTION 'Forbidden: Cannot revoke or suspend the primary gym owner'
      USING ERRCODE = '42501';
  END IF;

  -- 5. Action dispatch
  IF p_action = 'revoke' THEN
    -- SOFT-REVOKE: Update status to 'revoked' (OD-02=A Zero Hard Delete)
    IF p_branch_id IS NULL THEN
      -- Revoke toàn bộ vai trò active của user trong gym này
      UPDATE public.gym_staff
      SET status = 'revoked',
          revoked_at = timezone('utc', now()),
          revoked_by = v_caller_id,
          updated_at = timezone('utc', now())
      WHERE gym_id = p_gym_id
        AND user_id = p_staff_user_id
        AND status IN ('active', 'invited', 'suspended');
    ELSE
      -- Revoke vai trò tại chi nhánh cụ thể
      UPDATE public.gym_staff
      SET status = 'revoked',
          revoked_at = timezone('utc', now()),
          revoked_by = v_caller_id,
          updated_at = timezone('utc', now())
      WHERE gym_id = p_gym_id
        AND user_id = p_staff_user_id
        AND branch_id = p_branch_id
        AND status IN ('active', 'invited', 'suspended');
    END IF;

    v_result_status := 'revoked';

  ELSIF p_action = 'suspend' THEN
    UPDATE public.gym_staff
    SET status = 'suspended',
        updated_at = timezone('utc', now())
    WHERE gym_id = p_gym_id
      AND user_id = p_staff_user_id
      AND (p_branch_id IS NULL OR branch_id = p_branch_id)
      AND status = 'active';

    v_result_status := 'suspended';

  ELSIF p_action = 'activate' THEN
    UPDATE public.gym_staff
    SET status = 'active',
        activated_at = coalesce(activated_at, timezone('utc', now())),
        updated_at = timezone('utc', now())
    WHERE gym_id = p_gym_id
      AND user_id = p_staff_user_id
      AND (p_branch_id IS NULL OR branch_id = p_branch_id)
      AND status IN ('invited', 'suspended');

    v_result_status := 'active';

  ELSIF p_action IN ('assign', 'update_role') THEN
    v_target_role := p_role;
    IF v_target_role NOT IN ('owner', 'manager', 'receptionist', 'trainer') THEN
      RAISE EXCEPTION 'Validation failed: Invalid staff role %', v_target_role USING ERRCODE = '22023';
    END IF;

    -- Only Owner can assign manager or owner role
    IF v_target_role IN ('owner', 'manager') AND NOT v_is_owner THEN
      RAISE EXCEPTION 'Forbidden: Only gym owner can assign manager or owner roles' USING ERRCODE = '42501';
    END IF;

    -- Kiểm tra Mutual Exclusivity (OD-02=A):
    IF p_branch_id IS NULL THEN
      -- Gán quyền toàn gym: Auto-revoke toàn bộ quyền chi nhánh lẻ active của user trong gym
      UPDATE public.gym_staff
      SET status = 'revoked',
          revoked_at = timezone('utc', now()),
          revoked_by = v_caller_id,
          updated_at = timezone('utc', now())
      WHERE gym_id = p_gym_id
        AND user_id = p_staff_user_id
        AND branch_id IS NOT NULL
        AND status = 'active';

      -- Tạo hoặc cập nhật dòng toàn gym active
      INSERT INTO public.gym_staff (gym_id, branch_id, user_id, role, status, activated_at)
      VALUES (p_gym_id, NULL, p_staff_user_id, v_target_role, 'active', timezone('utc', now()))
      ON CONFLICT (gym_id, user_id) WHERE branch_id IS NULL AND status = 'active'
      DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = timezone('utc', now())
      RETURNING id INTO v_staff_id;

    ELSE
      -- Gán quyền chi nhánh: Kiểm tra xem user có đang giữ quyền toàn gym active không
      IF EXISTS (
        SELECT 1 FROM public.gym_staff
        WHERE gym_id = p_gym_id
          AND user_id = p_staff_user_id
          AND branch_id IS NULL
          AND status = 'active'
      ) THEN
        RAISE EXCEPTION 'Conflict: User already holds active global gym role. Revoke global role before assigning to a specific branch.'
          USING ERRCODE = '23505';
      END IF;

      -- Xác minh branch thuộc gym và không bị archived
      IF NOT EXISTS (
        SELECT 1 FROM public.branches
        WHERE id = p_branch_id AND gym_id = p_gym_id AND status != 'archived'
      ) THEN
        RAISE EXCEPTION 'Branch not found or archived in specified gym' USING ERRCODE = 'P0002';
      END IF;

      -- Tạo hoặc cập nhật dòng chi nhánh active
      INSERT INTO public.gym_staff (gym_id, branch_id, user_id, role, status, activated_at)
      VALUES (p_gym_id, p_branch_id, p_staff_user_id, v_target_role, 'active', timezone('utc', now()))
      ON CONFLICT (gym_id, branch_id, user_id) WHERE branch_id IS NOT NULL AND status = 'active'
      DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = timezone('utc', now())
      RETURNING id INTO v_staff_id;
    END IF;

    v_result_status := 'active';
  ELSE
    RAISE EXCEPTION 'Validation failed: Unknown action %', p_action USING ERRCODE = '22023';
  END IF;

  RETURN jsonb_build_object(
    'gym_id', p_gym_id,
    'user_id', p_staff_user_id,
    'branch_id', p_branch_id,
    'action', p_action,
    'status', v_result_status,
    'staff_id', v_staff_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_revoke_or_update_staff(UUID, UUID, TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_revoke_or_update_staff(UUID, UUID, TEXT, UUID, TEXT) TO authenticated;

COMMIT;
