import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { JobSeekerSessionProvider } from '../layout/JobSeekerSessionProvider';
import { UserLayout } from '../layout/UserLayout';
import { buildJobSeekerSessionForPhone, writeJobSeekerSession } from '../lib/jobSeekerSession';
import { clearProfileDraft } from '../lib/profileDraftStorage';
import { MyProfilePage } from './MyProfilePage';

function renderProfile(phone = '+91 98765 43210') {
  writeJobSeekerSession(buildJobSeekerSessionForPhone(phone));
  return render(
    <MemoryRouter initialEntries={['/user/profile']}>
      <JobSeekerSessionProvider>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="user/profile" element={<MyProfilePage />} />
          </Route>
        </Routes>
      </JobSeekerSessionProvider>
    </MemoryRouter>
  );
}

describe('MyProfilePage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    writeJobSeekerSession(buildJobSeekerSessionForPhone('+91 98765 43210'));
    try {
      localStorage?.clear();
    } catch {
      // Node 26 jsdom may omit localStorage.
    }
    clearProfileDraft();
  });

  it('shows create profile wizard with basic details step', async () => {
    renderProfile();
    expect(await screen.findByRole('heading', { name: 'Create Your Profile' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Basic Details' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save & Continue/i })).toBeInTheDocument();
  });

  it('does not show validation errors before submit', async () => {
    renderProfile();
    await screen.findByLabelText(/Full Name/i);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('blocks step 2 when full name is invalid', async () => {
    const user = userEvent.setup();
    renderProfile();
    const name = await screen.findByLabelText(/Full Name/i);
    await user.clear(name);
    await user.type(name, '@@@@');
    await user.click(screen.getByRole('button', { name: /Save & Continue/i }));
    expect(await screen.findByText('Please enter a valid full name')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Basic Details' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Skills & Experience' })).not.toBeInTheDocument();
  });

  it('advances to skills step when basic details are valid', async () => {
    const user = userEvent.setup();
    renderProfile();
    await screen.findByLabelText(/Full Name/i);
    await user.click(screen.getByRole('button', { name: /Save & Continue/i }));
    expect(await screen.findByRole('heading', { name: 'Skills & Experience' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Primary Skills/i })).toBeInTheDocument();
  });

  it('blocks education until skills and role are selected', async () => {
    const user = userEvent.setup();
    renderProfile();
    await screen.findByLabelText(/Full Name/i);
    await user.click(screen.getByRole('button', { name: /Save & Continue/i }));
    await screen.findByRole('heading', { name: 'Skills & Experience' });
    await user.click(screen.getByRole('button', { name: /Save & Continue/i }));
    expect(await screen.findByText('Please select at least one skill.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Skills & Experience' })).toBeInTheDocument();
  });

  it('lets the user jump between wizard steps from the stepper', async () => {
    const user = userEvent.setup();
    renderProfile();
    await screen.findByRole('heading', { name: 'Basic Details' });

    await user.click(screen.getByRole('button', { name: /Education/ }));
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
  });

  it('replaces Preferred Job Role dropdown in place for Other / Enter manually', async () => {
    const user = userEvent.setup();
    renderProfile();
    await screen.findByLabelText(/Full Name/i);
    await user.click(screen.getByRole('button', { name: /Preferred Job Role/i }));
    await user.click(await screen.findByRole('option', { name: /Other \/ Enter manually/i }));
    expect(screen.getByLabelText(/^Preferred Job Role$/i).tagName).toBe('INPUT');
    expect(screen.queryByRole('button', { name: /Preferred Job Role/i })).not.toBeInTheDocument();
  });
});
