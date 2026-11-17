import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderPage } from '@/shared/test/render';
import type { SettingsUsersRoles } from '../schemas/adminSettingsUsersRoles';
import { SettingsAccessSecurityCard } from './SettingsAccessSecurityCard';
import { SettingsEditProvider } from './settingsEditContext';
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

function renderCard(overrides: Partial<UsersRolesSettingsActions> = {}) {
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
    setIpRestriction: () => undefined,
    ...overrides
  };

  return renderPage(
    <SettingsEditProvider value={true}>
      <UsersRolesSettingsProvider value={actions}>
        <SettingsAccessSecurityCard />
      </UsersRolesSettingsProvider>
    </SettingsEditProvider>
  );
}

describe('SettingsAccessSecurityCard', () => {
  it('shows the four access rows from the reference picture', () => {
    renderCard();

    expect(screen.getByRole('region', { name: 'Access & Security' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Two-factor authentication' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByLabelText('Session Timeout')).toHaveValue(60);
    expect(screen.getByRole('switch', { name: 'User activity logging' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('switch', { name: 'IP access restriction' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('toggles two-factor authentication when editable', async () => {
    const setTwoFactor = vi.fn();
    renderCard({ setTwoFactor });

    await userEvent.click(screen.getByRole('switch', { name: 'Two-factor authentication' }));

    expect(setTwoFactor).toHaveBeenCalledWith(false);
  });
});
