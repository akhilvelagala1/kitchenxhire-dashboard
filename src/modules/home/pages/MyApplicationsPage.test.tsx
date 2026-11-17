import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { FIND_JOBS_CATALOG } from '../content/findJobsCatalog';
import { APPLICATIONS_PAGE_SIZE } from '../schemas/jobApplication';
import { buildJobSeekerSessionForPhone, writeJobSeekerSession } from '../lib/jobSeekerSession';
import { writeSavedJobEntries } from '../lib/savedJobs';
import { JobSeekerSessionProvider } from '../layout/JobSeekerSessionProvider';
import { UserLayout } from '../layout/UserLayout';
import { MyApplicationsPage } from './MyApplicationsPage';

function renderApplications() {
  writeJobSeekerSession(buildJobSeekerSessionForPhone('+91 98765 43210'));
  return render(
    <MemoryRouter initialEntries={['/user/applications']}>
      <JobSeekerSessionProvider>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="user/applications" element={<MyApplicationsPage />} />
            <Route path="user" element={<div>Find Jobs page</div>} />
          </Route>
        </Routes>
      </JobSeekerSessionProvider>
    </MemoryRouter>
  );
}

describe('MyApplicationsPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    writeJobSeekerSession(buildJobSeekerSessionForPhone('+91 98765 43210'));
  });

  it('shows filter pills and applications from stored data', async () => {
    renderApplications();
    expect(await screen.findByRole('heading', { name: 'My Applications' })).toBeInTheDocument();
    expect(screen.getByText('Track the status of jobs you have applied for.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Applications \(13\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Under Review \(6\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Saved Jobs \(0\)/i })).toBeInTheDocument();
    expect(screen.getByText('Cleaning & Stewarding Staff')).toBeInTheDocument();
    expect(screen.getByText('Cashier')).toBeInTheDocument();
    expect(screen.getByText('Security Staff')).toBeInTheDocument();
  });

  it('shows six cards on page 1 with Find Jobs–style range and pagination', async () => {
    const user = userEvent.setup();
    renderApplications();
    await screen.findByText('Cleaning & Stewarding Staff');
    const results = screen.getByRole('region', { name: 'Application results' });
    expect(results).toContainElement(screen.getByText('Showing 1–6 of 13 applications'));
    expect(results).toContainElement(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getAllByRole('button', { name: 'View Details →' })).toHaveLength(
      APPLICATIONS_PAGE_SIZE
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 7–12 of 13 applications')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'View Details →' })).toHaveLength(
      APPLICATIONS_PAGE_SIZE
    );
    await user.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByText('Showing 13–13 of 13 applications')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'View Details →' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('resets pagination when switching status pills', async () => {
    const user = userEvent.setup();
    renderApplications();
    await screen.findByText('Cleaning & Stewarding Staff');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 7–12 of 13 applications')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Under Review \(6\)/i }));
    expect(screen.getByText('Showing 1–6 of 6 applications')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'View Details →' })).toHaveLength(6);
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('filters the list when a status pill is selected', async () => {
    const user = userEvent.setup();
    renderApplications();
    await screen.findByText('Cleaning & Stewarding Staff');
    await user.click(screen.getByRole('button', { name: /Shortlisted \(2\)/i }));
    expect(screen.queryByText('Bakery Assistant')).not.toBeInTheDocument();
    expect(screen.getByText('Chinese Cook')).toBeInTheDocument();
    expect(screen.getByText('Showing 1–2 of 2 applications')).toBeInTheDocument();
  });

  it('shows saved jobs tab content and empty state', async () => {
    const user = userEvent.setup();
    renderApplications();
    await user.click(await screen.findByRole('button', { name: /Saved Jobs \(0\)/i }));
    expect(screen.getByRole('heading', { name: 'No Saved Jobs Yet' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Jobs/i })).toHaveAttribute('href', '/user');
  });

  it('lists saved jobs from shared storage and removes them', async () => {
    const user = userEvent.setup();
    const job = FIND_JOBS_CATALOG[0]!;
    writeSavedJobEntries([{ id: job.id, savedAt: '2026-11-15T10:00:00.000Z' }]);
    renderApplications();
    await user.click(await screen.findByRole('button', { name: /Saved Jobs \(1\)/i }));
    expect(screen.getByRole('heading', { name: /Saved Jobs \(1\)/i })).toBeInTheDocument();
    expect(screen.getByText(job.title)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Remove saved job/i }));
    expect(await screen.findByRole('heading', { name: 'No Saved Jobs Yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Saved Jobs \(0\)/i })).toBeInTheDocument();
  });
});
