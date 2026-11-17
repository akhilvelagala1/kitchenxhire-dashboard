import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { JobSeekerSessionProvider } from '../layout/JobSeekerSessionProvider';
import { clearAccountSettings } from '../lib/accountSettingsStorage';
import { AccountSettingsPage } from './AccountSettingsPage';

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/user/settings']}>
      <JobSeekerSessionProvider>
        <Routes>
          <Route path="user/settings" element={<AccountSettingsPage />} />
          <Route path="/" element={<h1>Home</h1>} />
        </Routes>
      </JobSeekerSessionProvider>
    </MemoryRouter>
  );
}

describe('AccountSettingsPage', () => {
  beforeEach(() => {
    clearAccountSettings('');
  });

  it('shows the packed account form instead of the placeholder', async () => {
    renderSettings();
    expect(await screen.findByRole('heading', { name: 'Account Settings' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Profile & Account' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByDisplayValue('KitchenX Member')).toBeInTheDocument();
    expect(screen.getByDisplayValue('kitchenx.member@gmail.com')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Job Alerts' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.queryByText(/next prototype slice/i)).not.toBeInTheDocument();
  });

  it('saves a name change on this device', async () => {
    const user = userEvent.setup();
    renderSettings();
    const name = await screen.findByDisplayValue('KitchenX Member');
    await user.clear(name);
    await user.type(name, 'Anita Rao');
    await user.click(screen.getByRole('button', { name: /Save Changes/i }));
    expect(await screen.findByText('Saved on this device.')).toBeInTheDocument();
  });

  it('asks before deleting the account', async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByRole('heading', { name: 'Account Settings' });
    await user.click(screen.getByRole('button', { name: /Delete Account/i }));
    expect(
      await screen.findByRole('heading', { name: 'Delete this account?' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete Account' }));
    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});
