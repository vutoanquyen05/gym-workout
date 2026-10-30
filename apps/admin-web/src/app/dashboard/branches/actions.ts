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
 * Tự động lấy gym_id của user hiện tại từ bảng gyms.
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
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
    }

    // Truy vấn lấy gym_id của user hiện tại (từ bảng gyms)
    let gymId: string | null = null;

    // 1. Kiểm tra nếu user là chủ sở hữu (owner) trong bảng gyms
    const { data: ownerGyms, error: ownerError } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (!ownerError && ownerGyms && ownerGyms.length > 0) {
      gymId = ownerGyms[0].id;
    } else {
      // 2. Tìm qua gym_staff nếu user là nhân sự/quản lý
      const { data: staffGyms } = await supabase
        .from('gym_staff')
        .select('gym_id')
        .eq('user_id', user.id)
        .limit(1);

      if (staffGyms && staffGyms.length > 0) {
        gymId = staffGyms[0].gym_id;
      } else {
        // 3. Fallback: Lấy phòng gym có sẵn đầu tiên trong hệ thống
        const { data: anyGym } = await supabase.from('gyms').select('id').limit(1);

        if (anyGym && anyGym.length > 0) {
          gymId = anyGym[0].id;
        } else {
          // 4. Nếu chưa có bất kỳ Gym nào, tự động khởi tạo 1 Tenant Gym mặc định cho user
          const defaultGymSlug = `gym-${user.id.slice(0, 8)}`;
          const { data: newGym, error: newGymError } = await supabase
            .from('gyms')
            .insert({
              name: 'Gym Tracker Central',
              slug: defaultGymSlug,
              owner_id: user.id,
              status: 'active',
            })
            .select('id')
            .single();

          if (!newGymError && newGym) {
            gymId = newGym.id;
          }
        }
      }
    }

    if (!gymId) {
      return {
        error:
          'Không tìm thấy thông tin phòng tập (Gym) liên kết với tài khoản này. Vui lòng cấu hình phòng tập trước.',
      };
    }

    // Thực hiện INSERT INTO branches (gym_id, name, slug, address, phone, status)
    const { error: insertError } = await supabase.from('branches').insert({
      gym_id: gymId,
      name,
      slug,
      address,
      phone,
      status,
    });

    if (insertError) {
      console.warn('Lỗi khi insert trực tiếp vào branches, thử RPC rpc_manage_branch:', insertError.message);
      // Fallback gọi RPC rpc_manage_branch nếu database chỉ cấp quyền qua function
      const { error: rpcError } = await supabase.rpc('rpc_manage_branch', {
        p_gym_id: gymId,
        p_name: name,
        p_slug: slug,
        p_address: address,
        p_phone: phone,
        p_status: status,
      });

      if (rpcError) {
        console.error('Lỗi khi tạo chi nhánh qua RPC:', rpcError.message);
        return { error: `Lỗi tạo chi nhánh: ${rpcError.message}` };
      }
    }

    // Làm mới dữ liệu trang danh sách
    revalidatePath('/dashboard/branches');
    return { success: true };
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
      err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống khi tạo chi nhánh.';
    console.error('Lỗi ngoại lệ trong createBranch:', errorMessage);
    return { error: errorMessage };
  }
}
