-- =============================================================================
-- Migration: 20261102020000_v2_staff_profile_nullable_user_id.sql
-- Description: Cho phép tạo hồ sơ nhân sự (PT / Lễ tân / Quản lý) không bắt buộc
--              phải có user_id auth từ trước (user_id DROP NOT NULL), cập nhật
--              partial unique indexes, bổ sung RLS DELETE policy và seed dữ liệu PT mẫu.
-- =============================================================================

BEGIN;

-- 1. Gỡ bỏ ràng buộc NOT NULL trên cột user_id
ALTER TABLE public.gym_staff
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Cập nhật lại Partial Unique Indexes (bổ sung điều kiện user_id IS NOT NULL)
DROP INDEX IF EXISTS public.gym_staff_gym_user_null_branch_idx;
CREATE UNIQUE INDEX IF NOT EXISTS gym_staff_gym_user_null_branch_idx
  ON public.gym_staff (gym_id, user_id)
  WHERE branch_id IS NULL AND status = 'active' AND user_id IS NOT NULL;

DROP INDEX IF EXISTS public.gym_staff_gym_branch_user_idx;
CREATE UNIQUE INDEX IF NOT EXISTS gym_staff_gym_branch_user_idx
  ON public.gym_staff (gym_id, branch_id, user_id)
  WHERE branch_id IS NOT NULL AND status = 'active' AND user_id IS NOT NULL;

-- 3. Bổ sung Index hỗ trợ tìm kiếm nhanh nhân sự theo gym, role và status
CREATE INDEX IF NOT EXISTS gym_staff_gym_role_status_idx
  ON public.gym_staff (gym_id, role, status);

CREATE INDEX IF NOT EXISTS gym_staff_phone_idx
  ON public.gym_staff (gym_id, phone)
  WHERE phone IS NOT NULL;

-- 4. Bổ sung quyền và chính sách DELETE cho Gym Owner
GRANT DELETE ON TABLE public.gym_staff TO authenticated;

DROP POLICY IF EXISTS gym_staff_delete_policy ON public.gym_staff;
CREATE POLICY gym_staff_delete_policy ON public.gym_staff
FOR DELETE TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND public.is_gym_owner(gym_id)
);

-- 5. Seed Data nhân sự mẫu (Huấn luyện viên PT & Lễ tân) cho tất cả Gyms hiện có
DO $$
DECLARE
  v_gym RECORD;
  v_branch_id UUID;
BEGIN
  FOR v_gym IN SELECT id FROM public.gyms LOOP
    -- Lấy chi nhánh đầu tiên của gym (nếu có) để gán mẫu
    SELECT id INTO v_branch_id
    FROM public.branches
    WHERE gym_id = v_gym.id
    ORDER BY created_at ASC
    LIMIT 1;

    -- PT 1: Nguyễn Minh Quân
    IF NOT EXISTS (
      SELECT 1 FROM public.gym_staff
      WHERE gym_id = v_gym.id AND full_name = 'Nguyễn Minh Quân'
    ) THEN
      INSERT INTO public.gym_staff (
        gym_id,
        branch_id,
        user_id,
        role,
        status,
        full_name,
        phone,
        email,
        specialty,
        bio,
        activated_at
      ) VALUES (
        v_gym.id,
        v_branch_id,
        NULL,
        'trainer',
        'active',
        'Nguyễn Minh Quân',
        '0901234567',
        'quan.pt@gym.vn',
        'Tăng cơ & Phục hồi chấn thương (Hypertrophy & Rehab)',
        '5 năm kinh nghiệm huấn luyện thể hình và phục hồi vận động chuyên sâu, chứng chỉ NASM-CPT.',
        timezone('utc', now())
      );
    END IF;

    -- PT 2: Lê Thảo Vy
    IF NOT EXISTS (
      SELECT 1 FROM public.gym_staff
      WHERE gym_id = v_gym.id AND full_name = 'Lê Thảo Vy'
    ) THEN
      INSERT INTO public.gym_staff (
        gym_id,
        branch_id,
        user_id,
        role,
        status,
        full_name,
        phone,
        email,
        specialty,
        bio,
        activated_at
      ) VALUES (
        v_gym.id,
        v_branch_id,
        NULL,
        'trainer',
        'active',
        'Lê Thảo Vy',
        '0902345678',
        'vy.pt@gym.vn',
        'Giảm mỡ nữ & Định hình vóc dáng (Body Transformation)',
        'Chuyên gia định hình vóc dáng nữ, tư vấn chế độ dinh dưỡng lành mạnh và cải thiện tư thế thể thao.',
        timezone('utc', now())
      );
    END IF;

    -- Lễ tân: Trần Hoàng Yến
    IF NOT EXISTS (
      SELECT 1 FROM public.gym_staff
      WHERE gym_id = v_gym.id AND full_name = 'Trần Hoàng Yến'
    ) THEN
      INSERT INTO public.gym_staff (
        gym_id,
        branch_id,
        user_id,
        role,
        status,
        full_name,
        phone,
        email,
        specialty,
        bio,
        activated_at
      ) VALUES (
        v_gym.id,
        v_branch_id,
        NULL,
        'receptionist',
        'active',
        'Trần Hoàng Yến',
        '0903456789',
        'yen.le-tan@gym.vn',
        'CSKH & Thu ngân POS',
        'Tiếp đón hội viên nồng hậu, điều phối quầy tiếp tân, điểm danh và hỗ trợ thủ tục hợp đồng thẻ tập.',
        timezone('utc', now())
      );
    END IF;
  END LOOP;
END $$;

COMMIT;

