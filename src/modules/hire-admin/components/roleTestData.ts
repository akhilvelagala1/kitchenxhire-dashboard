import {
  PERMISSION_MODULES,
  type HireAdminRole,
  type RolePermissions
} from '../schemas/adminCategoryRole';

const none = Object.fromEntries(
  PERMISSION_MODULES.map((m) => [m, []])
) as unknown as RolePermissions;

/** Roles for the role tests: a protected one, one with users, and one with nobody. */
export function makeRole(over: Partial<HireAdminRole> = {}): HireAdminRole {
  return {
    role_id: 'ROLE003',
    name: 'Business Owner',
    description: 'Runs a business',
    users: 586,
    status: 'active',
    protected: false,
    permissions: { ...none, jobs: ['view'] },
    ...over
  };
}

export const ROLES: HireAdminRole[] = [
  makeRole({ role_id: 'ROLE001', name: 'Super Admin', users: 3, protected: true }),
  makeRole(),
  makeRole({ role_id: 'ROLE009', name: 'Trainee', users: 0, permissions: none })
];
