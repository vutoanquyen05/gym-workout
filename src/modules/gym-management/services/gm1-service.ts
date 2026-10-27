import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  Gym,
  Branch,
  GymStaff,
  CreateGymPayload,
  CreateGymResult,
  ManageBranchPayload,
  ManageBranchResult,
  RevokeOrUpdateStaffPayload,
  RevokeOrUpdateStaffResult,
} from '../types/gm1-types';

export class GymManagementService {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Tạo Gym mới kèm Branch chính mặc định và thiết lập Owner role
   */
  async createGym(payload: CreateGymPayload): Promise<CreateGymResult> {
    const { data, error } = await this.client.rpc('rpc_create_gym', {
      p_name: payload.name,
      p_slug: payload.slug,
      p_main_branch_name: payload.mainBranchName ?? 'Chi nhánh chính',
      p_main_branch_slug: payload.mainBranchSlug ?? 'main',
      p_main_branch_address: payload.mainBranchAddress ?? null,
      p_main_branch_phone: payload.mainBranchPhone ?? null,
    });

    if (error) {
      throw new Error(`Failed to create gym: ${error.message}`);
    }

    return data as CreateGymResult;
  }

  /**
   * Tạo mới hoặc cập nhật thông tin/trạng thái Chi nhánh
   */
  async manageBranch(payload: ManageBranchPayload): Promise<ManageBranchResult> {
    const { data, error } = await this.client.rpc('rpc_manage_branch', {
      p_gym_id: payload.gymId,
      p_branch_id: payload.branchId ?? null,
      p_name: payload.name ?? null,
      p_slug: payload.slug ?? null,
      p_address: payload.address ?? null,
      p_phone: payload.phone ?? null,
      p_status: payload.status ?? null,
    });

    if (error) {
      throw new Error(`Failed to manage branch: ${error.message}`);
    }

    return data as ManageBranchResult;
  }

  /**
   * Phân công, cập nhật hoặc thu hồi quyền nhân viên (OD-02=A Mutual Exclusivity & Zero Hard Delete)
   */
  async revokeOrUpdateStaff(payload: RevokeOrUpdateStaffPayload): Promise<RevokeOrUpdateStaffResult> {
    const { data, error } = await this.client.rpc('rpc_revoke_or_update_staff', {
      p_gym_id: payload.gymId,
      p_staff_user_id: payload.staffUserId,
      p_action: payload.action,
      p_branch_id: payload.branchId ?? null,
      p_role: payload.role ?? null,
    });

    if (error) {
      throw new Error(`Failed to manage staff: ${error.message}`);
    }

    return data as RevokeOrUpdateStaffResult;
  }

  /**
   * Truy vấn danh sách gyms mà caller có quyền xem
   */
  async getGyms(): Promise<Gym[]> {
    const { data, error } = await this.client
      .from('gyms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch gyms: ${error.message}`);
    }

    return (data ?? []) as Gym[];
  }

  /**
   * Truy vấn chi tiết gym theo ID
   */
  async getGymById(gymId: string): Promise<Gym | null> {
    const { data, error } = await this.client
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch gym by id: ${error.message}`);
    }

    return data as Gym | null;
  }

  /**
   * Truy vấn danh sách chi nhánh theo gym
   */
  async getBranchesByGym(gymId: string): Promise<Branch[]> {
    const { data, error } = await this.client
      .from('branches')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }

    return (data ?? []) as Branch[];
  }

  /**
   * Truy vấn danh sách nhân sự của gym
   */
  async getStaffByGym(gymId: string): Promise<GymStaff[]> {
    const { data, error } = await this.client
      .from('gym_staff')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch gym staff: ${error.message}`);
    }

    return (data ?? []) as GymStaff[];
  }
}
