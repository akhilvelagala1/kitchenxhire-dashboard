import { useApiMutation } from '@/shared/api/useApiMutation';
import { toast } from '@/shared/ui/toast';
import { adminUsersApi } from '../api/adminUsersApi';
import { adminUsersKeys } from '../api/adminUsersKeys';
import type { UserInput, UserSettableStatus } from '../schemas/adminUser';

/** Every write refreshes the lists, the summary cards and the tab counts. */
const INVALIDATES = [adminUsersKeys.all];

export function useCreateUser() {
  return useApiMutation({
    mutationFn: (body: UserInput) => adminUsersApi.create(body),
    invalidates: INVALIDATES,
    successMessage: (user) => `Invite sent to ${user.email}`
  });
}

export function useUpdateUser(userId: string) {
  return useApiMutation({
    mutationFn: (body: Partial<UserInput>) => adminUsersApi.update(userId, body),
    invalidates: INVALIDATES,
    successMessage: 'User saved'
  });
}

const STATUS_DONE: Record<UserSettableStatus, string> = {
  active: 'User activated',
  inactive: 'User deactivated',
  suspended: 'User suspended'
};

export function useSetUserStatus() {
  return useApiMutation({
    mutationFn: (vars: { userId: string; status: UserSettableStatus }) =>
      adminUsersApi.setStatus(vars.userId, vars.status),
    invalidates: INVALIDATES,
    onSuccess: (_data, vars) => toast.success(STATUS_DONE[vars.status])
  });
}

export function useBulkSetUserStatus() {
  return useApiMutation({
    mutationFn: (vars: { userIds: string[]; status: UserSettableStatus }) =>
      adminUsersApi.bulkSetStatus(vars.userIds, vars.status),
    invalidates: INVALIDATES,
    successMessage: ({ affected }) => `${affected} ${affected === 1 ? 'user' : 'users'} updated`
  });
}
