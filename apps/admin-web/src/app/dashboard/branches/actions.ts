'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export interface Branch {
  id: string;
  gym_id: string;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
}

// Giữ tương thích ngược với code cũ nếu có
export type Gym = Branch;

/**
 * Server Action: Lấy danh sách toàn bộ chi nhánh (branches) từ Supabase Cloud.
 * Sắp xếp theo ngày tạo mới nhất (created_at DESC).
 */
export async function getBranches(): Promise<{ data: Branch[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi khi truy vấn danh sách branches từ Supabase:', error.message);
      return { data: [], error: error.message };
    }

    return { data: (data as Branch[]) ?? [], error: null };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest?: unknown }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('DYNAMIC_SERVER_USAGE')
    ) {
      throw err;
    }
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể kết nối đến cơ sở dữ liệu Supabase';
    console.error('Lỗi ngoại lệ trong getBranches:', errorMessage);
    return { data: [], error: errorMessage };
  }
}

/**
 * Server Action: Tạo chi nhánh mới và lưu vào bảng branches.
 * Bọc toàn bộ trong try/catch an toàn, tuyệt đối không throw Unhandled Exception.
 */
export async function createBranch(
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const name = formData.get('name')?.toString().trim();
    const slug = formData.get('slug')?.toString().trim().toLowerCase();
    const phone = formData.get('phone')?.toString().trim() || null;
    const address = formData.get('address')?.toString().trim() || null;
    const status = formData.get('status')?.toString().trim() || 'active';

    if (!name) {
      return { error: 'Tên chi nhánh là bắt buộc.' };
    }
    if (!slug) {
      return { error: 'URL Slug định danh chi nhánh là bắt buộc.' };
    }

    // Kiểm tra định dạng slug (chỉ gồm ký tự thường a-z, 0-9 và dấu gạch ngang)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return {
        error: 'Slug URL chỉ được chứa chữ cái thường, số và dấu gạch ngang (VD: quan-1, ha-noi).',
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' };
    }

    // 1. Tìm gym_id của user hiện tại từ bảng gyms hoặc gym_staff
    let gymId: string | null = null;

    // Tìm trong gyms do user làm owner
    const { data: ownerGyms, error: ownerError } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (ownerError) {
      console.warn('[CREATE BRANCH] Không thể đọc gyms của owner:', ownerError.message);
    }

    if (ownerGyms && ownerGyms.length > 0) {
      gymId = ownerGyms[0].id;
    } else {
      // Tìm trong gym_staff
      const { data: staffGyms, error: staffError } = await supabase
        .from('gym_staff')
        .select('gym_id')
        .eq('user_id', user.id)
        .limit(1);

      if (staffError) {
        console.warn('[CREATE BRANCH] Không thể đọc gym_staff:', staffError.message);
      }

      if (staffGyms && staffGyms.length > 0) {
        gymId = staffGyms[0].gym_id;
      } else {
        // Tìm bất kỳ gym nào user có quyền đọc
        const { data: anyGym, error: anyGymError } = await supabase
          .from('gyms')
          .select('id')
          .limit(1);

        if (anyGymError) {
          console.warn('[CREATE BRANCH] Không thể đọc gyms fallback:', anyGymError.message);
        }

        if (anyGym && anyGym.length > 0) {
          gymId = anyGym[0].id;
        }
      }
    }

    // Nếu user chưa có gym nào trong hệ thống, thử tự động khởi tạo qua rpc_create_gym
    if (!gymId) {
      console.log('[CREATE BRANCH] User chưa có gym, tiến hành gọi rpc_create_gym...');
      const defaultGymName = 'Gym Tracker Center';
      const defaultGymSlug = `gym-${user.id.slice(0, 8)}`;

      const { error: rpcGymError } = await supabase.rpc('rpc_create_gym', {
        p_name: defaultGymName,
        p_slug: defaultGymSlug,
        p_main_branch_name: name,
        p_main_branch_slug: slug,
        p_main_branch_address: address,
        p_main_branch_phone: phone,
      });

      if (rpcGymError) {
        console.error('[CREATE BRANCH ERROR]: ', rpcGymError);
        return {
          error: `Không tìm thấy phòng tập (Gym) và không thể tự khởi tạo: ${rpcGymError.message}`,
        };
      }

      try {
        revalidatePath('/dashboard/branches');
      } catch (revError) {
        console.warn('[CREATE BRANCH] revalidatePath warning:', revError);
      }
      return { success: true };
    }

    // Nếu đã có gymId, thực hiện tạo branch cho phòng gym đó
    // Phương án 1: Gọi RPC rpc_manage_branch (tuân thủ RLS & SECURITY DEFINER)
    const { error: rpcBranchError } = await supabase.rpc('rpc_manage_branch', {
      p_gym_id: gymId,
      p_name: name,
      p_slug: slug,
      p_address: address,
      p_phone: phone,
      p_status: status,
    });

    if (!rpcBranchError) {
      try {
        revalidatePath('/dashboard/branches');
      } catch (revError) {
        console.warn('[CREATE BRANCH] revalidatePath warning:', revError);
      }
      return { success: true };
    }

    console.warn(
      '[CREATE BRANCH] rpc_manage_branch không thành công, thử insert trực tiếp:',
      rpcBranchError.message,
    );

    // Phương án 2: Insert trực tiếp vào bảng branches
    const { error: insertError } = await supabase.from('branches').insert({
      gym_id: gymId,
      name,
      slug,
      address,
      phone,
      status,
    });

    if (insertError) {
      console.error('[CREATE BRANCH ERROR]: ', insertError);
      return {
        error: `Lỗi Supabase khi tạo chi nhánh: ${insertError.message} (Mã lỗi: ${insertError.code || 'UNKNOWN'}, Chi tiết: ${insertError.details || insertError.hint || 'Kiểm tra quyền RLS'})`,
      };
    }

    try {
      revalidatePath('/dashboard/branches');
    } catch (revError) {
      console.warn('[CREATE BRANCH] revalidatePath warning:', revError);
    }
    return { success: true };
  } catch (error: any) {
    console.error('[CREATE BRANCH ERROR]: ', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error);
    return { error: `Lỗi ngoại lệ hệ thống: ${errorMessage}` };
  }
}
