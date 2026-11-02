BEGIN;

-- =============================================================================
-- Migration: v2.0 Transactional RPCs, Seed Catalog & Auth User Synchronization
-- Migration Number: 10
-- File: 20261102010000_v2_rpcs_and_seed_catalog.sql
-- Scope:
--   1. Mở rộng constraint exercises_scope_owner_check hỗ trợ scope = 'gym'
--   2. Tạo trigger tự động đồng bộ auth.users -> public.users
--   3. Xây dựng 3 hàm RPCs nghiệp vụ v2.0:
--      - rpc_register_member_with_plan
--      - rpc_check_in_member
--      - rpc_assign_program_template
--   4. Khối Seed Data Idempotent: 12 bài tập chuẩn, 3 gói tập mẫu, 1 giáo án 3 tầng Push-Pull-Legs
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. MỞ RỘNG CONSTRAINT & DEFAULT TRÊN public.exercises
-- -----------------------------------------------------------------------------
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_scope_owner_check;
ALTER TABLE public.exercises ADD CONSTRAINT exercises_scope_owner_check
  CHECK (
    (scope = 'system' AND owner_id IS NULL)
    OR (scope = 'user' AND owner_id IS NOT NULL)
    OR (scope = 'gym' AND gym_id IS NOT NULL)
  );

ALTER TABLE public.exercises ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- -----------------------------------------------------------------------------
-- 2. TRIGGER & HÀM ĐỒNG BỘ auth.users -> public.users
-- -----------------------------------------------------------------------------
-- Đồng bộ tức thì các user đã tồn tại trong auth.users nhưng chưa có trong public.users
INSERT INTO public.users (id, display_name)
SELECT au.id, coalesce(au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1), 'Hội viên')
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- Tạo hàm trigger tự động sao chép user mới tạo từ auth.users sang public.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, display_name)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1), 'Hội viên')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user() TO authenticated, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- 3. HÀM RPC 1: rpc_register_member_with_plan (ĐĂNG KÝ HỘI VIÊN & POS TẠI QUẦY)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_register_member_with_plan(
  p_gym_id UUID,
  p_full_name TEXT,
  p_phone TEXT,
  p_branch_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_emergency_contact TEXT DEFAULT NULL,
  p_health_notes TEXT DEFAULT NULL,
  p_assigned_pt_id UUID DEFAULT NULL,
  p_plan_id UUID DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'cash',
  p_paid_amount BIGINT DEFAULT NULL,
  p_payment_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_branch_id UUID;
  v_member_id UUID;
  v_member_code TEXT;
  v_seq INT;
  v_plan RECORD;
  v_membership_id UUID := NULL;
  v_transaction_id UUID := NULL;
  v_invoice_code TEXT := NULL;
  v_processed_by_staff_id UUID := NULL;
  v_amount BIGINT := 0;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Kiểm tra xác thực
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Chưa đăng nhập (Unauthorized)';
  END IF;

  -- Kiểm tra thẩm quyền (Owner hoặc Staff active)
  IF NOT (public.is_gym_owner(p_gym_id) OR public.is_active_staff(p_gym_id)) THEN
    RAISE EXCEPTION 'Từ chối quyền truy cập: Bạn không có quyền đăng ký hội viên tại phòng gym này.';
  END IF;

  -- Kiểm tra dữ liệu bắt buộc
  IF p_full_name IS NULL OR length(trim(p_full_name)) = 0 THEN
    RAISE EXCEPTION 'Họ và tên hội viên không được để trống.';
  END IF;
  IF p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
    RAISE EXCEPTION 'Số điện thoại hội viên không được để trống.';
  END IF;

  -- Xác định chi nhánh
  IF p_branch_id IS NOT NULL THEN
    v_branch_id := p_branch_id;
  ELSE
    SELECT id INTO v_branch_id
    FROM public.branches
    WHERE gym_id = p_gym_id AND status = 'active'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- Sinh mã thẻ MEM-XXXXXX duy nhất
  LOOP
    v_seq := floor(random() * 900000 + 100000)::int;
    v_member_code := 'MEM-' || lpad(v_seq::text, 6, '0');
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.gym_members
      WHERE gym_id = p_gym_id AND member_code = v_member_code
    );
  END LOOP;

  -- Tạo hồ sơ hội viên CRM 360° (độc lập Auth)
  INSERT INTO public.gym_members (
    gym_id,
    home_branch_id,
    assigned_pt_id,
    member_code,
    full_name,
    phone,
    email,
    gender,
    date_of_birth,
    address,
    emergency_contact,
    health_notes,
    status
  ) VALUES (
    p_gym_id,
    v_branch_id,
    p_assigned_pt_id,
    v_member_code,
    trim(p_full_name),
    trim(p_phone),
    nullif(trim(p_email), ''),
    p_gender,
    p_date_of_birth,
    p_address,
    p_emergency_contact,
    p_health_notes,
    'active'
  ) RETURNING id INTO v_member_id;

  -- Nếu chọn gói tập: kích hoạt hợp đồng thẻ và ghi nhận hóa đơn thu tiền
  IF p_plan_id IS NOT NULL THEN
    SELECT * INTO v_plan
    FROM public.membership_plans
    WHERE id = p_plan_id AND gym_id = p_gym_id AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Gói tập không tồn tại hoặc đã ngừng kích hoạt.';
    END IF;

    v_start_date := CURRENT_DATE;
    v_end_date := (CURRENT_DATE + (coalesce(v_plan.duration_days, 30) * INTERVAL '1 day'))::date;

    INSERT INTO public.memberships (
      gym_id,
      branch_id,
      member_id,
      plan_id,
      status,
      start_date,
      end_date,
      remaining_sessions,
      notes
    ) VALUES (
      p_gym_id,
      v_branch_id,
      v_member_id,
      p_plan_id,
      'active',
      v_start_date,
      v_end_date,
      v_plan.session_limit,
      'Đăng ký tại quầy kèm gói ' || v_plan.name
    ) RETURNING id INTO v_membership_id;

    -- Tính tiền và sinh mã hóa đơn
    v_amount := coalesce(p_paid_amount, v_plan.price);
    v_invoice_code := 'INV-' || to_char(timezone('utc', now()), 'YYMMDD') || '-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0');

    -- Chỉ gán processed_by_staff_id nếu caller thực sự là staff active trong gym_staff
    SELECT id INTO v_processed_by_staff_id
    FROM public.gym_staff
    WHERE gym_id = p_gym_id AND user_id = v_caller_id AND status = 'active'
    LIMIT 1;

    INSERT INTO public.payment_transactions (
      gym_id,
      branch_id,
      member_id,
      membership_id,
      amount,
      payment_method,
      payment_status,
      invoice_code,
      processed_by_staff_id,
      notes
    ) VALUES (
      p_gym_id,
      v_branch_id,
      v_member_id,
      v_membership_id,
      v_amount,
      coalesce(p_payment_method, 'cash'),
      'completed',
      v_invoice_code,
      v_processed_by_staff_id,
      coalesce(p_payment_notes, 'Thanh toán tại quầy đăng ký gói ' || v_plan.name)
    ) RETURNING id INTO v_transaction_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'member_id', v_member_id,
    'member_code', v_member_code,
    'full_name', trim(p_full_name),
    'membership_id', v_membership_id,
    'transaction_id', v_transaction_id,
    'invoice_code', v_invoice_code,
    'amount', v_amount
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_register_member_with_plan FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_register_member_with_plan TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. HÀM RPC 2: rpc_check_in_member (QUẦY ĐIỂM DANH THÔNG MINH)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_check_in_member(
  p_gym_id UUID,
  p_branch_id UUID DEFAULT NULL,
  p_lookup_input TEXT DEFAULT NULL,
  p_method TEXT DEFAULT 'receptionist_manual'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_branch_id UUID;
  v_member RECORD;
  v_membership RECORD;
  v_attendance_id UUID;
  v_valid_user_id UUID := NULL;
  v_method TEXT := coalesce(p_method, 'receptionist_manual');
BEGIN
  -- Kiểm tra xác thực
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Chưa đăng nhập (Unauthorized)';
  END IF;

  -- Kiểm tra thẩm quyền
  IF NOT (public.is_gym_owner(p_gym_id) OR public.is_active_staff(p_gym_id)) THEN
    RAISE EXCEPTION 'Từ chối quyền truy cập: Bạn không có quyền điểm danh tại phòng gym này.';
  END IF;

  -- Kiểm tra dữ liệu tra cứu
  IF p_lookup_input IS NULL OR length(trim(p_lookup_input)) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'EMPTY_LOOKUP_INPUT',
      'message', 'Vui lòng nhập mã thẻ, số điện thoại hoặc ID hội viên.'
    );
  END IF;

  -- Tra cứu hồ sơ hội viên theo UUID, mã thẻ hoặc số điện thoại
  SELECT * INTO v_member
  FROM public.gym_members
  WHERE gym_id = p_gym_id
    AND (
      (p_lookup_input ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND id = p_lookup_input::uuid)
      OR upper(member_code) = upper(trim(p_lookup_input))
      OR phone = trim(p_lookup_input)
    )
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'MEMBER_NOT_FOUND',
      'message', 'Không tìm thấy hồ sơ hội viên tương ứng với "' || p_lookup_input || '".'
    );
  END IF;

  -- Kiểm tra trạng thái hồ sơ hội viên
  IF v_member.status != 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'MEMBER_INACTIVE',
      'message', 'Hồ sơ hội viên đang ở trạng thái ' || v_member.status || ', không thể điểm danh.',
      'member', jsonb_build_object('id', v_member.id, 'name', v_member.full_name, 'member_code', v_member.member_code)
    );
  END IF;

  -- Xác định chi nhánh điểm danh
  v_branch_id := coalesce(p_branch_id, v_member.home_branch_id);
  IF v_branch_id IS NULL THEN
    SELECT id INTO v_branch_id
    FROM public.branches
    WHERE gym_id = p_gym_id AND status = 'active'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_branch_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'BRANCH_NOT_FOUND',
      'message', 'Không tìm thấy chi nhánh hợp lệ để ghi nhận điểm danh.'
    );
  END IF;

  -- Tìm gói tập đang có hiệu lực tại chi nhánh
  SELECT m.*, p.name AS plan_name, p.scope AS plan_scope INTO v_membership
  FROM public.memberships m
  JOIN public.membership_plans p ON p.id = m.plan_id
  WHERE m.gym_id = p_gym_id
    AND m.member_id = v_member.id
    AND m.status = 'active'
    AND m.start_date <= CURRENT_DATE
    AND m.end_date >= CURRENT_DATE
    AND (m.remaining_sessions IS NULL OR m.remaining_sessions > 0)
    AND (p.scope = 'all_branches' OR m.branch_id IS NULL OR m.branch_id = v_branch_id)
  ORDER BY m.end_date ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'NO_ACTIVE_MEMBERSHIP',
      'message', 'Hội viên không có thẻ/gói tập hợp lệ (hoặc đã hết hạn / hết buổi tập / không áp dụng chi nhánh này).',
      'member', jsonb_build_object(
        'id', v_member.id,
        'member_code', v_member.member_code,
        'full_name', v_member.full_name,
        'phone', v_member.phone
      )
    );
  END IF;

  -- Khấu trừ buổi tập nếu gói có giới hạn số buổi
  IF v_membership.remaining_sessions IS NOT NULL THEN
    UPDATE public.memberships
    SET remaining_sessions = remaining_sessions - 1,
        status = CASE WHEN remaining_sessions - 1 <= 0 THEN 'expired' ELSE status END,
        updated_at = timezone('utc', now())
    WHERE id = v_membership.id;
  END IF;

  -- Xác minh linked_user_id có thực sự tồn tại trong public.users không
  IF v_member.linked_user_id IS NOT NULL THEN
    SELECT id INTO v_valid_user_id FROM public.users WHERE id = v_member.linked_user_id;
  END IF;

  -- Ghi nhận lịch sử vào attendance_logs
  INSERT INTO public.attendance_logs (
    gym_id,
    branch_id,
    member_id,
    user_id,
    membership_id,
    check_in_at,
    method,
    checked_in_by
  ) VALUES (
    p_gym_id,
    v_branch_id,
    v_member.id,
    v_valid_user_id,
    v_membership.id,
    timezone('utc', now()),
    v_method,
    v_caller_id
  ) RETURNING id INTO v_attendance_id;

  RETURN jsonb_build_object(
    'success', true,
    'attendance_id', v_attendance_id,
    'member', jsonb_build_object(
      'id', v_member.id,
      'member_code', v_member.member_code,
      'full_name', v_member.full_name,
      'phone', v_member.phone
    ),
    'membership', jsonb_build_object(
      'id', v_membership.id,
      'plan_name', v_membership.plan_name,
      'end_date', v_membership.end_date,
      'remaining_sessions', CASE WHEN v_membership.remaining_sessions IS NOT NULL THEN v_membership.remaining_sessions - 1 ELSE NULL END
    ),
    'check_in_at', timezone('utc', now())
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_check_in_member FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_check_in_member TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. HÀM RPC 3: rpc_assign_program_template (GÁN GIÁO ÁN MẪU CHO HỘI VIÊN)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_assign_program_template(
  p_template_id UUID,
  p_member_id UUID,
  p_staff_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_tpl RECORD;
  v_member RECORD;
  v_staff_id UUID := NULL;
  v_new_program_id UUID;
  v_new_day_id UUID;
  d RECORD;
  ex RECORD;
  v_days_count INT := 0;
  v_exercises_count INT := 0;
BEGIN
  -- Kiểm tra xác thực
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Chưa đăng nhập (Unauthorized)';
  END IF;

  -- Lấy thông tin giáo án mẫu
  SELECT * INTO v_tpl
  FROM public.workout_programs
  WHERE id = p_template_id AND is_template = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'TEMPLATE_NOT_FOUND',
      'message', 'Không tìm thấy giáo án mẫu.'
    );
  END IF;

  -- Kiểm tra thẩm quyền trên gym sở hữu template
  IF NOT (public.is_gym_owner(v_tpl.gym_id) OR public.is_active_staff(v_tpl.gym_id)) THEN
    RAISE EXCEPTION 'Từ chối quyền truy cập: Bạn không có quyền phân công giáo án tại phòng gym này.';
  END IF;

  -- Kiểm tra hội viên thuộc cùng gym
  SELECT * INTO v_member
  FROM public.gym_members
  WHERE id = p_member_id AND gym_id = v_tpl.gym_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'MEMBER_NOT_FOUND',
      'message', 'Không tìm thấy hội viên thuộc phòng gym này.'
    );
  END IF;

  -- Xác định HLV phụ trách (staff_id)
  IF p_staff_id IS NOT NULL THEN
    SELECT id INTO v_staff_id
    FROM public.gym_staff
    WHERE id = p_staff_id AND gym_id = v_tpl.gym_id AND status = 'active';
  ELSE
    SELECT id INTO v_staff_id
    FROM public.gym_staff
    WHERE user_id = v_caller_id AND gym_id = v_tpl.gym_id AND status = 'active'
    LIMIT 1;
  END IF;

  -- Tạo giáo án cá nhân hóa mới (deep clone)
  INSERT INTO public.workout_programs (
    gym_id,
    is_template,
    assigned_member_id,
    created_by_staff_id,
    title,
    description,
    duration_weeks,
    difficulty_level,
    status
  ) VALUES (
    v_tpl.gym_id,
    false,
    p_member_id,
    v_staff_id,
    v_tpl.title || ' (Gán cho ' || v_member.full_name || ')',
    v_tpl.description,
    v_tpl.duration_weeks,
    v_tpl.difficulty_level,
    'active'
  ) RETURNING id INTO v_new_program_id;

  -- Sao chép toàn bộ program_days và program_day_exercises
  FOR d IN
    SELECT * FROM public.program_days
    WHERE program_id = p_template_id
    ORDER BY day_number ASC
  LOOP
    v_days_count := v_days_count + 1;

    INSERT INTO public.program_days (
      gym_id,
      program_id,
      day_number,
      day_name,
      target_muscle_groups,
      notes
    ) VALUES (
      v_tpl.gym_id,
      v_new_program_id,
      d.day_number,
      d.day_name,
      d.target_muscle_groups,
      d.notes
    ) RETURNING id INTO v_new_day_id;

    FOR ex IN
      SELECT * FROM public.program_day_exercises
      WHERE program_day_id = d.id
      ORDER BY order_index ASC
    LOOP
      v_exercises_count := v_exercises_count + 1;

      INSERT INTO public.program_day_exercises (
        gym_id,
        program_day_id,
        exercise_id,
        order_index,
        sets,
        reps,
        rpe_target,
        rest_seconds,
        superset_group_id,
        coach_notes
      ) VALUES (
        v_tpl.gym_id,
        v_new_day_id,
        ex.exercise_id,
        ex.order_index,
        ex.sets,
        ex.reps,
        ex.rpe_target,
        ex.rest_seconds,
        ex.superset_group_id,
        ex.coach_notes
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'assigned_program_id', v_new_program_id,
    'member_id', p_member_id,
    'member_name', v_member.full_name,
    'template_id', p_template_id,
    'title', v_tpl.title,
    'days_cloned', v_days_count,
    'exercises_cloned', v_exercises_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.rpc_assign_program_template FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_assign_program_template TO authenticated;

-- -----------------------------------------------------------------------------
-- 6. KHỐI SEED DATA IDEMPOTENT (EXERCISES, PLANS & WORKOUT TEMPLATES)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_gym RECORD;
  v_tpl_id UUID;
  v_day_id UUID;
  v_ex_bench UUID;
  v_ex_incline UUID;
  v_ex_ohp UUID;
  v_ex_lat_raise UUID;
  v_ex_tricep UUID;
  v_ex_lat_pull UUID;
  v_ex_cable_row UUID;
  v_ex_curl UUID;
  v_ex_squat UUID;
  v_ex_rdl UUID;
  v_ex_leg_press UUID;
  v_ex_plank UUID;
BEGIN
  -- A. Seed 12 Bài tập Hệ thống Chuẩn (scope = 'system')
  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Bench Press' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Bench Press', 'Chest', 'Barbell', 'Intermediate', 'Nằm trên ghế phẳng, hạ tạ đòn ngang ngực dưới và đẩy dứt khoát lên trên.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Incline Dumbbell Press' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Incline Dumbbell Press', 'Chest', 'Dumbbell', 'Intermediate', 'Ghế dốc 30-45 độ, cầm tạ đơn đẩy lên ép ngực trên.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Lat Pulldown' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Lat Pulldown', 'Back', 'Cable', 'Beginner', 'Kéo thanh đòn xuống sát xương quai xanh, siết chặt cơ xô.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Seated Cable Row' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Seated Cable Row', 'Back', 'Cable', 'Beginner', 'Ngồi thẳng lưng, kéo tay nắm V-bar về phía bụng dưới, siết lưng giữa.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Barbell Back Squat' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Barbell Back Squat', 'Legs', 'Barbell', 'Advanced', 'Đặt thanh đòn trên cơ cầu vai, hạ hông xuống thấp hơn khớp gối, gồng core và đẩy đứng lên.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Romanian Deadlift' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Romanian Deadlift', 'Legs', 'Barbell', 'Intermediate', 'Giữ lưng thẳng, đẩy hông ra sau kéo căng cơ đùi sau và mông, hạ tạ qua đầu gối.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Leg Press' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Leg Press', 'Legs', 'Machine', 'Beginner', 'Đặt chân rộng bằng vai trên bàn đạp, hạ gối có kiểm soát và đạp tạ lên.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Overhead Shoulder Press' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Overhead Shoulder Press', 'Shoulders', 'Barbell', 'Intermediate', 'Đứng hoặc ngồi thẳng, đẩy thanh đòn qua đầu khóa khớp có kiểm soát.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Lateral Raise' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Lateral Raise', 'Shoulders', 'Dumbbell', 'Beginner', 'Nâng tạ đơn sang hai bên tạo thành hình chữ T, tập trung vào cơ vai giữa.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Barbell Bicep Curl' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Barbell Bicep Curl', 'Arms', 'Barbell', 'Beginner', 'Giữ cùi chỏ cố định sát thân người, cuộn thanh tạ lên siết chặt bắp tay trước.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Tricep Pushdown' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Tricep Pushdown', 'Arms', 'Cable', 'Beginner', 'Dùng dây thừng hoặc thanh V kéo ép xuống khóa khớp khuỷu, tác động cơ tay sau.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.exercises WHERE name = 'Plank' AND scope = 'system') THEN
    INSERT INTO public.exercises (id, scope, name, primary_muscle_group, equipment, difficulty, instructions)
    VALUES (gen_random_uuid(), 'system', 'Plank', 'Core', 'Bodyweight', 'Beginner', 'Chống khuỷu tay vuông góc, giữ thân người tạo thành đường thẳng, siết chặt bụng và mông.');
  END IF;

  -- Lấy ID các bài tập chuẩn
  SELECT id INTO v_ex_bench FROM public.exercises WHERE name = 'Bench Press' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_incline FROM public.exercises WHERE name = 'Incline Dumbbell Press' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_ohp FROM public.exercises WHERE name = 'Overhead Shoulder Press' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_lat_raise FROM public.exercises WHERE name = 'Lateral Raise' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_tricep FROM public.exercises WHERE name = 'Tricep Pushdown' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_lat_pull FROM public.exercises WHERE name = 'Lat Pulldown' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_cable_row FROM public.exercises WHERE name = 'Seated Cable Row' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_curl FROM public.exercises WHERE name = 'Barbell Bicep Curl' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_squat FROM public.exercises WHERE name = 'Barbell Back Squat' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_rdl FROM public.exercises WHERE name = 'Romanian Deadlift' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_leg_press FROM public.exercises WHERE name = 'Leg Press' AND scope = 'system' LIMIT 1;
  SELECT id INTO v_ex_plank FROM public.exercises WHERE name = 'Plank' AND scope = 'system' LIMIT 1;

  -- B. Seed Gói tập & Giáo án Mẫu cho tất cả Gyms hiện có trong database
  FOR v_gym IN SELECT id FROM public.gyms LOOP
    -- Gói 1: Gói Hội Viên 1 Tháng
    IF NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE gym_id = v_gym.id AND name = 'Gói Hội Viên 1 Tháng') THEN
      INSERT INTO public.membership_plans (gym_id, name, price, duration_days, plan_type, description, scope, is_active)
      VALUES (v_gym.id, 'Gói Hội Viên 1 Tháng', 500000, 30, 'fixed_period', 'Tập luyện không giới hạn trong 30 ngày tại phòng gym.', 'all_branches', true);
    END IF;

    -- Gói 2: Gói Hội Viên VIP 6 Tháng
    IF NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE gym_id = v_gym.id AND name = 'Gói Hội Viên VIP 6 Tháng') THEN
      INSERT INTO public.membership_plans (gym_id, name, price, duration_days, plan_type, description, scope, is_active)
      VALUES (v_gym.id, 'Gói Hội Viên VIP 6 Tháng', 2500000, 180, 'fixed_period', 'Gói VIP 6 tháng kèm quyền lợi toàn chi nhánh và tủ đồ riêng.', 'all_branches', true);
    END IF;

    -- Gói 3: Gói PT 1-Kèm-1 (12 Buổi)
    IF NOT EXISTS (SELECT 1 FROM public.membership_plans WHERE gym_id = v_gym.id AND name = 'Gói PT 1-Kèm-1 (12 Buổi)') THEN
      INSERT INTO public.membership_plans (gym_id, name, price, duration_days, session_limit, plan_type, description, scope, is_active)
      VALUES (v_gym.id, 'Gói PT 1-Kèm-1 (12 Buổi)', 4800000, 60, 12, 'session_pack', '12 buổi tập cá nhân hóa cùng huấn luyện viên thể hình chuyên nghiệp.', 'all_branches', true);
    END IF;

    -- Giáo án Mẫu 3 Tầng: Push - Pull - Legs (Tầng 1)
    SELECT id INTO v_tpl_id
    FROM public.workout_programs
    WHERE gym_id = v_gym.id AND title = 'Giáo án Tăng Cơ - Giảm Mỡ Toàn Thân (Push - Pull - Legs)' AND is_template = true;

    IF v_tpl_id IS NULL THEN
      INSERT INTO public.workout_programs (
        gym_id, is_template, title, description, duration_weeks, difficulty_level, status
      ) VALUES (
        v_gym.id, true, 'Giáo án Tăng Cơ - Giảm Mỡ Toàn Thân (Push - Pull - Legs)',
        'Giáo án mẫu 3 buổi/tuần chuẩn khoa học phân tách theo nhóm cơ đẩy, kéo và chân.',
        8, 'intermediate', 'active'
      ) RETURNING id INTO v_tpl_id;

      -- Tầng 2 & 3: Ngày 1 - Push Day
      INSERT INTO public.program_days (gym_id, program_id, day_number, day_name, target_muscle_groups, notes)
      VALUES (v_gym.id, v_tpl_id, 1, 'Push Day (Ngực - Vai - Tay sau)', ARRAY['Chest', 'Shoulders', 'Triceps'], 'Khởi động khớp vai kỹ trước khi đẩy tạ.')
      RETURNING id INTO v_day_id;

      IF v_ex_bench IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_bench, 1, 4, '8-10', 8.0, 90, 'Hạ tạ có kiểm soát 2 giây, đẩy bùng nổ 1 giây.');
      END IF;
      IF v_ex_incline IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_incline, 2, 3, '10-12', 7.5, 60, 'Tập trung cơ ngực trên, không khóa cùi chỏ đỉnh động tác.');
      END IF;
      IF v_ex_ohp IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_ohp, 3, 3, '8-10', 8.0, 90, 'Gồng chặt cơ bụng mông, không ưỡn lưng dưới.');
      END IF;
      IF v_ex_lat_raise IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_lat_raise, 4, 4, '12-15', 8.5, 60, 'Dùng cơ vai giữa nâng tạ, không văng người.');
      END IF;
      IF v_ex_tricep IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_tricep, 5, 3, '12-15', 8.0, 60, 'Khóa bắp tay sát sườn, siết đỉnh 1 giây.');
      END IF;

      -- Tầng 2 & 3: Ngày 2 - Pull Day
      INSERT INTO public.program_days (gym_id, program_id, day_number, day_name, target_muscle_groups, notes)
      VALUES (v_gym.id, v_tpl_id, 2, 'Pull Day (Lưng - Tay trước)', ARRAY['Back', 'Biceps'], 'Tập trung cảm nhận cơ lưng xô (Mind-Muscle Connection).')
      RETURNING id INTO v_day_id;

      IF v_ex_lat_pull IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_lat_pull, 1, 4, '10-12', 8.0, 75, 'Kéo thanh đòn bằng cùi chỏ, mở ngực.');
      END IF;
      IF v_ex_cable_row IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_cable_row, 2, 4, '10-12', 8.0, 60, 'Siết chặt hai bả vai vào nhau ở cuối hành trình.');
      END IF;
      IF v_ex_curl IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_curl, 3, 3, '12-15', 8.5, 60, 'Hạ tạ chậm 3 giây, không đung đưa thân trên.');
      END IF;

      -- Tầng 2 & 3: Ngày 3 - Legs Day
      INSERT INTO public.program_days (gym_id, program_id, day_number, day_name, target_muscle_groups, notes)
      VALUES (v_gym.id, v_tpl_id, 3, 'Legs Day (Chân - Bụng)', ARRAY['Legs', 'Core'], 'Nghỉ ngơi và bổ sung nước đầy đủ giữa các hiệp nặng.')
      RETURNING id INTO v_day_id;

      IF v_ex_squat IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_squat, 1, 4, '6-8', 8.5, 120, 'Squat sâu chuẩn form, mở gối theo hướng mũi chân.');
      END IF;
      IF v_ex_rdl IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_rdl, 2, 3, '8-10', 8.0, 90, 'Cảm nhận căng cơ đùi sau tối đa, giữ thẳng cột sống.');
      END IF;
      IF v_ex_leg_press IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_leg_press, 3, 3, '12-15', 8.0, 60, 'Không khóa khớp gối ở vị trí cao nhất.');
      END IF;
      IF v_ex_plank IS NOT NULL THEN
        INSERT INTO public.program_day_exercises (gym_id, program_day_id, exercise_id, order_index, sets, reps, rpe_target, rest_seconds, coach_notes)
        VALUES (v_gym.id, v_day_id, v_ex_plank, 4, 3, '45-60s', 8.0, 45, 'Giữ thân thẳng, thở đều không nín thở.');
      END IF;
    END IF;
  END LOOP;
END $$;

COMMIT;

