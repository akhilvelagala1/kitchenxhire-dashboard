import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from '@/shared/test/render';
import type { SettingsSecurity } from '../schemas/adminSettingsSecurity';
import { SettingsAccessAuthCard } from './SettingsAccessAuthCard';
import { SettingsEditProvider } from './settingsEditContext';
import { SecuritySettingsProvider, type SecuritySettingsActions } from './securitySettingsContext';

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

function renderCard(overrides: Partial<SecuritySettingsActions> = {}) {
  const actions = {
    draft: DRAFT,
    setTwoFactorAuth: vi.fn(),
    setIpRestriction: vi.fn(),
    setSessionTimeout: vi.fn(),
    setFailedLoginAttempts: vi.fn(),
    setAccountLockDuration: vi.fn(),
    setPasswordPolicy: vi.fn(),
    ...overrides
  } satisfies SecuritySettingsActions;

  renderPage(
    <SettingsEditProvider value={true}>
      <SecuritySettingsProvider value={actions}>
        <SettingsAccessAuthCard />
      </SecuritySettingsProvider>
    </SettingsEditProvider>
  );

  return actions;
}

describe('SettingsAccessAuthCard', () => {
  it('shows the five rows with their current values', () => {
    renderCard();

    expect(screen.getByRole('region', { name: 'Access & Authentication' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Two-Factor Authentication (2FA)' })).toBeChecked();
    expect(screen.getByRole('combobox', { name: 'Session Timeout' })).toHaveValue('30 minutes');
    expect(screen.getByRole('combobox', { name: 'Failed Login Attempts' })).toHaveValue(
      '5 attempts'
    );
    expect(screen.getByRole('combobox', { name: 'Account Lock Duration' })).toHaveValue(
      '15 minutes'
    );
  });

  it('flips 2FA and changes the dropdowns into the draft', async () => {
    const actions = renderCard();

    await userEvent.click(screen.getByRole('switch', { name: 'Two-Factor Authentication (2FA)' }));
    expect(actions.setTwoFactorAuth).toHaveBeenCalledWith(false);

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Session Timeout' }),
      '60 minutes'
    );
    expect(actions.setSessionTimeout).toHaveBeenCalledWith('60 minutes');
  });

  it('opens the Password Policy dialog and saves a change into the draft', async () => {
    const actions = renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Configure' }));
    const dialog = screen.getByRole('dialog', { name: 'Password Policy' });
    const minLength = within(dialog).getByLabelText('Minimum length');
    await userEvent.clear(minLength);
    await userEvent.type(minLength, '10');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(actions.setPasswordPolicy).toHaveBeenCalledWith(
      expect.objectContaining({ min_length: 10 })
    );
  });
});
