'use server';

import { createClient } from '@/utils/supabase/server';

export interface GymProfile {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/**
 * Lấy thông tin phòng gym hiện tại và tự động đồng bộ sang GymOS & /gymos nếu cần
 */
export async function getGymProfile(): Promise<{
  data: GymProfile | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    let gym = gyms?.[0] || null;

    // Tự động đồng bộ chuẩn thương hiệu GymOS và slug gymos
    if (gym && (gym.slug === 'gym-tracker-hung-vuong' || gym.name !== 'GymOS' || gym.slug !== 'gymos')) {
      const { data: updatedGym } = await supabase
        .from('gyms')
        .update({
          name: 'GymOS',
          slug: 'gymos',
          updated_at: new Date().toISOString(),
        })
        .eq('id', gym.id)
        .select('id, name, slug, created_at')
        .single();

      if (updatedGym) {
        gym = updatedGym;
      }
    }

    return { data: gym, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { data: null, error: message };
  }
}
