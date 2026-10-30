'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export interface Membership {
  id: string;
  gym_id: string;
  user_id: string;
  plan_id?: string | null;
  branch_id?: string | null;
  assigned_pt_id?: string | null;
  status: 'pending_payment' | 'active' | 'paused' | 'expired' | 'cancelled' | string;
  start_date: string;
  end_date: string;
  remaining_sessions?: number | null;
  qr_code_token?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  description?: string | null;
  duration_days: number;
  sessions_count?: number | null;
  price: number;
  scope?: string;
}

export interface MemberBranchOption {
  id: string;
  name: string;
}

/**
 * Server Action: Lấy danh sách hội viên (memberships) từ Supabase Cloud.
 * Ưu tiên truy vấn theo gym_id của quản trị viên đang đăng nhập.
 */
export async function getMembers(): Promise<{ data: Membership[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: [], error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' };
    }

    // 1. Xác định gym_id của tổ chức
    let gymId: string | null = null;

    // Tìm trong gyms do user làm owner
    const { data: ownerGyms, error: ownerError } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (ownerError) {
      console.warn('[GET MEMBERS] Không thể đọc gyms của owner:', ownerError.message);
    }

    if (ownerGyms && ownerGyms.length > 0) {
      gymId = ownerGyms[0].id;
    } else {
      // Tìm trong gym_staff nếu user là nhân sự
      const { data: staffGyms, error: staffError } = await supabase
        .from('gym_staff')
        .select('gym_id')
        .eq('user_id', user.id)
        .limit(1);

      if (staffError) {
        console.warn('[GET MEMBERS] Không thể đọc gym_staff:', staffError.message);
      }

      if (staffGyms && staffGyms.length > 0) {
        gymId = staffGyms[0].gym_id;
      } else {
        // Fallback: Tìm bất kỳ gym nào user có quyền đọc
        const { data: anyGym } = await supabase.from('gyms').select('id').limit(1);
        if (anyGym && anyGym.length > 0) {
          gymId = anyGym[0].id;
        }
      }
    }

    // 2. Truy vấn danh sách memberships
    let query = supabase.from('memberships').select('*');

    if (gymId) {
      query = query.eq('gym_id', gymId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[GET MEMBERS ERROR]: ', error);
      return {
        data: [],
        error: `Lỗi Supabase khi tải danh sách hội viên: ${error.message} (Mã lỗi: ${error.code || 'UNKNOWN'})`,
      };
    }

    return { data: (data as Membership[]) ?? [], error: null };
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
    console.error('[GET MEMBERS ERROR]: ', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error);
    return { data: [], error: `Lỗi ngoại lệ khi tải danh sách hội viên: ${errorMessage}` };
  }
}

/**
 * Server Action: Lấy danh sách gói tập (membership_plans) để chọn trên Form.
 * Nếu chưa có gói nào, tự động khởi tạo gói mẫu cho Gym.
 */
export async function getMembershipPlans(): Promise<{
  data: MembershipPlan[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: 'Phiên đăng nhập đã hết hạn.' };
    }

    // Tìm gym_id
    let gymId: string | null = null;
    const { data: ownerGyms } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (ownerGyms && ownerGyms.length > 0) {
      gymId = ownerGyms[0].id;
    } else {
      const { data: staffGyms } = await supabase
        .from('gym_staff')
        .select('gym_id')
        .eq('user_id', user.id)
        .limit(1);

      if (staffGyms && staffGyms.length > 0) {
        gymId = staffGyms[0].gym_id;
      } else {
        const { data: anyGym } = await supabase.from('gyms').select('id').limit(1);
        if (anyGym && anyGym.length > 0) {
          gymId = anyGym[0].id;
        }
      }
    }

    let query = supabase.from('membership_plans').select('*');
    if (gymId) {
      query = query.eq('gym_id', gymId);
    }
    const { data, error } = await query.order('price', { ascending: true });

    if (error) {
      console.warn('[GET MEMBERSHIP PLANS] Lỗi truy vấn gói tập:', error.message);
      return { data: [], error: error.message };
    }

    // Nếu chưa có gói tập nào trong DB, tự động khởi tạo gói tập cơ bản
    if ((!data || data.length === 0) && gymId) {
      console.log('[GET MEMBERSHIP PLANS] Chưa có gói tập, tạo gói mẫu...');
      const samplePlans = [
        {
          gym_id: gymId,
          name: 'Gói 1 Tháng Tiêu Chuẩn',
          description: 'Tập luyện không giới hạn trong 30 ngày',
          duration_days: 30,
          sessions_count: 30,
          price: 500000,
          scope: 'all_branches',
          is_active: true,
        },
        {
          gym_id: gymId,
          name: 'Gói 3 Tháng Toàn Diện',
          description: 'Tập luyện tất cả các chi nhánh trong 90 ngày',
          duration_days: 90,
          sessions_count: 90,
          price: 1350000,
          scope: 'all_branches',
          is_active: true,
        },
      ];

      const { data: inserted, error: insertError } = await supabase
        .from('membership_plans')
        .insert(samplePlans)
        .select('*');

      if (!insertError && inserted) {
        return { data: inserted as MembershipPlan[], error: null };
      }
    }

    return { data: (data as MembershipPlan[]) ?? [], error: null };
  } catch (error: any) {
    console.error('[GET MEMBERSHIP PLANS ERROR]: ', error);
    return { data: [], error: error instanceof Error ? error.message : 'Lỗi lấy danh sách gói tập' };
  }
}

/**
 * Server Action: Lấy danh sách chi nhánh để hiển thị dropdown tùy chọn
 */
export async function getBranchOptions(): Promise<{ data: MemberBranchOption[] }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('branches')
      .select('id, name')
      .eq('status', 'active')
      .order('name');
    return { data: data ?? [] };
  } catch {
    return { data: [] };
  }
}

/**
 * Server Action: Cấp phát thẻ hội viên mới và ghi vào bảng memberships.
 * Bọc toàn bộ try/catch an toàn, không ném Unhandled Exception.
 */
export async function createMembership(
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const rawUserId = formData.get('userId')?.toString().trim();
    const planId = formData.get('planId')?.toString().trim();
    const startDateStr =
      formData.get('startDate')?.toString().trim() ||
      new Date().toISOString().split('T')[0];
    const branchId = formData.get('branchId')?.toString().trim() || null;
    const status = formData.get('status')?.toString().trim() || 'active';

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' };
    }

    // Xác định target user ID
    let targetUserId = rawUserId;
    if (!targetUserId || targetUserId === user.email || targetUserId === 'me') {
      targetUserId = user.id;
    }

    // Kiểm tra định dạng UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetUserId)) {
      return {
        error: `Mã người dùng (User ID) phải là định dạng UUID hợp lệ. Bạn có thể dùng UID tài khoản của mình: ${user.id}`,
      };
    }

    if (!planId) {
      return { error: 'Vui lòng chọn một gói tập hợp lệ.' };
    }

    // 1. Xác định gym_id của tổ chức
    let gymId: string | null = null;
    const { data: ownerGyms } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (ownerGyms && ownerGyms.length > 0) {
      gymId = ownerGyms[0].id;
    } else {
      const { data: staffGyms } = await supabase
        .from('gym_staff')
        .select('gym_id')
        .eq('user_id', user.id)
        .limit(1);

      if (staffGyms && staffGyms.length > 0) {
        gymId = staffGyms[0].gym_id;
      } else {
        const { data: anyGym } = await supabase.from('gyms').select('id').limit(1);
        if (anyGym && anyGym.length > 0) {
          gymId = anyGym[0].id;
        }
      }
    }

    if (!gymId) {
      return {
        error:
          'Không tìm thấy thông tin phòng tập (Gym) liên kết với tài khoản này. Vui lòng cấu hình phòng tập trước.',
      };
    }

    // 2. Lấy thông tin gói tập để tính toán thời hạn (end_date) và số buổi (remaining_sessions)
    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return {
        error: `Không tìm thấy gói tập tương ứng: ${planError?.message || 'Gói tập không tồn tại'}`,
      };
    }

    const startDate = new Date(startDateStr);
    const durationDays = plan.duration_days || 30;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const endDateStr = endDate.toISOString().split('T')[0];

    const qrCodeToken = `mem-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;

    // 3. Thực hiện INSERT vào bảng memberships
    const { error: insertError } = await supabase.from('memberships').insert({
      gym_id: gymId,
      user_id: targetUserId,
      plan_id: planId,
      branch_id: branchId || null,
      status,
      start_date: startDateStr,
      end_date: endDateStr,
      remaining_sessions: plan.sessions_count || null,
      qr_code_token: qrCodeToken,
    });

    if (insertError) {
      console.error('[CREATE MEMBERSHIP ERROR]: ', insertError);
      return {
        error: `Lỗi Supabase khi cấp thẻ hội viên: ${insertError.message} (Chi tiết: ${insertError.details || insertError.hint || 'Kiểm tra quyền RLS trên bảng memberships'})`,
      };
    }

    try {
      revalidatePath('/dashboard/members');
    } catch (revError) {
      console.warn('[CREATE MEMBERSHIP] revalidatePath warning:', revError);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[CREATE MEMBERSHIP ERROR]: ', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error);
    return { error: `Lỗi ngoại lệ hệ thống: ${errorMessage}` };
  }
}
