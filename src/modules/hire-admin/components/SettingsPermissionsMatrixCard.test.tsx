import { screen, within } from '@testing-library/react';
import { renderPage } from '@/shared/test/render';
import type { SettingsUsersRoles } from '../schemas/adminSettingsUsersRoles';
import { SettingsEditProvider } from './settingsEditContext';
import { SettingsPermissionsMatrixCard } from './SettingsPermissionsMatrixCard';
import {
  UsersRolesSettingsProvider,
  type UsersRolesSettingsActions
} from './usersRolesSettingsContext';

const DRAFT: SettingsUsersRoles = {
  users: [],
  roles: [],
  permissions: {
    manage_users: { Admin: true, Recruiter: false, User: false },
    manage_roles: { Admin: true, Recruiter: false, User: false },
    create_manage_jobs: { Admin: true, Recruiter: true, User: false },
    view_own_applications: { Admin: true, Recruiter: true, User: true },
    schedule_interviews: { Admin: true, Recruiter: true, User: false },
    view_platform_reports: { Admin: true, Recruiter: true, User: false }
  },
  two_factor_auth: true,
  session_timeout_minutes: 60,
  user_activity_logging: true,
  ip_access_restriction: false
};

function renderMatrix() {
  const actions: UsersRolesSettingsActions = {
    draft: DRAFT,
    setUsers: () => undefined,
    upsertUser: () => undefined,
    removeUser: () => undefined,
    setRoles: () => undefined,
    upsertRole: () => undefined,
    removeRole: () => undefined,
    setPermission: () => undefined,
    setTwoFactor: () => undefined,
    setSessionTimeout: () => undefined,
    setActivityLogging: () => undefined,
    setIpRestriction: () => undefined
  };

  return renderPage(
    <SettingsEditProvider value={true}>
      <UsersRolesSettingsProvider value={actions}>
        <SettingsPermissionsMatrixCard />
      </UsersRolesSettingsProvider>
    </SettingsEditProvider>
  );
}

describe('SettingsPermissionsMatrixCard', () => {
  it('lists the six section-5 permissions under Admin, Recruiter and User', () => {
    renderMatrix();

    const grid = screen.getByRole('grid', { name: 'Role permissions' });
    expect(within(grid).getByRole('columnheader', { name: 'Admin' })).toBeInTheDocument();
    expect(within(grid).getByRole('columnheader', { name: 'Recruiter' })).toBeInTheDocument();
    expect(within(grid).getByRole('columnheader', { name: 'User' })).toBeInTheDocument();

    expect(within(grid).getByRole('rowheader', { name: /Manage Users/ })).toBeInTheDocument();
    expect(
      within(grid).getByRole('rowheader', { name: /Create & Manage Jobs/ })
    ).toBeInTheDocument();
    expect(
      within(grid).getByRole('rowheader', { name: /View Own Applications/ })
    ).toBeInTheDocument();
    expect(
      within(grid).getByRole('rowheader', { name: /Schedule Interviews/ })
    ).toBeInTheDocument();
    expect(
      within(grid).getByRole('rowheader', { name: /View Platform Reports/ })
    ).toBeInTheDocument();

    expect(
      within(grid).getByRole('checkbox', { name: 'View Own Applications for User' })
    ).toBeChecked();
    expect(
      within(grid).getByRole('checkbox', { name: 'View Platform Reports for User' })
    ).not.toBeChecked();
  });
});
