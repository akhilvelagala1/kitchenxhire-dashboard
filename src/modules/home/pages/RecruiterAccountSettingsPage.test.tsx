import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { RecruiterAccountMenu } from '../components/RecruiterAccountMenu';
import { RecruiterSessionProvider } from '../layout/RecruiterSessionProvider';
import { readRecruiterAccountPreferences } from '../lib/recruiterAccountPreferencesStorage';
import { saveRecruiterProfile } from '../lib/recruiterOnboarding';
import { writeRecruiterSession } from '../lib/recruiterSession';
import { RecruiterAccountSettingsPage } from './RecruiterAccountSettingsPage';

const PHONE = '9876543210';
const ACCOUNT_ID = '919876543210';

function seedProfile() {
  saveRecruiterProfile(ACCOUNT_ID, {
    fullName: 'Karthik Menon',
    businessName: 'Spice Route Restaurant',
    businessType: 'restaurant',
    city: 'Hyderabad',
    email: 'karthik@spiceroute.in'
  });
}

/** Renders the current MemoryRouter location so a click can be checked for "no navigation". */
function Where() {
  return <p>Now at {useLocation().pathname}</p>;
}

function renderAccountSettings() {
  return render(
    <RecruiterSessionProvider>
      <MemoryRouter initialEntries={['/recruiter/account-settings']}>
        <Where />
        <RecruiterAccountSettingsPage />
      </MemoryRouter>
    </RecruiterSessionProvider>
  );
}

describe('RecruiterAccountSettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    writeRecruiterSession({ phone: PHONE });
  });

  it('selects Personal Information by default among the four sidebar sections', () => {
    renderAccountSettings();

    expect(screen.getByRole('tab', { name: 'Personal Information' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'Organisation Information' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: 'Notifications' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('shows Organisation Information and hides Personal Information when its sidebar tab is clicked, without changing the URL', async () => {
    const user = userEvent.setup();
    renderAccountSettings();
    expect(screen.getByRole('heading', { name: 'Personal Information' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Organisation Information' }));

    expect(screen.getByRole('heading', { name: 'Organisation Information' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Personal Information' })).not.toBeInTheDocument();
    expect(screen.getByText('Now at /recruiter/account-settings')).toBeInTheDocument();
  });

  it('keeps Mobile Number and Designation read-only while Full Name and Email Address stay editable', () => {
    seedProfile();
    renderAccountSettings();

    const mobile = screen.getByRole('textbox', { name: /Mobile Number/ });
    expect(mobile).toHaveAttribute('readonly');
    expect(mobile).toHaveValue(PHONE);

    const designation = screen.getByRole('textbox', { name: 'Designation' });
    expect(designation).toHaveAttribute('readonly');
    expect(designation).toHaveValue('Recruiter');

    expect(screen.getByRole('textbox', { name: 'Full Name' })).not.toHaveAttribute('readonly');
    expect(screen.getByRole('textbox', { name: /Email Address/ })).not.toHaveAttribute('readonly');
  });

  it('clears the session and navigates home when Logout from All Other Devices is clicked', async () => {
    const user = userEvent.setup();
    renderAccountSettings();
    await user.click(screen.getByRole('tab', { name: 'Security' }));

    await user.click(screen.getByRole('button', { name: /Logout from All Other Devices/ }));

    expect(await screen.findByText('Now at /')).toBeInTheDocument();
  });

  it('toggles the Job Posted notification immediately without a separate save button', async () => {
    const user = userEvent.setup();
    renderAccountSettings();
    await user.click(screen.getByRole('tab', { name: 'Notifications' }));

    const jobPosted = screen.getByRole('switch', { name: 'Job Posted' });
    expect(jobPosted).toHaveAttribute('aria-checked', 'true');

    await user.click(jobPosted);

    expect(jobPosted).toHaveAttribute('aria-checked', 'false');
    expect(screen.queryByRole('button', { name: /^Save/ })).not.toBeInTheDocument();
    expect(readRecruiterAccountPreferences(ACCOUNT_ID).notifyJobPosted).toBe(false);
  });
});

describe('RecruiterAccountMenu', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders a My Profile link to the recruiter account settings page', async () => {
    const user = userEvent.setup();
    writeRecruiterSession({ phone: PHONE });
    render(
      <RecruiterSessionProvider>
        <MemoryRouter>
          <RecruiterAccountMenu />
        </MemoryRouter>
      </RecruiterSessionProvider>
    );

    await user.click(screen.getByRole('button', { name: 'R' }));

    expect(screen.getByRole('menuitem', { name: /My Profile/ })).toHaveAttribute(
      'href',
      '/recruiter/account-settings'
    );
  });
});
