import { useApiMutation } from '@/shared/api/useApiMutation';
import { toast } from '@/shared/ui/toast';
import { adminRolesApi } from '../api/adminCategoriesApi';
import { adminCategoriesKeys, adminRolesKeys } from '../api/adminCategoriesKeys';
import type { RoleInput, RolePermissions, RoleStatus } from '../schemas/adminCategoryRole';

/** Every role write refreshes the lists, the role count card and the change history. */
const INVALIDATES = [adminRolesKeys.all, adminCategoriesKeys.summary(), ['audit-events']];

const STATUS_DONE: Record<RoleStatus, string> = {
  active: 'Role activated',
  inactive: 'Role deactivated'
};

export function useSetRoleStatus() {
  return useApiMutation({
    mutationFn: (vars: { roleId: string; status: RoleStatus }) =>
      adminRolesApi.setStatus(vars.roleId, vars.status),
    invalidates: INVALIDATES,
    onSuccess: (_data, vars) => toast.success(STATUS_DONE[vars.status])
  });
}

export function useCreateRole() {
  return useApiMutation({
    mutationFn: (body: RoleInput) => adminRolesApi.create(body),
    invalidates: INVALIDATES,
    successMessage: 'Role added'
  });
}

export function useUpdateRole(roleId: string) {
  return useApiMutation({
    mutationFn: (body: Partial<RoleInput>) => adminRolesApi.update(roleId, body),
    invalidates: INVALIDATES,
    successMessage: 'Role saved'
  });
}

export function useSetRolePermissions(roleId: string) {
  return useApiMutation({
    mutationFn: (permissions: RolePermissions) => adminRolesApi.setPermissions(roleId, permissions),
    invalidates: INVALIDATES,
    successMessage: 'Permissions saved'
  });
}

export function useDeleteRole() {
  return useApiMutation({
    mutationFn: (roleId: string) => adminRolesApi.remove(roleId),
    invalidates: INVALIDATES,
    successMessage: 'Role deleted'
  });
}
