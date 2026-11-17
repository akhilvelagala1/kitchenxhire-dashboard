import { SettingsAccessSecurityCard } from './SettingsAccessSecurityCard';
import { SettingsPermissionsMatrixCard } from './SettingsPermissionsMatrixCard';
import { SettingsRoleManagementCard } from './SettingsRoleManagementCard';
import { SettingsUsersManagementCard } from './SettingsUsersManagementCard';

/**
 * The Users & Roles tab content: four cards for the page's 2×2 grid (Users, Roles, Permissions,
 * Access & Security). Cards size to their content so spare space sits under the bottom row.
 */
export function SettingsUsersRolesPanel() {
  return (
    <>
      <SettingsUsersManagementCard />
      <SettingsRoleManagementCard />
      <SettingsPermissionsMatrixCard />
      <SettingsAccessSecurityCard />
    </>
  );
}
