/**
 * GM-1 TypeScript Data Models & RPC Payload Contracts
 * Multi-Tenant Gym Architecture: Gyms, Branches, GymStaff
 */

export type GymStatus = 'active' | 'suspended' | 'archived';

export type BranchStatus = 'active' | 'suspended' | 'archived';

export type StaffRole = 'owner' | 'manager' | 'receptionist' | 'trainer';

export type StaffStatus = 'invited' | 'active' | 'suspended' | 'revoked';

export interface Gym {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  status: GymStatus;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  gym_id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  status: BranchStatus;
  created_at: string;
  updated_at: string;
}

export interface GymStaff {
  id: string;
  gym_id: string;
  branch_id: string | null;
  user_id: string;
  role: StaffRole;
  status: StaffStatus;
  invited_at: string | null;
  activated_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGymPayload {
  name: string;
  slug: string;
  mainBranchName?: string;
  mainBranchSlug?: string;
  mainBranchAddress?: string;
  mainBranchPhone?: string;
}

export interface CreateGymResult {
  gym_id: string;
  branch_id: string;
  staff_id: string;
  name: string;
  slug: string;
}

export interface ManageBranchPayload {
  gymId: string;
  branchId?: string;
  name?: string;
  slug?: string;
  address?: string;
  phone?: string;
  status?: BranchStatus;
}

export interface ManageBranchResult {
  branch_id: string;
  gym_id: string;
  action: 'created' | 'updated';
  status: BranchStatus;
}

export type StaffAction = 'assign' | 'update_role' | 'revoke' | 'suspend' | 'activate';

export interface RevokeOrUpdateStaffPayload {
  gymId: string;
  staffUserId: string;
  action: StaffAction;
  branchId?: string;
  role?: StaffRole;
}

export interface RevokeOrUpdateStaffResult {
  gym_id: string;
  user_id: string;
  branch_id: string | null;
  action: StaffAction;
  status: StaffStatus;
  staff_id?: string;
}
