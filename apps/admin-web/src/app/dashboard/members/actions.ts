'use server';

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
