'use server';

import { createClient } from '@/utils/supabase/server';

export interface Gym {
  id: string;
  name: string;
  slug?: string;
  address?: string | null;
  phone?: string | null;
  status?: string;
  created_at: string;
  updated_at?: string;
  owner_id?: string;
}

/**
 * Server Action: Lấy danh sách toàn bộ chi nhánh (gyms) từ Supabase Cloud.
 * Sắp xếp theo ngày tạo mới nhất (created_at DESC).
 */
export async function getBranches(): Promise<{ data: Gym[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('gyms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi khi truy vấn danh sách gyms từ Supabase:', error.message);
      return { data: [], error: error.message };
    }

    return { data: (data as Gym[]) ?? [], error: null };
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
