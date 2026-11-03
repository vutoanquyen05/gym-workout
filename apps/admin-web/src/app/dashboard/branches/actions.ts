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

export interface BranchWithStats extends Branch {
  staff_count: number;
  member_count: number;
}

// Giữ tương thích ngược với code cũ nếu có
export type Gym = Branch;

/**
 * Server Action: Lấy danh sách toàn bộ chi nhánh kèm số lượng nhân sự và hội viên.
 * Sắp xếp theo ngày tạo mới nhất (created_at DESC).
 */
export async function getBranches(): Promise<{ data: BranchWithStats[]; error: string | null }> {
  try {
    const supabase = await createClient();

    // 1. Lấy danh sách branches
    const { data: branchesData, error: branchError } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: false });

    if (branchError) {
      console.error('Lỗi khi truy vấn danh sách branches từ Supabase:', branchError.message);
      return { data: [], error: branchError.message };
    }

    if (!branchesData || branchesData.length === 0) {
      return { data: [], error: null };
    }

    // 2. Lấy thống kê nhân sự và hội viên theo từng branch
    const [staffRes, membersRes] = await Promise.all([
      supabase.from('gym_staff').select('branch_id').eq('status', 'active'),
      supabase.from('gym_members').select('home_branch_id'),
    ]);

    const staffCountMap = new Map<string, number>();
    (staffRes.data || []).forEach((row) => {
      if (row.branch_id) {
        staffCountMap.set(row.branch_id, (staffCountMap.get(row.branch_id) || 0) + 1);
      }
    });

    const memberCountMap = new Map<string, number>();
    (membersRes.data || []).forEach((row) => {
      if (row.home_branch_id) {
        memberCountMap.set(row.home_branch_id, (memberCountMap.get(row.home_branch_id) || 0) + 1);
      }
    });

    const branchesWithStats: BranchWithStats[] = branchesData.map((b) => ({
      ...b,
      staff_count: staffCountMap.get(b.id) || 0,
      member_count: memberCountMap.get(b.id) || 0,
    }));

    return { data: branchesWithStats, error: null };
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
 * Server Action: Lấy chi tiết một chi nhánh theo ID.
 */
export async function getBranchById(
  branchId: string,
): Promise<{ data: Branch | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('id', branchId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Branch, error: null };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Lỗi ngoại lệ khi truy vấn chi nhánh';
    return { data: null, error: errorMessage };
  }
}

/**
 * Server Action: Tạo chi nhánh mới và lưu vào bảng branches.
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

    // 1. Tìm gym_id của user hiện tại
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
        return {
          error: `Không tìm thấy phòng tập (Gym) và không thể tự khởi tạo: ${rpcGymError.message}`,
        };
      }

      revalidatePath('/dashboard/branches');
      return { success: true };
    }

    // Gọi RPC rpc_manage_branch (tuân thủ RBAC)
    const { error: rpcBranchError } = await supabase.rpc('rpc_manage_branch', {
      p_gym_id: gymId,
      p_name: name,
      p_slug: slug,
      p_address: address,
      p_phone: phone,
      p_status: status,
    });

    if (!rpcBranchError) {
      revalidatePath('/dashboard/branches');
      return { success: true };
    }

    // Fallback: Insert trực tiếp
    const { error: insertError } = await supabase.from('branches').insert({
      gym_id: gymId,
      name,
      slug,
      address,
      phone,
      status,
    });

    if (insertError) {
      return {
        error: `Lỗi khi tạo chi nhánh: ${insertError.message}`,
      };
    }

    revalidatePath('/dashboard/branches');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
    return { error: `Lỗi ngoại lệ hệ thống: ${errorMessage}` };
  }
}

/**
 * Server Action: Cập nhật thông tin chi nhánh (updateBranch)
 */
export async function updateBranch(
  branchId: string,
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

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return {
        error: 'Slug URL chỉ được chứa chữ cái thường, số và dấu gạch ngang (VD: quan-1, ha-noi).',
      };
    }

    if (!['active', 'suspended', 'archived'].includes(status)) {
      return { error: 'Trạng thái chi nhánh không hợp lệ (chỉ chấp nhận active, suspended, archived).' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' };
    }

    // Lấy gym_id của branch
    const { data: branchData, error: branchFetchError } = await supabase
      .from('branches')
      .select('gym_id')
      .eq('id', branchId)
      .single();

    if (branchFetchError || !branchData) {
      return { error: 'Không tìm thấy chi nhánh cần chỉnh sửa.' };
    }

    const gymId = branchData.gym_id;

    // 1. Thử gọi RPC rpc_manage_branch (tuân thủ RBAC)
    const { error: rpcError } = await supabase.rpc('rpc_manage_branch', {
      p_gym_id: gymId,
      p_branch_id: branchId,
      p_name: name,
      p_slug: slug,
      p_address: address,
      p_phone: phone,
      p_status: status,
    });

    if (!rpcError) {
      revalidatePath('/dashboard/branches');
      return { success: true };
    }

    console.warn('[UPDATE BRANCH] rpc_manage_branch thất bại, chuyển sang update trực tiếp:', rpcError.message);

    // 2. Fallback: Update trực tiếp vào bảng branches
    const { error: updateError } = await supabase
      .from('branches')
      .update({
        name,
        slug,
        address,
        phone,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', branchId);

    if (updateError) {
      return { error: `Lỗi cập nhật chi nhánh: ${updateError.message}` };
    }

    revalidatePath('/dashboard/branches');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
    return { error: `Lỗi ngoại lệ hệ thống: ${errorMessage}` };
  }
}

/**
 * Server Action: Cập nhật nhanh trạng thái chi nhánh (updateBranchStatus)
 */
export async function updateBranchStatus(
  branchId: string,
  status: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!['active', 'suspended', 'archived'].includes(status)) {
      return { error: 'Trạng thái chi nhánh không hợp lệ.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' };
    }

    const { data: branchData, error: branchFetchError } = await supabase
      .from('branches')
      .select('gym_id')
      .eq('id', branchId)
      .single();

    if (branchFetchError || !branchData) {
      return { error: 'Không tìm thấy chi nhánh cần cập nhật trạng thái.' };
    }

    const gymId = branchData.gym_id;

    // 1. Thử gọi RPC rpc_manage_branch
    const { error: rpcError } = await supabase.rpc('rpc_manage_branch', {
      p_gym_id: gymId,
      p_branch_id: branchId,
      p_status: status,
    });

    if (!rpcError) {
      revalidatePath('/dashboard/branches');
      return { success: true };
    }

    // 2. Fallback: Update trực tiếp
    const { error: updateError } = await supabase
      .from('branches')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', branchId);

    if (updateError) {
      return { error: `Lỗi cập nhật trạng thái chi nhánh: ${updateError.message}` };
    }

    revalidatePath('/dashboard/branches');
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
    return { error: `Lỗi ngoại lệ hệ thống: ${errorMessage}` };
  }
}
