'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export interface MemberBranchOption {
  id: string;
  name: string;
}

export interface MemberPlanOption {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  session_limit?: number | null;
  plan_type: string;
}

export interface MemberTrainerOption {
  id: string;
  full_name: string;
  specialty?: string | null;
  branch_name?: string | null;
}

export interface MemberWithDetails {
  id: string;
  gym_id: string;
  home_branch_id?: string | null;
  assigned_pt_id?: string | null;
  member_code: string;
  full_name: string;
  phone: string;
  email?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  health_notes?: string | null;
  emergency_contact?: string | null;
  status: 'active' | 'suspended' | 'expired' | string;
  created_at: string;
  home_branch?: { id: string; name: string } | null;
  assigned_pt?: { id: string; full_name: string } | null;
  active_membership?: {
    id: string;
    status: string;
    start_date: string;
    end_date: string;
    remaining_sessions?: number | null;
    plan_name?: string;
  } | null;
}

/**
 * Helper xác định gym_id của người dùng hiện tại
 */
async function getCurrentGymId(supabase: any, userId: string): Promise<string | null> {
  try {
    // 1. Kiểm tra chủ phòng gym
    const { data: ownerGyms } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);

    if (ownerGyms && ownerGyms.length > 0) {
      return ownerGyms[0].id;
    }

    // 2. Kiểm tra nhân sự
    const { data: staffGyms } = await supabase
      .from('gym_staff')
      .select('gym_id')
      .eq('user_id', userId)
      .limit(1);

    if (staffGyms && staffGyms.length > 0) {
      return staffGyms[0].gym_id;
    }

    // 3. Fallback tìm gym khả dụng
    const { data: anyGym } = await supabase.from('gyms').select('id').limit(1);
    if (anyGym && anyGym.length > 0) {
      return anyGym[0].id;
    }
  } catch (err) {
    console.warn('[GET CURRENT GYM ID WARN]:', err);
  }

  return null;
}

/**
 * Sinh ngẫu nhiên Mã hội viên định dạng MEM-XXXXXX (6 chữ số)
 */
function generateMemberCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `MEM-${num}`;
}

/**
 * Server Action: Lấy danh sách hội viên CRM 360°
 * Tách độc lập truy vấn gym_members, memberships và gym_staff để triệt tiêu lỗi PostgREST RLS
 */
export async function getMembers(): Promise<{ data: MemberWithDetails[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: [], error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' };
    }

    const gymId = await getCurrentGymId(supabase, user.id);
    if (!gymId) {
      return { data: [], error: 'Không tìm thấy cơ sở phòng tập của tài khoản này.' };
    }

    // 1. Truy vấn độc lập danh sách gym_members kèm chi nhánh
    const { data: membersRaw, error: membersError } = await supabase
      .from('gym_members')
      .select(`
        id,
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
        health_notes,
        emergency_contact,
        status,
        created_at,
        home_branch:branches (
          id,
          name
        )
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (membersError) {
      console.warn('[GET MEMBERS WARN]:', membersError.message);
      return { data: [], error: `Thông báo cơ sở dữ liệu: ${membersError.message}` };
    }

    if (!membersRaw || membersRaw.length === 0) {
      return { data: [], error: null };
    }

    const memberIds = membersRaw.map((m: any) => m.id);
    const assignedPtIds = Array.from(
      new Set(membersRaw.map((m: any) => m.assigned_pt_id).filter(Boolean))
    );

    // 2. Chạy độc lập truy vấn memberships và gym_staff (bảo đảm an toàn kể cả khi 1 bảng lỗi)
    const [membershipsRes, staffRes] = await Promise.allSettled([
      supabase
        .from('memberships')
        .select(`
          id,
          member_id,
          status,
          start_date,
          end_date,
          remaining_sessions,
          plan:membership_plans (
            id,
            name,
            plan_type,
            price
          )
        `)
        .in('member_id', memberIds),
      assignedPtIds.length > 0
        ? supabase
            .from('gym_staff')
            .select('id, full_name')
            .in('id', assignedPtIds)
        : Promise.resolve({ data: [] }),
    ]);

    // Map memberships theo member_id
    const membershipsByMember = new Map<string, any[]>();
    if (membershipsRes.status === 'fulfilled' && membershipsRes.value.data) {
      for (const mem of membershipsRes.value.data) {
        if (!mem.member_id) continue;
        const list = membershipsByMember.get(mem.member_id) || [];
        list.push(mem);
        membershipsByMember.set(mem.member_id, list);
      }
    }

    // Map PT theo staff id
    const staffMap = new Map<string, { id: string; full_name: string }>();
    if (staffRes.status === 'fulfilled' && staffRes.value.data) {
      for (const s of staffRes.value.data) {
        if (s.id) {
          staffMap.set(s.id, { id: s.id, full_name: s.full_name });
        }
      }
    }

    // 3. Ghép nối dữ liệu trong bộ nhớ TypeScript
    const members: MemberWithDetails[] = membersRaw.map((m: any) => {
      const allMemberships = membershipsByMember.get(m.id) || [];
      const activeMem = allMemberships.find((mem: any) => mem.status === 'active') || allMemberships[0];

      let activeMembershipObj = null;
      if (activeMem) {
        const planData = Array.isArray(activeMem.plan) ? activeMem.plan[0] : activeMem.plan;
        activeMembershipObj = {
          id: activeMem.id,
          status: activeMem.status,
          start_date: activeMem.start_date,
          end_date: activeMem.end_date,
          remaining_sessions: activeMem.remaining_sessions,
          plan_name: planData?.name || 'Gói tiêu chuẩn',
        };
      }

      const homeBranch = Array.isArray(m.home_branch) ? m.home_branch[0] : m.home_branch;
      const assignedPt = m.assigned_pt_id ? staffMap.get(m.assigned_pt_id) || null : null;

      return {
        id: m.id,
        gym_id: m.gym_id,
        home_branch_id: m.home_branch_id,
        assigned_pt_id: m.assigned_pt_id,
        member_code: m.member_code || `MEM-${m.id.slice(0, 6).toUpperCase()}`,
        full_name: m.full_name || 'Hội viên mới',
        phone: m.phone || '',
        email: m.email || null,
        gender: m.gender || null,
        date_of_birth: m.date_of_birth || null,
        address: m.address || null,
        health_notes: m.health_notes || null,
        emergency_contact: m.emergency_contact || null,
        status: m.status || 'active',
        created_at: m.created_at,
        home_branch: homeBranch ? { id: homeBranch.id, name: homeBranch.name } : null,
        assigned_pt: assignedPt,
        active_membership: activeMembershipObj,
      };
    });

    return { data: members, error: null };
  } catch (error: any) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof (error as { digest?: unknown }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('DYNAMIC_SERVER_USAGE')
    ) {
      throw error;
    }
    console.warn('[GET MEMBERS EXCEPTION]:', error?.message || error);
    return { data: [], error: 'Không thể kết nối đến cơ sở dữ liệu hội viên' };
  }
}

/**
 * Server Action: Lấy các tùy chọn cho Form đăng ký (Gói tập, Chi nhánh, Huấn luyện viên PT)
 */
export async function getMemberRegistrationOptions(): Promise<{
  data: {
    plans: MemberPlanOption[];
    branches: MemberBranchOption[];
    trainers: MemberTrainerOption[];
  };
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: { plans: [], branches: [], trainers: [] }, error: 'Phiên đăng nhập đã hết hạn.' };
    }

    const gymId = await getCurrentGymId(supabase, user.id);
    if (!gymId) {
      return { data: { plans: [], branches: [], trainers: [] }, error: 'Không tìm thấy phòng tập.' };
    }

    // Truy vấn độc lập 3 danh mục với Promise.allSettled
    const [plansRes, branchesRes, trainersRes] = await Promise.allSettled([
      supabase
        .from('membership_plans')
        .select('id, name, price, duration_days, session_limit, plan_type')
        .eq('gym_id', gymId)
        .eq('is_active', true)
        .order('price', { ascending: true }),
      supabase
        .from('branches')
        .select('id, name')
        .eq('gym_id', gymId)
        .eq('status', 'active')
        .order('name', { ascending: true }),
      supabase
        .from('gym_staff')
        .select(`
          id,
          full_name,
          specialty,
          branch:branches (name)
        `)
        .eq('gym_id', gymId)
        .eq('role', 'trainer')
        .eq('status', 'active')
        .order('full_name', { ascending: true }),
    ]);

    const plans: MemberPlanOption[] =
      plansRes.status === 'fulfilled' && plansRes.value.data
        ? plansRes.value.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price || 0),
            duration_days: p.duration_days || 30,
            session_limit: p.session_limit || null,
            plan_type: p.plan_type || 'fixed_period',
          }))
        : [];

    const branches: MemberBranchOption[] =
      branchesRes.status === 'fulfilled' && branchesRes.value.data
        ? branchesRes.value.data.map((b: any) => ({
            id: b.id,
            name: b.name,
          }))
        : [];

    const trainers: MemberTrainerOption[] =
      trainersRes.status === 'fulfilled' && trainersRes.value.data
        ? trainersRes.value.data.map((t: any) => {
            const branchObj = Array.isArray(t.branch) ? t.branch[0] : t.branch;
            return {
              id: t.id,
              full_name: t.full_name,
              specialty: t.specialty || null,
              branch_name: branchObj?.name || null,
            };
          })
        : [];

    return { data: { plans, branches, trainers }, error: null };
  } catch (err: any) {
    console.warn('[REGISTRATION OPTIONS WARN]:', err?.message || err);
    return {
      data: { plans: [], branches: [], trainers: [] },
      error: 'Thông báo danh mục đăng ký tạm thời không khả dụng',
    };
  }
}

/**
 * Server Action: Đăng ký hội viên CRM 360° và bán thẻ POS tại quầy
 * Không yêu cầu UUID hay Auth UID người dùng
 */
export async function registerNewMember(
  formData: FormData
): Promise<{ success?: boolean; memberId?: string; memberCode?: string; error?: string }> {
  try {
    const fullName = formData.get('fullName')?.toString().trim();
    const phone = formData.get('phone')?.toString().trim();
    const email = formData.get('email')?.toString().trim() || null;
    const gender = formData.get('gender')?.toString().trim() || null;
    const dateOfBirth = formData.get('dateOfBirth')?.toString().trim() || null;
    const address = formData.get('address')?.toString().trim() || null;
    const healthNotes = formData.get('healthNotes')?.toString().trim() || null;
    const emergencyContact = formData.get('emergencyContact')?.toString().trim() || null;

    const planId = formData.get('planId')?.toString().trim() || null;
    const branchId = formData.get('branchId')?.toString().trim() || null;
    const assignedPtId = formData.get('assignedPtId')?.toString().trim() || null;
    const paymentMethod = formData.get('paymentMethod')?.toString().trim() || 'cash';
    const rawPaidAmount = formData.get('paidAmount')?.toString().trim();
    const paymentNotes = formData.get('paymentNotes')?.toString().trim() || null;

    // Xác thực bắt buộc
    if (!fullName) {
      return { error: 'Vui lòng nhập họ và tên hội viên.' };
    }
    if (!phone) {
      return { error: 'Vui lòng nhập số điện thoại liên hệ của hội viên.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
    }

    const gymId = await getCurrentGymId(supabase, user.id);
    if (!gymId) {
      return { error: 'Không tìm thấy phòng tập liên kết với tài khoản này.' };
    }

    const paidAmount = rawPaidAmount ? parseInt(rawPaidAmount, 10) : null;

    // 1. Thử gọi RPC rpc_register_member_with_plan
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_register_member_with_plan', {
        p_gym_id: gymId,
        p_full_name: fullName,
        p_phone: phone,
        p_branch_id: branchId || null,
        p_email: email,
        p_gender: gender,
        p_date_of_birth: dateOfBirth,
        p_address: address,
        p_emergency_contact: emergencyContact,
        p_health_notes: healthNotes,
        p_assigned_pt_id: assignedPtId || null,
        p_plan_id: planId || null,
        p_payment_method: paymentMethod,
        p_paid_amount: paidAmount,
        p_payment_notes: paymentNotes,
      });

      if (!rpcError && rpcResult && (rpcResult.success || rpcResult.member_id)) {
        try {
          revalidatePath('/dashboard/members');
          revalidatePath('/dashboard');
        } catch {}
        return {
          success: true,
          memberId: rpcResult.member_id,
          memberCode: rpcResult.member_code,
        };
      }

      if (rpcError) {
        console.warn('[RPC REGISTER MEMBER FAILED, FALLBACK TO DIRECT INSERT]:', rpcError.message);
      }
    } catch (rpcCallEx) {
      console.warn('[RPC CALL EXCEPTION, FALLBACK]:', rpcCallEx);
    }

    // 2. Fallback thực hiện Direct Insert
    const memberCode = generateMemberCode();

    // Insert gym_members
    const { data: newMember, error: memberInsertError } = await supabase
      .from('gym_members')
      .insert({
        gym_id: gymId,
        home_branch_id: branchId || null,
        assigned_pt_id: assignedPtId || null,
        member_code: memberCode,
        full_name: fullName,
        phone,
        email,
        gender,
        date_of_birth: dateOfBirth,
        address,
        health_notes: healthNotes,
        emergency_contact: emergencyContact,
        status: 'active',
      })
      .select('id, member_code')
      .single();

    if (memberInsertError || !newMember) {
      console.warn('[DIRECT INSERT MEMBER WARN]:', memberInsertError?.message);
      return {
        error: `Không thể đăng ký hồ sơ hội viên: ${memberInsertError?.message || 'Lỗi không xác định'}`,
      };
    }

    // Nếu có chọn gói tập: Tạo hợp đồng thẻ memberships và hóa đơn thanh toán
    if (planId) {
      const { data: plan } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('id', planId)
        .single();

      const durationDays = plan?.duration_days || 30;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const { data: newMembership } = await supabase
        .from('memberships')
        .insert({
          gym_id: gymId,
          branch_id: branchId || null,
          member_id: newMember.id,
          plan_id: planId,
          status: 'active',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          remaining_sessions: plan?.session_limit || null,
          notes: `Đăng ký tại quầy kèm gói ${plan?.name || ''}`,
        })
        .select('id')
        .single();

      // Ghi nhận thanh toán
      const finalAmount = paidAmount !== null && !isNaN(paidAmount) ? paidAmount : (plan?.price || 0);
      const invoiceCode = `INV-${Date.now().toString().slice(-8)}`;

      await supabase.from('payment_transactions').insert({
        gym_id: gymId,
        branch_id: branchId || null,
        member_id: newMember.id,
        membership_id: newMembership?.id || null,
        amount: finalAmount,
        payment_method: paymentMethod,
        payment_status: 'completed',
        invoice_code: invoiceCode,
        notes: paymentNotes || `Thanh toán tại quầy đăng ký gói ${plan?.name || ''}`,
      });
    }

    try {
      revalidatePath('/dashboard/members');
      revalidatePath('/dashboard');
    } catch {}

    return {
      success: true,
      memberId: newMember.id,
      memberCode: newMember.member_code,
    };
  } catch (error: any) {
    console.warn('[REGISTER MEMBER EXCEPTION]:', error?.message || error);
    return {
      error: error instanceof Error ? error.message : 'Lỗi hệ thống khi đăng ký hội viên',
    };
  }
}

/**
 * Server Action: Cập nhật trạng thái hội viên (active <-> suspended)
 */
export async function updateMemberStatus(
  memberId: string,
  newStatus: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('gym_members')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', memberId);

    if (error) {
      return { error: error.message };
    }

    try {
      revalidatePath('/dashboard/members');
      revalidatePath('/dashboard');
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { error: err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái' };
  }
}

// ============================================================================
// PHÂN HỆ HỒ SƠ HỘI VIÊN 360° (MEMBER 360° PROFILE - TASK P03-T03)
// ============================================================================

export interface MembershipWithPlan {
  id: string;
  gym_id: string;
  member_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  remaining_sessions?: number | null;
  notes?: string | null;
  created_at: string;
  plan?: {
    id: string;
    name: string;
    price: number;
    plan_type: string;
    duration_days: number;
    session_limit?: number | null;
  } | null;
}

export interface PaymentTransaction {
  id: string;
  gym_id: string;
  branch_id?: string | null;
  member_id: string;
  membership_id?: string | null;
  invoice_code: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  notes?: string | null;
  paid_at: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  gym_id: string;
  branch_id: string;
  member_id: string;
  check_in_at: string;
  check_out_at?: string | null;
  method: string;
  branch?: { name: string } | null;
}

export interface BodyMeasurement {
  id: string;
  gym_id: string;
  member_id: string;
  measured_at: string;
  weight_kg: number;
  height_cm?: number | null;
  body_fat_pct?: number | null;
  skeletal_muscle_kg?: number | null;
  waist_cm?: number | null;
  chest_cm?: number | null;
  hip_cm?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface WorkoutProgramAssigned {
  id: string;
  gym_id: string;
  title: string;
  description?: string | null;
  goal: string;
  difficulty: string;
  duration_weeks: number;
  days_per_week: number;
  schedule_mode: string;
  is_active: boolean;
  created_at: string;
}

export interface Member360Profile {
  member: MemberWithDetails;
  memberships: MembershipWithPlan[];
  transactions: PaymentTransaction[];
  attendanceLogs: AttendanceRecord[];
  bodyMeasurements: BodyMeasurement[];
  workoutPrograms: WorkoutProgramAssigned[];
  branches: MemberBranchOption[];
  plans: MemberPlanOption[];
  trainers: MemberTrainerOption[];
}

/**
 * Server Action: Lấy toàn bộ hồ sơ 360° của hội viên
 */
export async function getMember360Profile(
  memberId: string
): Promise<{ data: Member360Profile | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // 1. Lấy thông tin cơ bản của hội viên
    const { data: memberData, error: memberError } = await supabase
      .from('gym_members')
      .select(`
        id,
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
        health_notes,
        emergency_contact,
        status,
        created_at,
        home_branch:branches (
          id,
          name
        ),
        assigned_pt:gym_staff (
          id,
          full_name
        )
      `)
      .eq('id', memberId)
      .single();

    if (memberError || !memberData) {
      return { data: null, error: memberError?.message || 'Không tìm thấy hồ sơ hội viên.' };
    }

    const member: MemberWithDetails = {
      ...memberData,
      home_branch: Array.isArray(memberData.home_branch) ? memberData.home_branch[0] : memberData.home_branch,
      assigned_pt: Array.isArray(memberData.assigned_pt) ? memberData.assigned_pt[0] : memberData.assigned_pt,
    };

    // 2. Chạy đồng thời các truy vấn liên kết bằng Promise.allSettled
    const [
      membershipsRes,
      transactionsRes,
      attendanceRes,
      measurementsRes,
      programsRes,
      branchesRes,
      plansRes,
      staffRes,
    ] = await Promise.allSettled([
      supabase
        .from('memberships')
        .select(`
          id,
          gym_id,
          member_id,
          plan_id,
          status,
          start_date,
          end_date,
          remaining_sessions,
          notes,
          created_at,
          plan:membership_plans (
            id,
            name,
            price,
            plan_type,
            duration_days,
            session_limit
          )
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false }),

      supabase
        .from('payment_transactions')
        .select('id, gym_id, branch_id, member_id, membership_id, invoice_code, amount, payment_method, payment_status, notes, paid_at, created_at')
        .eq('member_id', memberId)
        .order('paid_at', { ascending: false }),

      supabase
        .from('attendance_logs')
        .select(`
          id,
          gym_id,
          branch_id,
          member_id,
          check_in_at,
          check_out_at,
          method,
          branch:branches (
            name
          )
        `)
        .eq('member_id', memberId)
        .order('check_in_at', { ascending: false })
        .limit(50),

      supabase
        .from('body_measurements')
        .select('id, gym_id, member_id, measured_at, weight_kg, height_cm, body_fat_pct, skeletal_muscle_kg, waist_cm, chest_cm, hip_cm, notes, created_at')
        .eq('member_id', memberId)
        .order('measured_at', { ascending: false }),

      supabase
        .from('workout_programs')
        .select('id, gym_id, title, description, goal, difficulty, duration_weeks, days_per_week, schedule_mode, is_active, created_at')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false }),

      supabase
        .from('branches')
        .select('id, name')
        .eq('status', 'active')
        .order('name'),

      supabase
        .from('membership_plans')
        .select('id, name, price, duration_days, session_limit, plan_type')
        .eq('is_active', true)
        .order('price'),

      supabase
        .from('gym_staff')
        .select('id, full_name, specialty, role, status')
        .eq('status', 'active'),
    ]);

    const membershipsRaw = membershipsRes.status === 'fulfilled' && !membershipsRes.value.error ? membershipsRes.value.data || [] : [];
    const memberships: MembershipWithPlan[] = membershipsRaw.map((m: any) => ({
      ...m,
      plan: Array.isArray(m.plan) ? m.plan[0] : m.plan,
    }));

    // Cập nhật active_membership cho member
    const activeMem = memberships.find((m) => m.status === 'active');
    if (activeMem) {
      member.active_membership = {
        id: activeMem.id,
        status: activeMem.status,
        start_date: activeMem.start_date,
        end_date: activeMem.end_date,
        remaining_sessions: activeMem.remaining_sessions,
        plan_name: activeMem.plan?.name,
      };
    }

    const transactions = transactionsRes.status === 'fulfilled' && !transactionsRes.value.error ? transactionsRes.value.data || [] : [];
    const attendanceLogsRaw = attendanceRes.status === 'fulfilled' && !attendanceRes.value.error ? attendanceRes.value.data || [] : [];
    const attendanceLogs: AttendanceRecord[] = attendanceLogsRaw.map((a: any) => ({
      ...a,
      branch: Array.isArray(a.branch) ? a.branch[0] : a.branch,
    }));

    const bodyMeasurements = measurementsRes.status === 'fulfilled' && !measurementsRes.value.error ? measurementsRes.value.data || [] : [];
    const workoutPrograms = programsRes.status === 'fulfilled' && !programsRes.value.error ? programsRes.value.data || [] : [];
    const branches = branchesRes.status === 'fulfilled' && !branchesRes.value.error ? branchesRes.value.data || [] : [];
    const plans = plansRes.status === 'fulfilled' && !plansRes.value.error ? plansRes.value.data || [] : [];
    const staffList = staffRes.status === 'fulfilled' && !staffRes.value.error ? staffRes.value.data || [] : [];
    const trainers = staffList
      .filter((s: any) => s.role === 'trainer')
      .map((t: any) => ({
        id: t.id,
        full_name: t.full_name,
        specialty: t.specialty,
      }));

    return {
      data: {
        member,
        memberships,
        transactions,
        attendanceLogs,
        bodyMeasurements,
        workoutPrograms,
        branches,
        plans,
        trainers,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err instanceof Error ? err.message : 'Lỗi tải hồ sơ hội viên 360°' };
  }
}

/**
 * Server Action: Cập nhật thông tin cá nhân và PT phụ trách của hội viên
 */
export async function updateMemberProfile(
  memberId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const fullName = (formData.get('full_name') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const email = (formData.get('email') as string)?.trim() || null;
    const gender = (formData.get('gender') as string)?.trim() || null;
    const dateOfBirth = (formData.get('date_of_birth') as string)?.trim() || null;
    const address = (formData.get('address') as string)?.trim() || null;
    const emergencyContact = (formData.get('emergency_contact') as string)?.trim() || null;
    const healthNotes = (formData.get('health_notes') as string)?.trim() || null;
    const homeBranchId = (formData.get('home_branch_id') as string)?.trim() || null;
    const assignedPtId = (formData.get('assigned_pt_id') as string)?.trim() || null;

    if (!fullName) {
      return { error: 'Họ và tên không được để trống.' };
    }
    if (!phone) {
      return { error: 'Số điện thoại không được để trống.' };
    }

    const { error } = await supabase
      .from('gym_members')
      .update({
        full_name: fullName,
        phone,
        email,
        gender,
        date_of_birth: dateOfBirth,
        address,
        emergency_contact: emergencyContact,
        health_notes: healthNotes,
        home_branch_id: homeBranchId || null,
        assigned_pt_id: assignedPtId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (error) {
      return { error: error.message };
    }

    try {
      revalidatePath('/dashboard/members');
      revalidatePath(`/dashboard/members/${memberId}`);
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { error: err instanceof Error ? err.message : 'Lỗi cập nhật hồ sơ hội viên' };
  }
}

/**
 * Server Action: Gia hạn hoặc đăng ký thêm thẻ tập mới tại quầy
 */
export async function renewOrAddMembership(
  memberId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const planId = formData.get('plan_id') as string;
    const startDateStr = (formData.get('start_date') as string) || new Date().toISOString().split('T')[0];
    const paymentMethod = (formData.get('payment_method') as string) || 'cash';
    const customAmountStr = formData.get('custom_amount') as string;
    const notes = (formData.get('notes') as string)?.trim() || null;

    if (!planId) {
      return { error: 'Vui lòng chọn gói tập để kích hoạt.' };
    }

    // 1. Lấy thông tin hội viên & gói tập
    const [memberRes, planRes] = await Promise.all([
      supabase.from('gym_members').select('id, gym_id, home_branch_id, full_name').eq('id', memberId).single(),
      supabase.from('membership_plans').select('id, name, price, duration_days, session_limit').eq('id', planId).single(),
    ]);

    if (memberRes.error || !memberRes.data) {
      return { error: 'Không tìm thấy hồ sơ hội viên.' };
    }
    if (planRes.error || !planRes.data) {
      return { error: 'Không tìm thấy gói tập được chọn.' };
    }

    const member = memberRes.data;
    const plan = planRes.data;

    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (plan.duration_days || 30));

    // 2. Tạo thẻ tập mới
    const { data: newMembership, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        gym_id: member.gym_id,
        branch_id: member.home_branch_id || null,
        member_id: member.id,
        plan_id: plan.id,
        status: 'active',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        remaining_sessions: plan.session_limit || null,
        notes: notes || `Gia hạn tại quầy gói ${plan.name}`,
      })
      .select('id')
      .single();

    if (membershipError) {
      return { error: `Lỗi tạo thẻ tập: ${membershipError.message}` };
    }

    // 3. Tạo hóa đơn thanh toán
    const customAmount = customAmountStr ? parseInt(customAmountStr, 10) : NaN;
    const finalAmount = !isNaN(customAmount) ? customAmount : plan.price;
    const invoiceCode = `INV-${Date.now().toString().slice(-8)}`;

    await supabase.from('payment_transactions').insert({
      gym_id: member.gym_id,
      branch_id: member.home_branch_id || null,
      member_id: member.id,
      membership_id: newMembership?.id || null,
      amount: finalAmount,
      payment_method: paymentMethod,
      payment_status: 'completed',
      invoice_code: invoiceCode,
      notes: notes || `Gia hạn thẻ gói ${plan.name}`,
    });

    // 4. Đảm bảo trạng thái hội viên là active
    await supabase.from('gym_members').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', memberId);

    try {
      revalidatePath('/dashboard/members');
      revalidatePath(`/dashboard/members/${memberId}`);
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { error: err instanceof Error ? err.message : 'Lỗi gia hạn gói tập' };
  }
}

/**
 * Server Action: Cập nhật trạng thái thẻ tập (Bảo lưu, Kích hoạt lại, Hủy)
 */
export async function updateSubscriptionStatus(
  membershipId: string,
  memberId: string,
  newStatus: 'active' | 'paused' | 'cancelled'
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('memberships')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', membershipId);

    if (error) {
      return { error: error.message };
    }

    try {
      revalidatePath('/dashboard/members');
      revalidatePath(`/dashboard/members/${memberId}`);
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { error: err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái thẻ tập' };
  }
}

/**
 * Server Action: Ghi nhận chỉ số đo InBody mới
 */
export async function recordBodyMeasurement(
  memberId: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: member, error: memberError } = await supabase
      .from('gym_members')
      .select('id, gym_id')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return { error: 'Không tìm thấy hồ sơ hội viên.' };
    }

    const measuredAt = (formData.get('measured_at') as string) || new Date().toISOString().split('T')[0];
    const weightKgStr = formData.get('weight_kg') as string;
    const heightCmStr = formData.get('height_cm') as string;
    const bodyFatPctStr = formData.get('body_fat_pct') as string;
    const skeletalMuscleKgStr = formData.get('skeletal_muscle_kg') as string;
    const waistCmStr = formData.get('waist_cm') as string;
    const chestCmStr = formData.get('chest_cm') as string;
    const hipCmStr = formData.get('hip_cm') as string;
    const notes = (formData.get('notes') as string)?.trim() || null;

    const weightKg = parseFloat(weightKgStr);
    if (isNaN(weightKg) || weightKg <= 0) {
      return { error: 'Vui lòng nhập cân nặng hợp lệ (lớn hơn 0 kg).' };
    }

    const heightCm = heightCmStr ? parseFloat(heightCmStr) : null;
    const bodyFatPct = bodyFatPctStr ? parseFloat(bodyFatPctStr) : null;
    const skeletalMuscleKg = skeletalMuscleKgStr ? parseFloat(skeletalMuscleKgStr) : null;
    const waistCm = waistCmStr ? parseFloat(waistCmStr) : null;
    const chestCm = chestCmStr ? parseFloat(chestCmStr) : null;
    const hipCm = hipCmStr ? parseFloat(hipCmStr) : null;

    const { error } = await supabase.from('body_measurements').insert({
      gym_id: member.gym_id,
      member_id: member.id,
      measured_at: measuredAt,
      weight_kg: weightKg,
      height_cm: heightCm && !isNaN(heightCm) ? heightCm : null,
      body_fat_pct: bodyFatPct && !isNaN(bodyFatPct) ? bodyFatPct : null,
      skeletal_muscle_kg: skeletalMuscleKg && !isNaN(skeletalMuscleKg) ? skeletalMuscleKg : null,
      waist_cm: waistCm && !isNaN(waistCm) ? waistCm : null,
      chest_cm: chestCm && !isNaN(chestCm) ? chestCm : null,
      hip_cm: hipCm && !isNaN(hipCm) ? hipCm : null,
      notes,
    });

    if (error) {
      return { error: `Lỗi lưu chỉ số InBody: ${error.message}` };
    }

    try {
      revalidatePath('/dashboard/members');
      revalidatePath(`/dashboard/members/${memberId}`);
    } catch {}

    return { success: true };
  } catch (err: any) {
    return { error: err instanceof Error ? err.message : 'Lỗi ghi nhận chỉ số cơ thể' };
  }
}

/**
 * Server Action: Điểm danh nhanh 1 chạm cho hội viên ngay trên trang chi tiết
 */
export async function quickCheckInMember(
  memberId: string,
  memberCode: string,
  branchId?: string | null
): Promise<{ success?: boolean; message?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: member, error: memberError } = await supabase
      .from('gym_members')
      .select('id, gym_id, home_branch_id, full_name, status')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return { error: 'Không tìm thấy hồ sơ hội viên.' };
    }

    if (member.status === 'suspended') {
      return { error: 'Hồ sơ hội viên đang tạm ngưng, không thể điểm danh.' };
    }

    const effectiveBranchId = branchId || member.home_branch_id;

    // 1. Thử gọi RPC rpc_check_in_member
    try {
      const { data: rpcRes, error: rpcError } = await supabase.rpc('rpc_check_in_member', {
        p_gym_id: member.gym_id,
        p_branch_id: effectiveBranchId || null,
        p_lookup_input: memberCode || member.id,
        p_method: 'receptionist_manual',
      });

      if (!rpcError && rpcRes) {
        if (rpcRes.success) {
          revalidatePath('/dashboard/members');
          revalidatePath(`/dashboard/members/${memberId}`);
          revalidatePath('/dashboard/check-in');
          return { success: true, message: rpcRes.message || 'Điểm danh thành công!' };
        } else {
          return { error: rpcRes.message || 'Thẻ tập không hợp lệ để điểm danh.' };
        }
      }
    } catch (rpcEx) {
      console.warn('[RPC CHECKIN EXCEPTION]:', rpcEx);
    }

    // 2. Fallback: Insert trực tiếp vào attendance_logs
    const { error: insertError } = await supabase.from('attendance_logs').insert({
      gym_id: member.gym_id,
      branch_id: effectiveBranchId || null,
      member_id: member.id,
      method: 'receptionist_manual',
      check_in_at: new Date().toISOString(),
    });

    if (insertError) {
      return { error: `Lỗi ghi nhận điểm danh: ${insertError.message}` };
    }

    try {
      revalidatePath('/dashboard/members');
      revalidatePath(`/dashboard/members/${memberId}`);
      revalidatePath('/dashboard/check-in');
    } catch {}

    return { success: true, message: 'Điểm danh thành công (đã ghi nhận nhật ký ra vào)!' };
  } catch (err: any) {
    return { error: err instanceof Error ? err.message : 'Lỗi điểm danh hội viên' };
  }
}
