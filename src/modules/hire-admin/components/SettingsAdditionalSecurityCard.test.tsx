import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SettingsSecurity } from '../schemas/adminSettingsSecurity';
import { SettingsAdditionalSecurityCard } from './SettingsAdditionalSecurityCard';
import { renderPage } from '@/shared/test/render';
import { SettingsEditProvider } from './settingsEditContext';
import { SecuritySettingsProvider, type SecuritySettingsActions } from './securitySettingsContext';

const usersRolesGet = vi.fn();
vi.mock('../api/adminSettingsUsersRolesApi', () => ({
  adminSettingsUsersRolesApi: { get: () => usersRolesGet() }
}));

const loginHistory = vi.fn();
const sessions = vi.fn();
const revokeSession = vi.fn();
vi.mock('../api/adminSettingsSecurityApi', () => ({
  adminSettingsSecurityApi: {
    loginHistory: () => loginHistory(),
    sessions: () => sessions(),
    revokeSession: (id: string) => revokeSession(id)
  }
}));

const DRAFT: SettingsSecurity = {
  two_factor_auth: true,
  password_policy: {
    min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_symbol: false,
    expiry_days: 90,
    reuse_count: 3
  },
  session_timeout: '30 minutes',
  failed_login_attempts: '5 attempts',
  account_lock_duration: '15 minutes',
  ip_restriction: false
};

function renderCard(setIpRestriction = vi.fn()) {
  const actions = {
    draft: DRAFT,
    setTwoFactorAuth: vi.fn(),
    setIpRestriction,
    setSessionTimeout: vi.fn(),
    setFailedLoginAttempts: vi.fn(),
    setAccountLockDuration: vi.fn(),
    setPasswordPolicy: vi.fn()
  } satisfies SecuritySettingsActions;

  renderPage(
    <SettingsEditProvider value={true}>
      <SecuritySettingsProvider value={actions}>
        <SettingsAdditionalSecurityCard />
      </SecuritySettingsProvider>
    </SettingsEditProvider>
  );

  return { setIpRestriction };
}

beforeEach(() => {
  usersRolesGet.mockReset();
  loginHistory.mockReset();
  sessions.mockReset();
  revokeSession.mockReset();
});

describe('SettingsAdditionalSecurityCard', () => {
  it('shows the four rows and flips IP Restriction into the draft', async () => {
    const { setIpRestriction } = renderCard();

    expect(screen.getByRole('region', { name: 'Additional Security' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'IP Restriction' })).not.toBeChecked();

    await userEvent.click(screen.getByRole('switch', { name: 'IP Restriction' }));
    expect(setIpRestriction).toHaveBeenCalledWith(true);
  });

  it('opens Admin Access Control as a read-only summary of the Permissions Matrix', async () => {
    usersRolesGet.mockResolvedValue({
      permissions: {
        manage_users: { Admin: true, Recruiter: false, User: false },
        manage_roles: { Admin: true, Recruiter: false, User: false },
        create_manage_jobs: { Admin: true, Recruiter: true, User: false },
        view_own_applications: { Admin: true, Recruiter: true, User: true },
        schedule_interviews: { Admin: true, Recruiter: true, User: false },
        view_platform_reports: { Admin: true, Recruiter: true, User: false }
      }
    });
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }));
    const dialog = await screen.findByRole('dialog', { name: 'Admin Access Control' });

    expect(within(dialog).getByText('Edit in Users & Roles')).toBeInTheDocument();
    expect(await within(dialog).findByText('Manage Users')).toBeInTheDocument();
  });

  it('opens Login History and lists the sign-in attempts', async () => {
    loginHistory.mockResolvedValue([
      {
        id: '1',
        user_name: 'Ananya Rao',
        occurred_at: '2026-11-11T08:47:00+05:30',
        ip_address: '49.207.12.44',
        device: 'Safari on iPhone',
        result: 'success'
      }
    ]);
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'View Logs' }));
    const dialog = await screen.findByRole('dialog', { name: 'Login History' });

    expect(await within(dialog).findByText('Ananya Rao')).toBeInTheDocument();
  });

  it('opens Active Sessions and revokes a non-current session', async () => {
    sessions.mockResolvedValue([
      {
        id: 'session-1',
        user_name: 'Ananya Rao',
        device: 'Chrome on macOS',
        ip_address: '1.2.3.4',
        location: 'Hyderabad, India',
        last_active_at: '2026-11-11T09:30:00+05:30',
        is_current: true
      },
      {
        id: 'session-2',
        user_name: 'Vikram Shetty',
        device: 'Edge on Windows',
        ip_address: '5.6.7.8',
        location: 'Chennai, India',
        last_active_at: '2026-11-10T18:34:00+05:30',
        is_current: false
      }
    ]);
    revokeSession.mockResolvedValue([]);
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'View Sessions' }));
    const dialog = await screen.findByRole('dialog', { name: 'Active Sessions' });
    expect(await within(dialog).findByText('Vikram Shetty')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Revoke' }));

    await waitFor(() => expect(revokeSession).toHaveBeenCalledWith('session-2'));
  });
});
