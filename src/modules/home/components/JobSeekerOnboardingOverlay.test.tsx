import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { buildJobSeekerSessionForPhone, writeJobSeekerSession } from '../lib/jobSeekerSession';
import { JobSeekerSessionProvider } from '../layout/JobSeekerSessionProvider';
import { UserLayout } from '../layout/UserLayout';
import { FindJobsPage } from '../pages/FindJobsPage';

function renderIncompleteUser() {
  writeJobSeekerSession(buildJobSeekerSessionForPhone('+91 91234 56789'));
  return render(
    <MemoryRouter initialEntries={['/user']}>
      <JobSeekerSessionProvider>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="user" element={<FindJobsPage />} />
          </Route>
        </Routes>
      </JobSeekerSessionProvider>
    </MemoryRouter>
  );
}

describe('JobSeekerOnboardingOverlay', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows Complete Your Profile over Find Jobs with auto-filled location', async () => {
    const user = userEvent.setup();
    renderIncompleteUser();

    const profileHeading = await screen.findByRole('heading', {
      name: /Complete Your Profile/i
    });
    expect(profileHeading).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Find kitchen and hospitality jobs/i })
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('+91 91234 56789')).toBeInTheDocument();
    expect(screen.getByTestId('onboarding-location-autofill')).toHaveTextContent('Hyderabad');
    expect(screen.getByText('Auto-filled')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Full Name/i), 'Ravi Teja');
    await user.click(screen.getByRole('button', { name: /Job Category/i }));
    await user.click(screen.getByRole('option', { name: 'Kitchen Helper' }));
    await user.click(screen.getByRole('button', { name: /Complete Profile/i }));

    expect(await screen.findByRole('heading', { name: /You're all set/i })).toBeInTheDocument();
    const summary = screen.getByRole('list', { name: 'Saved profile summary' });
    expect(within(summary).getByText('Ravi Teja')).toBeInTheDocument();
    expect(within(summary).getByText('Kitchen Helper')).toBeInTheDocument();
    expect(within(summary).getByText('Hyderabad')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Find Jobs →/i }));
    expect(screen.queryByRole('heading', { name: /You're all set/i })).not.toBeInTheDocument();
    expect(sessionStorage.getItem('kx-hire-job-seeker-session')).toContain(
      '"profileComplete":true'
    );
  });

  it('shows field errors on submit and clears them when corrected', async () => {
    const user = userEvent.setup();
    renderIncompleteUser();

    await screen.findByRole('heading', { name: /Complete Your Profile/i });
    await user.click(screen.getByRole('button', { name: /Complete Profile/i }));

    expect(await screen.findByText('Please enter your full name')).toBeInTheDocument();
    expect(screen.getByText('Please select a job category')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /You're all set/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/Full Name/i), '12');
    await user.tab();
    expect(await screen.findByText('Please enter a valid full name')).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Full Name/i));
    await user.type(screen.getByLabelText(/Full Name/i), 'Ravi Teja');
    expect(screen.queryByText('Please enter a valid full name')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Job Category/i }));
    await user.click(screen.getByRole('option', { name: 'Cook / Chef' }));
    expect(screen.queryByText('Please select a job category')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Complete Profile/i }));
    expect(await screen.findByRole('heading', { name: /You're all set/i })).toBeInTheDocument();
  });
});
