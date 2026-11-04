BEGIN;

-- =============================================================================
-- Migration: Fix gym_staff RLS Infinite Recursion & Rebrand Default Gym to GymOS
-- Migration Number: 12
-- File: 20261103000000_fix_gym_staff_rls_recursion_and_brand.sql
-- Scope:
--   1. Xóa bỏ và tạo lại gym_staff_select_policy triệt tiêu đệ quy RLS
--   2. Cập nhật tên phòng gym mặc định sang 'GymOS'
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. FIX RLS RECURSION TRÊN public.gym_staff
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS gym_staff_select_policy ON public.gym_staff;

CREATE POLICY gym_staff_select_policy ON public.gym_staff
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id)
  );

-- -----------------------------------------------------------------------------
-- 2. ĐỒNG BỘ THƯƠNG HIỆU PHÒNG TẬP MẶC ĐỊNH SANG 'GymOS' & SLUG 'gymos'
-- -----------------------------------------------------------------------------
UPDATE public.gyms
SET name = 'GymOS', slug = 'gymos', updated_at = timezone('utc', now())
WHERE name ILIKE '%Hưng Vượng%' OR name ILIKE '%Gym Tracker%' OR slug = 'gym-tracker-hung-vuong';

COMMIT;

