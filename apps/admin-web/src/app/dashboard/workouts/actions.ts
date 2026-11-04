'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ExerciseItem {
  id: string;
  gym_id: string | null;
  owner_id: string | null;
  scope: 'system' | 'gym' | 'user';
  name: string;
  primary_muscle_group: string;
  equipment: string | null;
  difficulty: string | null;
  instructions: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseCatalogStats {
  totalExercises: number;
  systemExercises: number;
  gymExercises: number;
  muscleGroupsCount: number;
}

export interface ExerciseCatalogData {
  exercises: ExerciseItem[];
  stats: ExerciseCatalogStats;
  currentGymId: string | null;
  error: string | null;
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
 * Lấy toàn bộ danh mục bài tập (Hệ thống chuẩn + Riêng phòng gym)
 */
export async function getExercisesCatalogData(): Promise<ExerciseCatalogData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        exercises: [],
        stats: { totalExercises: 0, systemExercises: 0, gymExercises: 0, muscleGroupsCount: 0 },
        currentGymId: null,
        error: 'Bạn chưa đăng nhập hệ thống.',
      };
    }

    const gymId = await getCurrentGymId(supabase, user.id);

    // Truy vấn song song bài tập hệ thống (system) và bài tập riêng phòng gym (gym)
    const { data: rawExercises, error: queryError } = await supabase
      .from('exercises')
      .select(`
        id,
        gym_id,
        owner_id,
        scope,
        name,
        primary_muscle_group,
        equipment,
        difficulty,
        instructions,
        is_archived,
        created_at,
        updated_at
      `)
      .or(gymId ? `scope.eq.system,and(scope.eq.gym,gym_id.eq.${gymId})` : 'scope.eq.system')
      .eq('is_archived', false)
      .order('name', { ascending: true });

    if (queryError) {
      console.warn('[EXERCISES CATALOG QUERY WARN]:', queryError.message);
      return {
        exercises: [],
        stats: { totalExercises: 0, systemExercises: 0, gymExercises: 0, muscleGroupsCount: 0 },
        currentGymId: gymId,
        error: queryError.message,
      };
    }

    const exercises = (rawExercises || []) as ExerciseItem[];

    // Thống kê nhanh danh mục
    let systemCount = 0;
    let gymCount = 0;
    const muscleGroupsSet = new Set<string>();

    exercises.forEach((ex) => {
      if (ex.scope === 'system') systemCount++;
      if (ex.scope === 'gym') gymCount++;
      if (ex.primary_muscle_group) {
        muscleGroupsSet.add(ex.primary_muscle_group.toLowerCase().trim());
      }
    });

    return {
      exercises,
      stats: {
        totalExercises: exercises.length,
        systemExercises: systemCount,
        gymExercises: gymCount,
        muscleGroupsCount: muscleGroupsSet.size,
      },
      currentGymId: gymId,
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[GET EXERCISES CATALOG CATCH]:', msg);
    return {
      exercises: [],
      stats: { totalExercises: 0, systemExercises: 0, gymExercises: 0, muscleGroupsCount: 0 },
      currentGymId: null,
      error: msg,
    };
  }
}

/**
 * Thêm bài tập mới vào thư viện riêng của phòng gym
 */
export async function createCustomExercise(formData: FormData): Promise<{
  success: boolean;
  exercise?: ExerciseItem;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    const gymId = await getCurrentGymId(supabase, user.id);
    if (!gymId) {
      return { success: false, error: 'Không tìm thấy thông tin phòng gym hợp lệ.' };
    }

    const name = formData.get('name') as string;
    const primaryMuscleGroup = formData.get('primary_muscle_group') as string;
    const equipment = (formData.get('equipment') as string) || null;
    const difficulty = (formData.get('difficulty') as string) || 'intermediate';
    const instructions = (formData.get('instructions') as string) || null;

    if (!name || !name.trim()) {
      return { success: false, error: 'Tên bài tập không được để trống.' };
    }
    if (!primaryMuscleGroup || !primaryMuscleGroup.trim()) {
      return { success: false, error: 'Nhóm cơ chính không được để trống.' };
    }

    const { data: newExercise, error: insertError } = await supabase
      .from('exercises')
      .insert({
        gym_id: gymId,
        scope: 'gym',
        name: name.trim(),
        primary_muscle_group: primaryMuscleGroup.trim(),
        equipment: equipment ? equipment.trim() : null,
        difficulty: difficulty.trim(),
        instructions: instructions ? instructions.trim() : null,
        is_archived: false,
      })
      .select()
      .single();

    if (insertError) {
      console.warn('[CREATE EXERCISE ERROR]:', insertError.message);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/dashboard/workouts');
    return { success: true, exercise: newExercise as ExerciseItem };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[CREATE EXERCISE CATCH]:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Cập nhật bài tập riêng của phòng gym
 */
export async function updateCustomExercise(
  exerciseId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    const gymId = await getCurrentGymId(supabase, user.id);
    if (!gymId) {
      return { success: false, error: 'Không tìm thấy thông tin phòng gym hợp lệ.' };
    }

    const name = formData.get('name') as string;
    const primaryMuscleGroup = formData.get('primary_muscle_group') as string;
    const equipment = (formData.get('equipment') as string) || null;
    const difficulty = (formData.get('difficulty') as string) || 'intermediate';
    const instructions = (formData.get('instructions') as string) || null;

    if (!name || !name.trim()) {
      return { success: false, error: 'Tên bài tập không được để trống.' };
    }

    const { error: updateError } = await supabase
      .from('exercises')
      .update({
        name: name.trim(),
        primary_muscle_group: primaryMuscleGroup.trim(),
        equipment: equipment ? equipment.trim() : null,
        difficulty: difficulty.trim(),
        instructions: instructions ? instructions.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', exerciseId)
      .eq('gym_id', gymId)
      .eq('scope', 'gym');

    if (updateError) {
      console.warn('[UPDATE EXERCISE ERROR]:', updateError.message);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/dashboard/workouts');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[UPDATE EXERCISE CATCH]:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Xóa (lưu trữ) bài tập riêng của phòng gym
 */
export async function deleteCustomExercise(
  exerciseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    const gymId = await getCurrentGymId(supabase, user.id);
    if (!gymId) {
      return { success: false, error: 'Không tìm thấy thông tin phòng gym hợp lệ.' };
    }

    // Đánh dấu lưu trữ (is_archived = true) để bảo toàn dữ liệu lịch sử giáo án
    const { error: deleteError } = await supabase
      .from('exercises')
      .update({
        is_archived: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', exerciseId)
      .eq('gym_id', gymId)
      .eq('scope', 'gym');

    if (deleteError) {
      console.warn('[DELETE EXERCISE ERROR]:', deleteError.message);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/dashboard/workouts');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[DELETE EXERCISE CATCH]:', msg);
    return { success: false, error: msg };
  }
}

