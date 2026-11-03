'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface GymProfile {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/**
 * Lấy thông tin phòng gym hiện tại của người dùng
 */
export async function getGymProfile(): Promise<{
  data: GymProfile | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Bạn chưa đăng nhập.' };
    }

    const { data: gyms, error } = await supabase
      .from('gyms')
      .select('id, name, slug, created_at')
      .limit(1);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: gyms?.[0] || null, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { data: null, error: message };
  }
}

/**
 * Cập nhật tên phòng gym trong bảng public.gyms
 */
export async function updateGymProfile(
  gymId: string,
  formData: FormData
): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const name = (formData.get('name') as string)?.trim();

    if (!name || name.length === 0) {
      return { error: 'Vui lòng nhập tên phòng tập.' };
    }

    const { error } = await supabase
      .from('gyms')
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gymId);

    if (error) {
      console.error('Lỗi updateGymProfile:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { error: message };
  }
}

