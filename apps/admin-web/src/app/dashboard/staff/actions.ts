'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type StaffRole = 'owner' | 'manager' | 'receptionist' | 'trainer';
export type StaffStatus = 'invited' | 'active' | 'suspended' | 'revoked';

export interface StaffMember {
  id: string;
  gym_id: string;
  branch_id: string | null;
  branch_name?: string;
  user_id: string | null;
  role: StaffRole;
  status: StaffStatus;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  assigned_members_count?: number;
}

export interface BranchOption {
  id: string;
  name: string;
}

/**
 * Lấy gym_id tương ứng với tài khoản người dùng đang đăng nhập
 */
async function resolveCurrentGymId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Kiểm tra gym do user làm owner
  const { data: ownedGyms } = await supabase
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  if (ownedGyms && ownedGyms.length > 0) {
    return ownedGyms[0].id;
  }

  // 2. Kiểm tra nhân sự trong gym_staff
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
 * Lấy danh sách nhân sự của phòng gym kèm tên chi nhánh và số lượng học viên phụ trách
 */
export async function getStaffMembers(): Promise<{
  data: StaffMember[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const gymId = await resolveCurrentGymId(supabase);

    if (!gymId) {
      return { data: [], error: 'Không tìm thấy thông tin phòng gym của bạn.' };
    }

    // 1. Truy vấn danh sách gym_staff
    const { data: staffList, error: staffError } = await supabase
      .from('gym_staff')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (staffError) {
      console.error('Lỗi getStaffMembers:', staffError);
      return { data: [], error: staffError.message };
    }

    if (!staffList || staffList.length === 0) {
      return { data: [], error: null };
    }

    // 2. Truy vấn danh sách chi nhánh để map tên
    const { data: branches } = await supabase
      .from('branches')
      .select('id, name')
      .eq('gym_id', gymId);

    const branchMap = new Map<string, string>();
    (branches || []).forEach((b) => branchMap.set(b.id, b.name));

    // 3. Truy vấn số hội viên đang gán cho từng PT (từ gym_members.assigned_pt_id)
    const { data: assignedMembers, error: assignedError } = await supabase
      .from('gym_members')
      .select('assigned_pt_id')
      .eq('gym_id', gymId)
      .not('assigned_pt_id', 'is', null);

    if (assignedError) {
      console.warn('Lỗi thống kê assigned members:', assignedError);
    }

    const countsMap = new Map<string, number>();
    (assignedMembers || []).forEach((m) => {
      if (m.assigned_pt_id) {
        countsMap.set(m.assigned_pt_id, (countsMap.get(m.assigned_pt_id) || 0) + 1);
      }
    });

    const enrichedStaff: StaffMember[] = staffList.map((s) => ({
      ...s,
      branch_name: s.branch_id ? branchMap.get(s.branch_id) || 'Chi nhánh khác' : 'Toàn hệ thống',
      assigned_members_count: countsMap.get(s.id) || 0,
    }));

    return { data: enrichedStaff, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ không xác định';
    return { data: [], error: message };
  }
}

/**
 * Lấy chi tiết 1 nhân sự theo ID
 */
export async function getStaffById(staffId: string): Promise<{
  data: StaffMember | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('gym_staff')
      .select('*')
      .eq('id', staffId)
      .maybeSingle();

    if (error) {
      console.error('Lỗi getStaffById:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return { data: null, error: message };
  }
}

/**
 * Lấy danh sách chi nhánh hoạt động để chọn trong form
 */
export async function getActiveBranchesForStaff(): Promise<{
  data: BranchOption[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const gymId = await resolveCurrentGymId(supabase);

    if (!gymId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('branches')
      .select('id, name')
      .eq('gym_id', gymId)
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Lỗi getActiveBranchesForStaff:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { data: [], error: message };
  }
}

/**
 * Thêm mới nhân sự / PT vào hệ thống
 */
export async function createStaffMember(formData: FormData): Promise<{
  success?: boolean;
  error?: string;
  staffId?: string;
}> {
  try {
    const supabase = await createClient();
    const gymId = await resolveCurrentGymId(supabase);

    if (!gymId) {
      return { error: 'Không xác định được phòng gym của bạn.' };
    }

    const fullName = (formData.get('full_name') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim() || null;
    const email = (formData.get('email') as string)?.trim() || null;
    const roleInput = (formData.get('role') as string)?.trim() || 'trainer';
    const branchIdInput = (formData.get('branch_id') as string)?.trim();
    const specialty = (formData.get('specialty') as string)?.trim() || null;
    const bio = (formData.get('bio') as string)?.trim() || null;
    const statusInput = (formData.get('status') as string)?.trim() || 'active';

    if (!fullName || fullName.length === 0) {
      return { error: 'Vui lòng nhập họ và tên nhân sự / PT.' };
    }

    const branchId = branchIdInput && branchIdInput !== '' ? branchIdInput : null;
    const role: StaffRole = ['owner', 'manager', 'receptionist', 'trainer'].includes(roleInput)
      ? (roleInput as StaffRole)
      : 'trainer';
    const status: StaffStatus = ['invited', 'active', 'suspended', 'revoked'].includes(statusInput)
      ? (statusInput as StaffStatus)
      : 'active';

    const { data, error } = await supabase
      .from('gym_staff')
      .insert({
        gym_id: gymId,
        branch_id: branchId,
        user_id: null,
        role,
        status,
        full_name: fullName,
        phone,
        email,
        specialty,
        bio,
        activated_at: status === 'active' ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Lỗi createStaffMember:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/staff');
    revalidatePath('/dashboard');
    return { success: true, staffId: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { error: message };
  }
}

/**
 * Cập nhật hồ sơ nhân sự / PT
 */
export async function updateStaffMember(
  staffId: string,
  formData: FormData
): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const fullName = (formData.get('full_name') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim() || null;
    const email = (formData.get('email') as string)?.trim() || null;
    const roleInput = (formData.get('role') as string)?.trim() || 'trainer';
    const branchIdInput = (formData.get('branch_id') as string)?.trim();
    const specialty = (formData.get('specialty') as string)?.trim() || null;
    const bio = (formData.get('bio') as string)?.trim() || null;
    const statusInput = (formData.get('status') as string)?.trim() || 'active';

    if (!fullName || fullName.length === 0) {
      return { error: 'Vui lòng nhập họ và tên nhân sự / PT.' };
    }

    const branchId = branchIdInput && branchIdInput !== '' ? branchIdInput : null;
    const role: StaffRole = ['owner', 'manager', 'receptionist', 'trainer'].includes(roleInput)
      ? (roleInput as StaffRole)
      : 'trainer';
    const status: StaffStatus = ['invited', 'active', 'suspended', 'revoked'].includes(statusInput)
      ? (statusInput as StaffStatus)
      : 'active';

    const { error } = await supabase
      .from('gym_staff')
      .update({
        branch_id: branchId,
        role,
        status,
        full_name: fullName,
        phone,
        email,
        specialty,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', staffId);

    if (error) {
      console.error('Lỗi updateStaffMember:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/staff');
    revalidatePath(`/dashboard/staff/${staffId}/edit`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { error: message };
  }
}

/**
 * Cập nhật nhanh trạng thái nhân sự (active, suspended, revoked)
 */
export async function updateStaffStatus(
  staffId: string,
  status: StaffStatus
): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'revoked') {
      updatePayload.revoked_at = new Date().toISOString();
    } else if (status === 'active') {
      updatePayload.activated_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('gym_staff')
      .update(updatePayload)
      .eq('id', staffId);

    if (error) {
      console.error('Lỗi updateStaffStatus:', error);
      return { error: error.message };
    }

    revalidatePath('/dashboard/staff');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return { error: message };
  }
}

