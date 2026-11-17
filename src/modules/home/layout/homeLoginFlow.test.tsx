import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { JOB_SEEKER_SESSION_KEY } from '../lib/jobSeekerSession';
import { RECRUITER_SESSION_KEY } from '../lib/recruiterSession';
import { RecruiterHomePage } from '../pages/RecruiterHomePage';
import { RecruiterLayout } from './RecruiterLayout';
import { JobSeekerSessionProvider } from './JobSeekerSessionProvider';
import { RecruiterSessionProvider } from './RecruiterSessionProvider';
import { HomeLayout } from './HomeLayout';
import { UserLayout } from './UserLayout';
import { HomePage } from '../pages/HomePage';
import { FindJobsPage } from '../pages/FindJobsPage';

function renderLoginFlow(initial = '/') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initial]}>
        <JobSeekerSessionProvider>
          <RecruiterSessionProvider>
            <Routes>
              <Route element={<HomeLayout />}>
                <Route index element={<HomePage />} />
              </Route>
              <Route element={<UserLayout />}>
                <Route path="user" element={<FindJobsPage />} />
              </Route>
              <Route element={<RecruiterLayout />}>
                <Route path="recruiter" element={<RecruiterHomePage />} />
              </Route>
            </Routes>
          </RecruiterSessionProvider>
        </JobSeekerSessionProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('home login flow', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('redirects to recruiter entry after Hire People OTP verification', async () => {
    const user = userEvent.setup();
    renderLoginFlow();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.click(screen.getByRole('radio', { name: /Hire People/i }));
    await user.type(screen.getByLabelText('Mobile number'), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Digit 1'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Hire the right people for your kitchen/i })
      ).toBeInTheDocument();
    });
    expect(sessionStorage.getItem(RECRUITER_SESSION_KEY)).toContain('+91 98765 43210');
    expect(sessionStorage.getItem(JOB_SEEKER_SESSION_KEY)).toBeNull();
  });

  it('opens Complete Your Profile over Find Jobs for new seekers after OTP', async () => {
    const user = userEvent.setup();
    renderLoginFlow();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.type(screen.getByLabelText('Mobile number'), '9123456789');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Digit 1'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Complete Your Profile/i })).toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', { name: /Find kitchen and hospitality jobs/i })
    ).toBeInTheDocument();
    const raw = sessionStorage.getItem(JOB_SEEKER_SESSION_KEY);
    expect(raw).toContain('+91 91234 56789');
    expect(raw).toContain('"profileComplete":false');
  });

  it('redirects to Find Jobs after mobile OTP verification', async () => {
    const user = userEvent.setup();
    renderLoginFlow();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.type(screen.getByLabelText('Mobile number'), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Digit 1'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Find kitchen and hospitality jobs/i })
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('heading', { name: 'Complete Your Profile' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Account menu for Surya Kumar/i })).toHaveTextContent(
      'SK'
    );
    const raw = sessionStorage.getItem(JOB_SEEKER_SESSION_KEY);
    expect(raw).toContain('+91 98765 43210');
    expect(raw).toContain('"initials":"SK"');
  });

  it('logs out from the user header and returns to Login on the homepage', async () => {
    const user = userEvent.setup();
    renderLoginFlow();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.type(screen.getByLabelText('Mobile number'), '9999999999');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Digit 1'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Account menu for Surya Kumar/i })
      ).toBeInTheDocument()
    );

    const headerNav = screen.getByRole('navigation', { name: 'Job seeker' });
    expect(within(headerNav).getByRole('link', { name: 'My Applications' })).toHaveAttribute(
      'href',
      '/user/applications'
    );
    expect(within(headerNav).getByRole('link', { name: 'My Resume' })).toHaveAttribute(
      'href',
      '/user/resume'
    );
    expect(within(headerNav).queryByRole('link', { name: 'My Documents' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Account menu for Surya Kumar/i }));
    expect(screen.getByRole('menuitem', { name: 'My Profile' })).toHaveAttribute(
      'href',
      '/user/profile'
    );
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });
    expect(sessionStorage.getItem(JOB_SEEKER_SESSION_KEY)).toBeNull();
  });

  it('clears the session when returning to the marketing homepage from Find Jobs', async () => {
    const user = userEvent.setup();
    renderLoginFlow();

    await user.click(screen.getByRole('button', { name: 'Login' }));
    await user.type(screen.getByLabelText('Mobile number'), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Digit 1'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Account menu for Surya Kumar/i })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole('link', { name: 'KitchenX Hiring home' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });
    expect(sessionStorage.getItem(JOB_SEEKER_SESSION_KEY)).toBeNull();
    expect(screen.queryByRole('button', { name: /Account menu for/i })).not.toBeInTheDocument();
  });
});
