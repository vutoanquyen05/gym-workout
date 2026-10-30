BEGIN;

-- =============================================================================
-- Migration: GM-2 Admin Member Policies & Users Schema Drift Alignment
-- Scope:
--   1. Thêm cột phone, address vào public.users phục vụ hồ sơ hội viên Admin Web
--   2. Cấp quyền & RLS Policies (INSERT, UPDATE) trên public.memberships
--   3. Cấp quyền & RLS Policies (INSERT, UPDATE) trên public.membership_plans
--   4. Thay thế users_update_policy chặt chẽ, loại bỏ hoàn toàn nguy cơ USING (true)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Cập nhật bảng public.users: Bổ sung thông tin liên hệ cho Hội viên
-- -----------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Cấp quyền UPDATE tối thiểu cho authenticated trên public.users
GRANT UPDATE ON TABLE public.users TO authenticated;

-- Policy an toàn: Chỉ cho phép tự cập nhật hồ sơ cá nhân HOẶC quản trị viên (Owner/Active Staff) của Gym cập nhật
DROP POLICY IF EXISTS users_update_policy ON public.users;
CREATE POLICY users_update_policy ON public.users
FOR UPDATE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.gyms g
      WHERE public.is_gym_owner(g.id) OR public.is_active_staff(g.id)
    )
  )
)
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.gyms g
      WHERE public.is_gym_owner(g.id) OR public.is_active_staff(g.id)
    )
  )
);

-- -----------------------------------------------------------------------------
-- 2. Cập nhật bảng public.memberships: Quyền tạo và cập nhật Thẻ hội viên
-- -----------------------------------------------------------------------------
GRANT INSERT, UPDATE ON TABLE public.memberships TO authenticated;

DROP POLICY IF EXISTS memberships_insert_policy ON public.memberships;
CREATE POLICY memberships_insert_policy ON public.memberships
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

DROP POLICY IF EXISTS memberships_update_policy ON public.memberships;
CREATE POLICY memberships_update_policy ON public.memberships
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

-- -----------------------------------------------------------------------------
-- 3. Cập nhật bảng public.membership_plans: Quyền cấu hình Gói tập Gym
-- -----------------------------------------------------------------------------
GRANT INSERT, UPDATE ON TABLE public.membership_plans TO authenticated;

DROP POLICY IF EXISTS membership_plans_insert_policy ON public.membership_plans;
CREATE POLICY membership_plans_insert_policy ON public.membership_plans
FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  )
);

DROP POLICY IF EXISTS membership_plans_update_policy ON public.membership_plans;
CREATE POLICY membership_plans_update_policy ON public.membership_plans
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

COMMIT;

