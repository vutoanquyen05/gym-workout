'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type PlanType = 'fixed_period' | 'session_pack' | 'recurring' | 'membership' | 'pt_package' | 'combo';
export type PlanScope = 'all_branches' | 'single_branch';

export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  price: number;
  duration_days: number;
  session_limit: number | null;
  scope: PlanScope;
  plan_type: PlanType;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  active_members_count?: number;
}

/**
 * Lấy gym_id tương ứng với tài khoản người dùng đang đăng nhập
 */
async function resolveCurrentGymId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Kiểm tra quyền gym owner
  const { data: ownedGyms } = await supabase
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  if (ownedGyms && ownedGyms.length > 0) {
    return ownedGyms[0].id;
  }

  // 2. Kiểm tra quyền staff / manager
  const { data: staffRecords } = await supabase
    .from('gym_staff')
    .select('gym_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1);

  if (staffRecords && staffRecords.length > 0) {
    return staffRecords[0].gym_id;
  }

  // 3. Fallback lấy gym đầu tiên theo RLS
  const { data: anyGyms } = await supabase
    .from('gyms')
    .select('id')
    .limit(1);

  return anyGyms?.[0]?.id || null;
}

/**
 * Truy vấn danh sách gói tập của phòng gym kèm số lượng hội viên đang sử dụng
 */
export async function getMembershipPlans(): Promise<{
  data: MembershipPlan[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const gymId = await resolveCurrentGymId(supabase);

    if (!gymId) {
      return { data: [], error: 'Không tìm thấy thông tin phòng gym của bạn.' };
    }

    // Truy vấn danh mục gói tập
    const { data: plans, error: plansError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('gym_id', gymId)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false });

    if (plansError) {
      console.error('Lỗi truy vấn membership_plans:', plansError);
      return { data: [], error: plansError.message };
    }

    if (!plans || plans.length === 0) {
      return { data: [], error: null };
    }

    // Truy vấn số lượng thẻ memberships active gom nhóm theo plan_id
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('plan_id')
      .eq('gym_id', gymId)
      .eq('status', 'active');

    if (membershipsError) {
      console.warn('Lỗi thống kê memberships active:', membershipsError);
    }

    const countsMap = new Map<string, number>();
    (memberships || []).forEach((m) => {
      if (m.plan_id) {
        countsMap.set(m.plan_id, (countsMap.get(m.plan_id) || 0) + 1);
      }
    });

    const enrichedPlans: MembershipPlan[] = plans.map((p) => ({
      ...p,
      active_members_count: countsMap.get(p.id) || 0,
    }));

    return { data: enrichedPlans, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ không xác định';
    return { data: [], error: message };
  }
}

/**
 * Lấy thông tin chi tiết 1 gói tập theo ID
 */
export async function getMembershipPlanById(planId: string): Promise<{
  data: MembershipPlan | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle();

    if (error) {
      console.error('Lỗi getMembershipPlanById:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return { data: null, error: message };
  }
}

/**
 * Tạo gói tập mới
 */
export async function createMembershipPlan(formData: FormData): Promise<{
  success?: boolean;
  error?: string;
  planId?: string;
}> {
  try {
    const supabase = await createClient();
    const gymId = await resolveCurrentGymId(supabase);

    if (!gymId) {
      return { error: 'Không xác định được phòng gym của bạn.' };
    }

    const name = (formData.get('name') as string)?.trim();
    const priceStr = formData.get('price') as string;
    const durationDaysStr = formData.get('duration_days') as string;
    const sessionLimitStr = formData.get('session_limit') as string;
    const planTypeInput = (formData.get('plan_type') as string)?.trim() || 'fixed_period';
    const scopeInput = (formData.get('scope') as string)?.trim() || 'all_branches';
    const description = (formData.get('description') as string)?.trim() || null;
    const isActiveInput = formData.get('is_active');
    const isActive = isActiveInput === 'true' || isActiveInput === 'on';

    // Validate tên gói
    if (!name || name.length === 0) {
      return { error: 'Vui lòng nhập tên gói tập.' };
    }

    // Validate giá
    const price = parseInt(priceStr, 10);
    if (isNaN(price) || price < 0) {
      return { error: 'Đơn giá phải là số không âm (VNĐ).' };
    }

    // Validate thời hạn
    const durationDays = parseInt(durationDaysStr, 10);
    if (isNaN(durationDays) || durationDays <= 0) {
      return { error: 'Thời hạn hiệu lực phải lớn hơn 0 ngày.' };
    }

    // Validate số buổi tập
    let sessionLimit: number | null = null;
    if (planTypeInput === 'session_pack' || planTypeInput === 'pt_package') {
      const parsedLimit = parseInt(sessionLimitStr, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return { error: 'Gói PT / buổi tập yêu cầu nhập số buổi tập tối đa (lớn hơn 0).' };
      }
      sessionLimit = parsedLimit;
    } else if (sessionLimitStr && parseInt(sessionLimitStr, 10) > 0) {
      sessionLimit = parseInt(sessionLimitStr, 10);
    }

    const scope: PlanScope = scopeInput === 'single_branch' ? 'single_branch' : 'all_branches';

    // Thử insert với plan_type gốc, nếu gặp constraint violation ('membership', 'pt_package', 'combo') thì tự động map
    let insertType = planTypeInput;
    let { data, error } = await supabase
      .from('membership_plans')
      .insert({
        gym_id: gymId,
        name,
        price,
        duration_days: durationDays,
        session_limit: sessionLimit,
        scope,
        plan_type: insertType,
        description,
        is_active: isActive,
      })
      .select('id')
      .single();

    // Fallback mapping nếu DB áp dụng constraint cũ
    if (error && error.message.includes('membership_plans_plan_type_check')) {
      if (planTypeInput === 'fixed_period' || planTypeInput === 'recurring') {
        insertType = 'membership';
      } else if (planTypeInput === 'session_pack') {
        insertType = 'pt_package';
      }
      const retry = await supabase
        .from('membership_plans')
        .insert({
          gym_id: gymId,
          name,
          price,
          duration_days: durationDays,
          session_limit: sessionLimit,
          scope,
          plan_type: insertType,
          description,
          is_active: isActive,
        })
        .select('id')
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Lỗi tạo membership_plan:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/plans');
    revalidatePath('/dashboard');
    return { success: true, planId: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { error: message };
  }
}

/**
 * Cập nhật thông tin gói tập
 */
export async function updateMembershipPlan(
  planId: string,
  formData: FormData
): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const name = (formData.get('name') as string)?.trim();
    const priceStr = formData.get('price') as string;
    const durationDaysStr = formData.get('duration_days') as string;
    const sessionLimitStr = formData.get('session_limit') as string;
    const planTypeInput = (formData.get('plan_type') as string)?.trim() || 'fixed_period';
    const scopeInput = (formData.get('scope') as string)?.trim() || 'all_branches';
    const description = (formData.get('description') as string)?.trim() || null;
    const isActiveInput = formData.get('is_active');
    const isActive = isActiveInput === 'true' || isActiveInput === 'on';

    // Validate
    if (!name || name.length === 0) {
      return { error: 'Vui lòng nhập tên gói tập.' };
    }

    const price = parseInt(priceStr, 10);
    if (isNaN(price) || price < 0) {
      return { error: 'Đơn giá phải là số không âm (VNĐ).' };
    }

    const durationDays = parseInt(durationDaysStr, 10);
    if (isNaN(durationDays) || durationDays <= 0) {
      return { error: 'Thời hạn hiệu lực phải lớn hơn 0 ngày.' };
    }

    let sessionLimit: number | null = null;
    if (planTypeInput === 'session_pack' || planTypeInput === 'pt_package') {
      const parsedLimit = parseInt(sessionLimitStr, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return { error: 'Gói PT / buổi tập yêu cầu nhập số buổi tập tối đa (lớn hơn 0).' };
      }
      sessionLimit = parsedLimit;
    } else if (sessionLimitStr && parseInt(sessionLimitStr, 10) > 0) {
      sessionLimit = parseInt(sessionLimitStr, 10);
    }

    const scope: PlanScope = scopeInput === 'single_branch' ? 'single_branch' : 'all_branches';

    let updateType = planTypeInput;
    let { error } = await supabase
      .from('membership_plans')
      .update({
        name,
        price,
        duration_days: durationDays,
        session_limit: sessionLimit,
        scope,
        plan_type: updateType,
        description,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId);

    // Fallback nếu gặp constraint
    if (error && error.message.includes('membership_plans_plan_type_check')) {
      if (planTypeInput === 'fixed_period' || planTypeInput === 'recurring') {
        updateType = 'membership';
      } else if (planTypeInput === 'session_pack') {
        updateType = 'pt_package';
      }
      const retry = await supabase
        .from('membership_plans')
        .update({
          name,
          price,
          duration_days: durationDays,
          session_limit: sessionLimit,
          scope,
          plan_type: updateType,
          description,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);
      error = retry.error;
    }

    if (error) {
      console.error('Lỗi cập nhật membership_plan:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/plans');
    revalidatePath(`/dashboard/plans/${planId}/edit`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { error: message };
  }
}

/**
 * Bật / Tắt trạng thái mở bán của gói tập
 */
export async function togglePlanStatus(
  planId: string,
  isActive: boolean
): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('membership_plans')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId);

    if (error) {
      console.error('Lỗi togglePlanStatus:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/plans');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { error: message };
  }
}

