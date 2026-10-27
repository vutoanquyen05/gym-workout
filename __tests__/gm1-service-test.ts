import type { SupabaseClient } from '@supabase/supabase-js';

import { GymManagementService } from '../src/modules/gym-management';

describe('GymManagementService (GM-1 Unit Tests & RBAC Verification)', () => {
  let mockClient: jest.Mocked<Partial<SupabaseClient>>;
  let service: GymManagementService;

  beforeEach(() => {
    mockClient = {
      rpc: jest.fn(),
      from: jest.fn(),
    };
    service = new GymManagementService(mockClient as unknown as SupabaseClient);
  });

  describe('createGym', () => {
    it('successfully calls rpc_create_gym with normalized defaults', async () => {
      const mockResult = {
        gym_id: 'gym-123',
        branch_id: 'branch-456',
        staff_id: 'staff-789',
        name: 'Iron Fitness',
        slug: 'iron-fitness',
      };

      (mockClient.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await service.createGym({
        name: 'Iron Fitness',
        slug: 'iron-fitness',
      });

      expect(mockClient.rpc).toHaveBeenCalledWith('rpc_create_gym', {
        p_name: 'Iron Fitness',
        p_slug: 'iron-fitness',
        p_main_branch_name: 'Chi nhánh chính',
        p_main_branch_slug: 'main',
        p_main_branch_address: null,
        p_main_branch_phone: null,
      });
      expect(result).toEqual(mockResult);
    });

    it('throws error when rpc_create_gym returns error', async () => {
      (mockClient.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'duplicate key value violates unique constraint "gyms_slug_key"' },
      });

      await expect(
        service.createGym({
          name: 'Existing Gym',
          slug: 'existing-gym',
        }),
      ).rejects.toThrow('Failed to create gym: duplicate key value violates unique constraint "gyms_slug_key"');
    });
  });

  describe('manageBranch', () => {
    it('creates a new branch when branchId is omitted', async () => {
      const mockResult = {
        branch_id: 'branch-new-1',
        gym_id: 'gym-123',
        action: 'created',
        status: 'active',
      };

      (mockClient.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await service.manageBranch({
        gymId: 'gym-123',
        name: 'Quận 1',
        slug: 'quan-1',
        address: '123 Le Loi',
        phone: '0901234567',
      });

      expect(mockClient.rpc).toHaveBeenCalledWith('rpc_manage_branch', {
        p_gym_id: 'gym-123',
        p_branch_id: null,
        p_name: 'Quận 1',
        p_slug: 'quan-1',
        p_address: '123 Le Loi',
        p_phone: '0901234567',
        p_status: null,
      });
      expect(result).toEqual(mockResult);
    });

    it('updates existing branch when branchId is provided', async () => {
      const mockResult = {
        branch_id: 'branch-existing',
        gym_id: 'gym-123',
        action: 'updated',
        status: 'archived',
      };

      (mockClient.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await service.manageBranch({
        gymId: 'gym-123',
        branchId: 'branch-existing',
        status: 'archived',
      });

      expect(mockClient.rpc).toHaveBeenCalledWith('rpc_manage_branch', {
        p_gym_id: 'gym-123',
        p_branch_id: 'branch-existing',
        p_name: null,
        p_slug: null,
        p_address: null,
        p_phone: null,
        p_status: 'archived',
      });
      expect(result).toEqual(mockResult);
    });

    it('throws error when user is not authorized to manage branch', async () => {
      (mockClient.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Forbidden: Only active gym owner can manage branches' },
      });

      await expect(
        service.manageBranch({
          gymId: 'gym-other',
          name: 'Hacked Branch',
          slug: 'hacked',
        }),
      ).rejects.toThrow('Failed to manage branch: Forbidden: Only active gym owner can manage branches');
    });
  });

  describe('revokeOrUpdateStaff (OD-02=A Mutual Exclusivity & Zero Hard Delete)', () => {
    it('successfully assigns a trainer to a specific branch', async () => {
      const mockResult = {
        gym_id: 'gym-123',
        user_id: 'user-pt-1',
        branch_id: 'branch-456',
        action: 'assign',
        status: 'active',
        staff_id: 'staff-pt-1',
      };

      (mockClient.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await service.revokeOrUpdateStaff({
        gymId: 'gym-123',
        staffUserId: 'user-pt-1',
        action: 'assign',
        branchId: 'branch-456',
        role: 'trainer',
      });

      expect(mockClient.rpc).toHaveBeenCalledWith('rpc_revoke_or_update_staff', {
        p_gym_id: 'gym-123',
        p_staff_user_id: 'user-pt-1',
        p_action: 'assign',
        p_branch_id: 'branch-456',
        p_role: 'trainer',
      });
      expect(result).toEqual(mockResult);
    });

    it('successfully soft-revokes staff rights without hard deletion', async () => {
      const mockResult = {
        gym_id: 'gym-123',
        user_id: 'user-pt-1',
        branch_id: 'branch-456',
        action: 'revoke',
        status: 'revoked',
      };

      (mockClient.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await service.revokeOrUpdateStaff({
        gymId: 'gym-123',
        staffUserId: 'user-pt-1',
        action: 'revoke',
        branchId: 'branch-456',
      });

      expect(mockClient.rpc).toHaveBeenCalledWith('rpc_revoke_or_update_staff', {
        p_gym_id: 'gym-123',
        p_staff_user_id: 'user-pt-1',
        p_action: 'revoke',
        p_branch_id: 'branch-456',
        p_role: null,
      });
      expect(result.status).toBe('revoked');
    });

    it('propagates Mutual Exclusivity conflict error from RPC', async () => {
      (mockClient.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Conflict: User already holds active global gym role' },
      });

      await expect(
        service.revokeOrUpdateStaff({
          gymId: 'gym-123',
          staffUserId: 'user-manager-global',
          action: 'assign',
          branchId: 'branch-456',
          role: 'trainer',
        }),
      ).rejects.toThrow('Failed to manage staff: Conflict: User already holds active global gym role');
    });
  });

  describe('Query operations (Fail-Closed SELECT)', () => {
    it('fetches gyms list', async () => {
      const mockGyms = [
        { id: 'gym-1', name: 'Gym 1', slug: 'gym-1', owner_id: 'u-1', status: 'active' },
      ];

      const selectMock = jest.fn().mockReturnThis();
      const orderMock = jest.fn().mockResolvedValueOnce({ data: mockGyms, error: null });

      (mockClient.from as jest.Mock).mockReturnValue({
        select: selectMock,
        order: orderMock,
      });

      const gyms = await service.getGyms();

      expect(mockClient.from).toHaveBeenCalledWith('gyms');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(gyms).toEqual(mockGyms);
    });

    it('fetches branches for a gym', async () => {
      const mockBranches = [
        { id: 'b-1', gym_id: 'gym-1', name: 'Branch 1', slug: 'b-1', status: 'active' },
      ];

      const selectMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockReturnThis();
      const orderMock = jest.fn().mockResolvedValueOnce({ data: mockBranches, error: null });

      (mockClient.from as jest.Mock).mockReturnValue({
        select: selectMock,
        eq: eqMock,
        order: orderMock,
      });

      const branches = await service.getBranchesByGym('gym-1');

      expect(mockClient.from).toHaveBeenCalledWith('branches');
      expect(eqMock).toHaveBeenCalledWith('gym_id', 'gym-1');
      expect(branches).toEqual(mockBranches);
    });
  });
});
