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

    // Truy vấn dữ liệu từ gym_members kèm quan hệ
    const { data, error } = await supabase
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
        ),
        memberships (
          id,
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
        )
      `)
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GET MEMBERS ERROR]:', error);
      return { data: [], error: `Lỗi truy vấn danh sách hội viên: ${error.message}` };
    }

    // Chuẩn hóa và map thẻ tập hiệu lực
    const members: MemberWithDetails[] = (data || []).map((m: any) => {
      // Tìm membership đang active hoặc mới nhất
      const allMemberships = Array.isArray(m.memberships) ? m.memberships : [];
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
      const assignedPt = Array.isArray(m.assigned_pt) ? m.assigned_pt[0] : m.assigned_pt;

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
        assigned_pt: assignedPt ? { id: assignedPt.id, full_name: assignedPt.full_name } : null,
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
    console.error('[GET MEMBERS EXCEPTION]:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Lỗi ngoại lệ khi tải danh sách hội viên' };
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

    // Truy vấn song song 3 danh mục
    const [plansRes, branchesRes, trainersRes] = await Promise.all([
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

    const plans: MemberPlanOption[] = (plansRes.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price || 0),
      duration_days: p.duration_days || 30,
      session_limit: p.session_limit || null,
      plan_type: p.plan_type || 'fixed_period',
    }));

    const branches: MemberBranchOption[] = (branchesRes.data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
    }));

    const trainers: MemberTrainerOption[] = (trainersRes.data || []).map((t: any) => {
      const branchObj = Array.isArray(t.branch) ? t.branch[0] : t.branch;
      return {
        id: t.id,
        full_name: t.full_name,
        specialty: t.specialty || null,
        branch_name: branchObj?.name || null,
      };
    });

    return { data: { plans, branches, trainers }, error: null };
  } catch (err: any) {
    console.error('[REGISTRATION OPTIONS ERROR]:', err);
    return {
      data: { plans: [], branches: [], trainers: [] },
      error: err instanceof Error ? err.message : 'Lỗi lấy danh mục tùy chọn đăng ký',
    };
  }
}

/**
 * Server Action: Đăng ký hội viên CRM 360° và bán thẻ POS tại quầy
 * - Không yêu cầu UUID hay Auth UID người dùng!
 * - Nhập trực tiếp thông tin cá nhân và gói tập.
 * - Ưu tiên gọi Transactional RPC rpc_register_member_with_plan.
 * - Fallback trực tiếp nếu RPC phát sinh ngoại lệ.
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

    // Xác thực cơ bản
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
      console.error('[DIRECT INSERT MEMBER ERROR]:', memberInsertError);
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
    console.error('[REGISTER MEMBER EXCEPTION]:', error);
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
