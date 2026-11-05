'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// =============================================================================
// TYPES: TẦNG 1 — BÀI TẬP (EXERCISES CATALOG)
// =============================================================================

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

// =============================================================================
// TYPES: TẦNG 2 & TẦNG 3 — GIÁO ÁN MẪU VÀ GIÁO ÁN ĐÃ GIAO HỌC VIÊN
// =============================================================================

export interface ProgramDayExerciseItem {
  id: string;
  program_day_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: string;
  rpe_target: number | null;
  rest_seconds: number | null;
  coach_notes: string | null;
  exercise?: {
    id: string;
    name: string;
    primary_muscle_group: string;
    equipment: string | null;
    difficulty: string | null;
  };
}

export interface ProgramDayItem {
  id: string;
  gym_id: string;
  program_id: string;
  day_number: number;
  day_name: string;
  target_muscle_groups: string[];
  notes: string | null;
  exercises: ProgramDayExerciseItem[];
}

export interface WorkoutProgramItem {
  id: string;
  gym_id: string;
  is_template: boolean;
  assigned_member_id: string | null;
  created_by_staff_id: string | null;
  title: string;
  description: string | null;
  duration_weeks: number | null;
  difficulty_level: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  days: ProgramDayItem[];
  member?: {
    id: string;
    full_name: string;
    member_code: string;
    phone: string;
    gender: string | null;
  } | null;
  staff?: {
    id: string;
    full_name: string;
    role: string;
  } | null;
}

export interface GymMemberSimple {
  id: string;
  full_name: string;
  member_code: string;
  phone: string;
  status: string;
}

export interface GymStaffSimple {
  id: string;
  full_name: string;
  role: string;
  status: string;
}

export interface WorkoutStudioFullData {
  catalog: ExerciseCatalogData;
  templates: WorkoutProgramItem[];
  assignedPrograms: WorkoutProgramItem[];
  members: GymMemberSimple[];
  staff: GymStaffSimple[];
  currentGymId: string | null;
  error: string | null;
}

// =============================================================================
// HELPER: XÁC ĐỊNH GYM_ID
// =============================================================================

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

// =============================================================================
// TẦNG 1 ACTIONS: BÀI TẬP (EXERCISES CATALOG)
// =============================================================================

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

// =============================================================================
// STUDIO ACTIONS: TRUY VẤN TOÀN DIỆN 3 TẦNG (WORKOUT STUDIO FULL DATA)
// =============================================================================

export async function getWorkoutStudioFullData(): Promise<WorkoutStudioFullData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        catalog: {
          exercises: [],
          stats: { totalExercises: 0, systemExercises: 0, gymExercises: 0, muscleGroupsCount: 0 },
          currentGymId: null,
          error: 'Bạn chưa đăng nhập hệ thống.',
        },
        templates: [],
        assignedPrograms: [],
        members: [],
        staff: [],
        currentGymId: null,
        error: 'Bạn chưa đăng nhập hệ thống.',
      };
    }

    const gymId = await getCurrentGymId(supabase, user.id);

    // 1. Lấy dữ liệu catalog Tầng 1
    const catalogData = await getExercisesCatalogData();

    // 2. Truy vấn toàn bộ workout_programs thuộc gym
    const programsQuery = supabase
      .from('workout_programs')
      .select(`
        id,
        gym_id,
        is_template,
        assigned_member_id,
        created_by_staff_id,
        title,
        description,
        duration_weeks,
        difficulty_level,
        status,
        created_at,
        updated_at,
        member:gym_members(id, full_name, member_code, phone, gender),
        staff:gym_staff(id, full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (gymId) {
      programsQuery.eq('gym_id', gymId);
    }

    const { data: rawPrograms, error: programsError } = await programsQuery;

    if (programsError) {
      console.warn('[WORKOUT PROGRAMS QUERY WARN]:', programsError.message);
    }

    const programsList = rawPrograms || [];
    const programIds = programsList.map((p) => p.id);

    // 3. Truy vấn các buổi tập (program_days) của tất cả programs tìm thấy
    let daysList: any[] = [];
    if (programIds.length > 0) {
      const { data: rawDays, error: daysError } = await supabase
        .from('program_days')
        .select(`
          id,
          gym_id,
          program_id,
          day_number,
          day_name,
          target_muscle_groups,
          notes
        `)
        .in('program_id', programIds)
        .order('day_number', { ascending: true });

      if (daysError) {
        console.warn('[PROGRAM DAYS QUERY WARN]:', daysError.message);
      } else {
        daysList = rawDays || [];
      }
    }

    // 4. Truy vấn các bài tập trong từng buổi (program_day_exercises) kèm chi tiết bài tập
    const dayIds = daysList.map((d) => d.id);
    let exercisesMap: Record<string, ProgramDayExerciseItem[]> = {};

    if (dayIds.length > 0) {
      const { data: rawExercises, error: pdeError } = await supabase
        .from('program_day_exercises')
        .select(`
          id,
          program_day_id,
          exercise_id,
          order_index,
          sets,
          reps,
          rpe_target,
          rest_seconds,
          coach_notes,
          exercise:exercises(id, name, primary_muscle_group, equipment, difficulty)
        `)
        .in('program_day_id', dayIds)
        .order('order_index', { ascending: true });

      if (pdeError) {
        console.warn('[PROGRAM DAY EXERCISES QUERY WARN]:', pdeError.message);
      } else if (rawExercises) {
        rawExercises.forEach((item: any) => {
          if (!exercisesMap[item.program_day_id]) {
            exercisesMap[item.program_day_id] = [];
          }
          exercisesMap[item.program_day_id].push({
            id: item.id,
            program_day_id: item.program_day_id,
            exercise_id: item.exercise_id,
            order_index: item.order_index,
            sets: item.sets,
            reps: item.reps,
            rpe_target: item.rpe_target ? Number(item.rpe_target) : null,
            rest_seconds: item.rest_seconds,
            coach_notes: item.coach_notes,
            exercise: item.exercise ? (Array.isArray(item.exercise) ? item.exercise[0] : item.exercise) : undefined,
          });
        });
      }
    }

    // 5. Tổ chức cấu trúc phân cấp (Hierarchical Tree)
    const daysByProgram: Record<string, ProgramDayItem[]> = {};
    daysList.forEach((d) => {
      if (!daysByProgram[d.program_id]) {
        daysByProgram[d.program_id] = [];
      }
      daysByProgram[d.program_id].push({
        id: d.id,
        gym_id: d.gym_id,
        program_id: d.program_id,
        day_number: d.day_number,
        day_name: d.day_name,
        target_muscle_groups: d.target_muscle_groups || [],
        notes: d.notes,
        exercises: exercisesMap[d.id] || [],
      });
    });

    const templates: WorkoutProgramItem[] = [];
    const assignedPrograms: WorkoutProgramItem[] = [];

    programsList.forEach((p: any) => {
      const formattedItem: WorkoutProgramItem = {
        id: p.id,
        gym_id: p.gym_id,
        is_template: p.is_template,
        assigned_member_id: p.assigned_member_id,
        created_by_staff_id: p.created_by_staff_id,
        title: p.title,
        description: p.description,
        duration_weeks: p.duration_weeks,
        difficulty_level: p.difficulty_level,
        status: p.status,
        created_at: p.created_at,
        updated_at: p.updated_at,
        days: daysByProgram[p.id] || [],
        member: p.member ? (Array.isArray(p.member) ? p.member[0] : p.member) : null,
        staff: p.staff ? (Array.isArray(p.staff) ? p.staff[0] : p.staff) : null,
      };

      if (p.is_template) {
        templates.push(formattedItem);
      } else {
        assignedPrograms.push(formattedItem);
      }
    });

    // 6. Lấy danh sách hội viên active để giao giáo án
    const membersQuery = supabase
      .from('gym_members')
      .select('id, full_name, member_code, phone, status')
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (gymId) {
      membersQuery.eq('gym_id', gymId);
    }
    const { data: rawMembers } = await membersQuery;

    // 7. Lấy danh sách nhân viên active để phân công PT
    const staffQuery = supabase
      .from('gym_staff')
      .select('id, full_name, role, status')
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (gymId) {
      staffQuery.eq('gym_id', gymId);
    }
    const { data: rawStaff } = await staffQuery;

    return {
      catalog: catalogData,
      templates,
      assignedPrograms,
      members: (rawMembers || []) as GymMemberSimple[],
      staff: (rawStaff || []) as GymStaffSimple[],
      currentGymId: gymId,
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[GET WORKOUT STUDIO FULL DATA CATCH]:', msg);
    return {
      catalog: {
        exercises: [],
        stats: { totalExercises: 0, systemExercises: 0, gymExercises: 0, muscleGroupsCount: 0 },
        currentGymId: null,
        error: msg,
      },
      templates: [],
      assignedPrograms: [],
      members: [],
      staff: [],
      currentGymId: null,
      error: msg,
    };
  }
}

// =============================================================================
// TẦNG 2 ACTIONS: KHUNG GIÁO ÁN MẪU (PROGRAM TEMPLATES CRUD)
// =============================================================================

export async function createProgramTemplate(formData: FormData): Promise<{
  success: boolean;
  program?: WorkoutProgramItem;
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
      return { success: false, error: 'Không tìm thấy phòng gym hợp lệ.' };
    }

    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || null;
    const durationWeeks = Number(formData.get('duration_weeks') || 4);
    const difficultyLevel = (formData.get('difficulty_level') as string) || 'intermediate';

    if (!title || !title.trim()) {
      return { success: false, error: 'Tên giáo án mẫu không được để trống.' };
    }

    const { data: newProgram, error: insertError } = await supabase
      .from('workout_programs')
      .insert({
        gym_id: gymId,
        is_template: true,
        title: title.trim(),
        description: description ? description.trim() : null,
        duration_weeks: durationWeeks,
        difficulty_level: difficultyLevel,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.warn('[CREATE PROGRAM TEMPLATE ERROR]:', insertError.message);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/dashboard/workouts');
    return {
      success: true,
      program: {
        ...newProgram,
        days: [],
      } as WorkoutProgramItem,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[CREATE PROGRAM TEMPLATE CATCH]:', msg);
    return { success: false, error: msg };
  }
}

export async function deleteProgramTemplate(
  programId: string
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
      return { success: false, error: 'Không tìm thấy phòng gym hợp lệ.' };
    }

    const { error: deleteError } = await supabase
      .from('workout_programs')
      .delete()
      .eq('id', programId)
      .eq('gym_id', gymId)
      .eq('is_template', true);

    if (deleteError) {
      console.warn('[DELETE PROGRAM TEMPLATE ERROR]:', deleteError.message);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/dashboard/workouts');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[DELETE PROGRAM TEMPLATE CATCH]:', msg);
    return { success: false, error: msg };
  }
}

export async function addProgramDay(
  programId: string,
  formData: FormData
): Promise<{ success: boolean; day?: ProgramDayItem; error?: string }> {
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
      return { success: false, error: 'Không tìm thấy phòng gym hợp lệ.' };
    }

    const dayNumber = Number(formData.get('day_number') || 1);
    const dayName = formData.get('day_name') as string;
    const targetMuscleGroupsRaw = (formData.get('target_muscle_groups') as string) || '';
    const notes = (formData.get('notes') as string) || null;

    if (!dayName || !dayName.trim()) {
      return { success: false, error: 'Tên buổi tập không được để trống.' };
    }

    const targetMuscleGroups = targetMuscleGroupsRaw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const { data: newDay, error: insertError } = await supabase
      .from('program_days')
      .insert({
        gym_id: gymId,
        program_id: programId,
        day_number: dayNumber,
        day_name: dayName.trim(),
        target_muscle_groups: targetMuscleGroups,
        notes: notes ? notes.trim() : null,
      })
      .select()
      .single();

    if (insertError) {
      console.warn('[ADD PROGRAM DAY ERROR]:', insertError.message);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/dashboard/workouts');
    return {
      success: true,
      day: {
        ...newDay,
        exercises: [],
      } as ProgramDayItem,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[ADD PROGRAM DAY CATCH]:', msg);
    return { success: false, error: msg };
  }
}

export async function deleteProgramDay(
  dayId: string
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
      return { success: false, error: 'Không tìm thấy phòng gym hợp lệ.' };
    }

    const { error: deleteError } = await supabase
      .from('program_days')
      .delete()
      .eq('id', dayId)
      .eq('gym_id', gymId);

    if (deleteError) {
      console.warn('[DELETE PROGRAM DAY ERROR]:', deleteError.message);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/dashboard/workouts');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[DELETE PROGRAM DAY CATCH]:', msg);
    return { success: false, error: msg };
  }
}

export async function addExerciseToProgramDay(
  dayId: string,
  formData: FormData
): Promise<{ success: boolean; item?: ProgramDayExerciseItem; error?: string }> {
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
      return { success: false, error: 'Không tìm thấy phòng gym hợp lệ.' };
    }

    const exerciseId = formData.get('exercise_id') as string;
    const sets = Number(formData.get('sets') || 3);
    const reps = (formData.get('reps') as string) || '10-12';
    const rpeTarget = formData.get('rpe_target') ? Number(formData.get('rpe_target')) : null;
    const restSeconds = formData.get('rest_seconds') ? Number(formData.get('rest_seconds')) : 60;
    const coachNotes = (formData.get('coach_notes') as string) || null;

    if (!exerciseId) {
      return { success: false, error: 'Vui lòng chọn bài tập kỹ thuật.' };
    }

    // Đếm số bài tập hiện tại trong buổi để đặt order_index
    const { count } = await supabase
      .from('program_day_exercises')
      .select('id', { count: 'exact', head: true })
      .eq('program_day_id', dayId);

    const orderIndex = (count || 0) + 1;

    const { data: newItem, error: insertError } = await supabase
      .from('program_day_exercises')
      .insert({
        gym_id: gymId,
        program_day_id: dayId,
        exercise_id: exerciseId,
        order_index: orderIndex,
        sets,
        reps: reps.trim(),
        rpe_target: rpeTarget,
        rest_seconds: restSeconds,
        coach_notes: coachNotes ? coachNotes.trim() : null,
      })
      .select(`
        id,
        program_day_id,
        exercise_id,
        order_index,
        sets,
        reps,
        rpe_target,
        rest_seconds,
        coach_notes,
        exercise:exercises(id, name, primary_muscle_group, equipment, difficulty)
      `)
      .single();

    if (insertError) {
      console.warn('[ADD EXERCISE TO DAY ERROR]:', insertError.message);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/dashboard/workouts');
    return {
      success: true,
      item: {
        ...newItem,
        exercise: newItem.exercise ? (Array.isArray(newItem.exercise) ? newItem.exercise[0] : newItem.exercise) : undefined,
      } as ProgramDayExerciseItem,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[ADD EXERCISE TO DAY CATCH]:', msg);
    return { success: false, error: msg };
  }
}

export async function removeExerciseFromProgramDay(
  itemId: string
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
      return { success: false, error: 'Không tìm thấy phòng gym hợp lệ.' };
    }

    const { error: deleteError } = await supabase
      .from('program_day_exercises')
      .delete()
      .eq('id', itemId)
      .eq('gym_id', gymId);

    if (deleteError) {
      console.warn('[REMOVE EXERCISE FROM DAY ERROR]:', deleteError.message);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/dashboard/workouts');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[REMOVE EXERCISE FROM DAY CATCH]:', msg);
    return { success: false, error: msg };
  }
}

// =============================================================================
// TẦNG 3 ACTIONS: GIAO GIÁO ÁN VÀ QUẢN LÝ LỘ TRÌNH HỌC VIÊN
// =============================================================================

export async function assignProgramToMember(
  templateId: string,
  memberId: string,
  staffId?: string
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    if (!templateId || !memberId) {
      return { success: false, error: 'Thiếu thông tin giáo án mẫu hoặc hội viên tiếp nhận.' };
    }

    // Gọi Transactional RPC rpc_assign_program_template đã triển khai trên DB
    const { data: rpcResult, error: rpcError } = await supabase.rpc('rpc_assign_program_template', {
      p_template_id: templateId,
      p_member_id: memberId,
      p_staff_id: staffId || null,
    });

    if (rpcError) {
      console.warn('[RPC ASSIGN PROGRAM ERROR]:', rpcError.message);
      return { success: false, error: rpcError.message };
    }

    if (rpcResult && !rpcResult.success) {
      return { success: false, error: rpcResult.message || 'Giao giáo án không thành công.' };
    }

    revalidatePath('/dashboard/workouts');
    revalidatePath(`/dashboard/members/${memberId}`);
    return { success: true, result: rpcResult };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[ASSIGN PROGRAM CATCH]:', msg);
    return { success: false, error: msg };
  }
}

export async function updateAssignedProgramStatus(
  programId: string,
  status: 'active' | 'completed' | 'archived'
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
      return { success: false, error: 'Không tìm thấy phòng gym hợp lệ.' };
    }

    const { error: updateError } = await supabase
      .from('workout_programs')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId)
      .eq('gym_id', gymId)
      .eq('is_template', false);

    if (updateError) {
      console.warn('[UPDATE ASSIGNED PROGRAM STATUS ERROR]:', updateError.message);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/dashboard/workouts');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[UPDATE ASSIGNED PROGRAM STATUS CATCH]:', msg);
    return { success: false, error: msg };
  }
}

export async function deleteAssignedProgram(
  programId: string
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
      return { success: false, error: 'Không tìm thấy phòng gym hợp lệ.' };
    }

    const { error: deleteError } = await supabase
      .from('workout_programs')
      .delete()
      .eq('id', programId)
      .eq('gym_id', gymId)
      .eq('is_template', false);

    if (deleteError) {
      console.warn('[DELETE ASSIGNED PROGRAM ERROR]:', deleteError.message);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/dashboard/workouts');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.warn('[DELETE ASSIGNED PROGRAM CATCH]:', msg);
    return { success: false, error: msg };
  }
}
