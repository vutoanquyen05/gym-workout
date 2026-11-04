'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface BranchOption {
  id: string;
  name: string;
  code?: string;
}

export interface MemberLookupSummary {
  id: string;
  member_code: string;
  full_name: string;
  phone: string;
  status: string;
  home_branch_id: string | null;
  active_plan_name?: string | null;
  plan_end_date?: string | null;
  remaining_sessions?: number | null;
  has_valid_membership: boolean;
  days_left?: number | null;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  member_code: string;
  full_name: string;
  phone: string;
  branch_id: string;
  branch_name: string;
  membership_id: string | null;
  plan_name: string;
  check_in_at: string;
  check_out_at: string | null;
  method: 'receptionist_manual' | 'desk_qr_scan' | 'turnstile_gate';
  checked_in_by?: string | null;
}

export interface CheckInDeskKPIs {
  todayCheckIns: number;
  activeInGym: number;
  eligibleMembers: number;
  expiringSoonMembers: number;
}

export interface CheckInDeskData {
  branches: BranchOption[];
  members: MemberLookupSummary[];
  recentLogs: AttendanceRecord[];
  kpis: CheckInDeskKPIs;
  currentGymId: string | null;
  error?: string | null;
}

export interface CheckInResult {
  success: boolean;
  code?: string;
  message: string;
  attendance_id?: string;
  member?: {
    id: string;
    member_code: string;
    full_name: string;
    phone: string;
  };
  membership?: {
    id: string;
    plan_name: string;
    end_date: string;
    remaining_sessions: number | null;
  };
  check_in_at?: string;
  warning_expiring?: boolean;
  days_left?: number | null;
}

/**
 * Helper xác định gym_id của người dùng hiện tại
 */
async function getCurrentGymId(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data: ownerGyms } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);

    if (ownerGyms && ownerGyms.length > 0) {
      return ownerGyms[0].id;
    }

    const { data: staffGyms } = await supabase
      .from('gym_staff')
      .select('gym_id')
      .eq('user_id', userId)
      .limit(1);

    if (staffGyms && staffGyms.length > 0) {
      return staffGyms[0].gym_id;
    }

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
 * Lấy toàn bộ dữ liệu phục vụ Quầy điểm danh thông minh
 */
export async function getCheckInDeskData(): Promise<CheckInDeskData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        branches: [],
        members: [],
        recentLogs: [],
        kpis: { todayCheckIns: 0, activeInGym: 0, eligibleMembers: 0, expiringSoonMembers: 0 },
        currentGymId: null,
        error: 'Bạn chưa đăng nhập hệ thống.',
      };
    }

    const gymId = await getCurrentGymId(supabase, user.id);
    if (!gymId) {
      return {
        branches: [],
        members: [],
        recentLogs: [],
        kpis: { todayCheckIns: 0, activeInGym: 0, eligibleMembers: 0, expiringSoonMembers: 0 },
        currentGymId: null,
        error: 'Không tìm thấy thông tin phòng gym hợp lệ.',
      };
    }

    // Truy vấn song song dữ liệu các phân hệ
    const [branchesRes, membersRes, membershipsRes, logsRes] = await Promise.allSettled([
      supabase
        .from('branches')
        .select('id, name, code')
        .eq('gym_id', gymId)
        .eq('status', 'active')
        .order('name', { ascending: true }),
      supabase
        .from('gym_members')
        .select('id, member_code, full_name, phone, status, home_branch_id')
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false }),
      supabase
        .from('memberships')
        .select(`
          id,
          member_id,
          plan_id,
          status,
          start_date,
          end_date,
          remaining_sessions,
          membership_plans (
            name,
            plan_type,
            scope
          )
        `)
        .eq('gym_id', gymId),
      supabase
        .from('attendance_logs')
        .select('id, member_id, branch_id, membership_id, check_in_at, check_out_at, method, checked_in_by')
        .eq('gym_id', gymId)
        .order('check_in_at', { ascending: false })
        .limit(100),
    ]);

    const branches: BranchOption[] =
      branchesRes.status === 'fulfilled' && branchesRes.value.data
        ? (branchesRes.value.data as BranchOption[])
        : [];

    const rawMembers =
      membersRes.status === 'fulfilled' && membersRes.value.data
        ? membersRes.value.data
        : [];

    const rawMemberships =
      membershipsRes.status === 'fulfilled' && membershipsRes.value.data
        ? membershipsRes.value.data
        : [];

    const rawLogs =
      logsRes.status === 'fulfilled' && logsRes.value.data
        ? logsRes.value.data
        : [];

    // Tạo bản đồ tra cứu nhanh
    const branchesMap = new Map<string, string>();
    branches.forEach((b) => branchesMap.set(b.id, b.name));

    const plansMap = new Map<string, string>();
    const activeMembershipByMember = new Map<string, any>();

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayStr = todayDate.toISOString().split('T')[0];

    rawMemberships.forEach((m: any) => {
      const planName = m.membership_plans?.name || 'Gói tập tiêu chuẩn';
      plansMap.set(m.id, planName);

      // Xác định gói tập active ưu tiên
      const isActive =
        m.status === 'active' &&
        m.start_date <= todayStr &&
        m.end_date >= todayStr &&
        (m.remaining_sessions === null || m.remaining_sessions === undefined || m.remaining_sessions > 0);

      if (isActive) {
        const existing = activeMembershipByMember.get(m.member_id);
        if (!existing || new Date(m.end_date) > new Date(existing.end_date)) {
          activeMembershipByMember.set(m.member_id, {
            ...m,
            plan_name: planName,
          });
        }
      }
    });

    // Xử lý tóm tắt hội viên
    let eligibleCount = 0;
    let expiringSoonCount = 0;

    const members: MemberLookupSummary[] = rawMembers.map((mem: any) => {
      const activeMs = activeMembershipByMember.get(mem.id);
      let daysLeft: number | null = null;
      let hasValid = false;

      if (activeMs && mem.status === 'active') {
        hasValid = true;
        eligibleCount++;

        const endDate = new Date(activeMs.end_date);
        endDate.setHours(0, 0, 0, 0);
        const diff = endDate.getTime() - todayDate.getTime();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (daysLeft <= 7 || (activeMs.remaining_sessions !== null && activeMs.remaining_sessions <= 2)) {
          expiringSoonCount++;
        }
      }

      return {
        id: mem.id,
        member_code: mem.member_code,
        full_name: mem.full_name,
        phone: mem.phone,
        status: mem.status,
        home_branch_id: mem.home_branch_id,
        active_plan_name: activeMs ? activeMs.plan_name : null,
        plan_end_date: activeMs ? activeMs.end_date : null,
        remaining_sessions: activeMs ? activeMs.remaining_sessions : null,
        has_valid_membership: hasValid,
        days_left: daysLeft,
      };
    });

    const membersMap = new Map<string, MemberLookupSummary>();
    members.forEach((m) => membersMap.set(m.id, m));

    // Xử lý nhật ký điểm danh và KPI hôm nay
    let todayCheckInsCount = 0;
    let activeInGymCount = 0;

    const recentLogs: AttendanceRecord[] = rawLogs.map((log: any) => {
      const mem = membersMap.get(log.member_id);
      const branchName = branchesMap.get(log.branch_id) || 'Cơ sở chính';
      const planName = plansMap.get(log.membership_id) || 'Gói tập';

      const checkInDate = new Date(log.check_in_at);
      const isToday =
        checkInDate.getFullYear() === todayDate.getFullYear() &&
        checkInDate.getMonth() === todayDate.getMonth() &&
        checkInDate.getDate() === todayDate.getDate();

      if (isToday) {
        todayCheckInsCount++;
        if (!log.check_out_at) {
          activeInGymCount++;
        }
      }

      return {
        id: log.id,
        member_id: log.member_id,
        member_code: mem?.member_code || 'MEM-N/A',
        full_name: mem?.full_name || 'Hội viên',
        phone: mem?.phone || '',
        branch_id: log.branch_id,
        branch_name: branchName,
        membership_id: log.membership_id,
        plan_name: planName,
        check_in_at: log.check_in_at,
        check_out_at: log.check_out_at,
        method: log.method || 'receptionist_manual',
        checked_in_by: log.checked_in_by,
      };
    });

    return {
      branches,
      members,
      recentLogs,
      kpis: {
        todayCheckIns: todayCheckInsCount,
        activeInGym: activeInGymCount,
        eligibleMembers: eligibleCount,
        expiringSoonMembers: expiringSoonCount,
      },
      currentGymId: gymId,
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[GET CHECK-IN DESK DATA CATCH]:', msg);
    return {
      branches: [],
      members: [],
      recentLogs: [],
      kpis: { todayCheckIns: 0, activeInGym: 0, eligibleMembers: 0, expiringSoonMembers: 0 },
      currentGymId: null,
      error: msg,
    };
  }
}

/**
 * Thực hiện điểm danh tại quầy qua RPC rpc_check_in_member
 */
export async function performDeskCheckIn(input: {
  lookupInput: string;
  branchId?: string;
  method?: 'receptionist_manual' | 'desk_qr_scan' | 'turnstile_gate';
}): Promise<CheckInResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Bạn chưa đăng nhập.' };
    }

    const gymId = await getCurrentGymId(supabase, user.id);
    if (!gymId) {
      return { success: false, message: 'Không tìm thấy thông tin phòng gym hợp lệ.' };
    }

    const lookupInput = input.lookupInput?.trim();
    if (!lookupInput) {
      return {
        success: false,
        message: 'Vui lòng nhập mã thẻ (MEM-XXXXXX) hoặc số điện thoại của hội viên.',
      };
    }

    // Gọi hàm RPC transactional trên cơ sở dữ liệu
    const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_check_in_member', {
      p_gym_id: gymId,
      p_branch_id: input.branchId || null,
      p_lookup_input: lookupInput,
      p_method: input.method || 'receptionist_manual',
    });

    if (rpcError) {
      console.warn('[CHECK-IN RPC ERROR]:', rpcError.message);
      return {
        success: false,
        code: 'RPC_ERROR',
        message: 'Lỗi điểm danh: ' + rpcError.message,
      };
    }

    const res = rpcResult as any;

    if (!res || !res.success) {
      return {
        success: false,
        code: res?.code || 'CHECK_IN_FAILED',
        message: res?.message || 'Điểm danh không thành công.',
        member: res?.member,
      };
    }

    // Tính toán số ngày còn lại của thẻ
    let daysLeft: number | null = null;
    let warningExpiring = false;

    if (res.membership?.end_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(res.membership.end_date);
      endDate.setHours(0, 0, 0, 0);
      const diffTime = endDate.getTime() - today.getTime();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysLeft <= 7 || (res.membership.remaining_sessions !== null && res.membership.remaining_sessions <= 2)) {
        warningExpiring = true;
      }
    }

    revalidatePath('/dashboard/check-in');
    revalidatePath('/dashboard/members');
    revalidatePath('/dashboard');

    return {
      success: true,
      attendance_id: res.attendance_id,
      member: res.member,
      membership: res.membership,
      check_in_at: res.check_in_at,
      warning_expiring: warningExpiring,
      days_left: daysLeft,
      message: 'Điểm danh thành công!',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[PERFORM DESK CHECK-IN CATCH]:', msg);
    return { success: false, message: msg };
  }
}

/**
 * Ghi nhận thời gian ra về cho hội viên khi rời phòng tập
 */
export async function checkOutAttendance(
  attendanceId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    const { error } = await supabase
      .from('attendance_logs')
      .update({
        check_out_at: new Date().toISOString(),
      })
      .eq('id', attendanceId);

    if (error) {
      console.warn('[CHECK-OUT ERROR]:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/check-in');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[CHECK-OUT CATCH]:', msg);
    return { success: false, error: msg };
  }
}

