import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { RecruiterJobWithStats } from '../lib/recruiterPostedJobsStore';
import { RecruiterMyApplicationsJobsTable } from './RecruiterMyApplicationsJobsTable';

/** Mirrors the component's own formatPostedOn so the expected text can't drift with the test runner's timezone. */
function formatPostedOn(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(iso));
}

const FULL_ROW: RecruiterJobWithStats = {
  id: 'job-1',
  title: 'South Indian Cook',
  category: 'Kitchen Staff',
  openings: 3,
  applicantCount: 12,
  postedAt: '2026-01-15T12:00:00.000Z',
  status: 'Active'
};

const MINIMAL_ROW: RecruiterJobWithStats = {
  id: 'job-2',
  title: 'Steward',
  applicantCount: 0,
  status: 'Active'
};

const ACTIVE_STATUS_ROW: RecruiterJobWithStats = {
  id: 'job-status-active',
  title: 'Sous Chef',
  applicantCount: 2,
  status: 'Active'
};

const PENDING_STATUS_ROW: RecruiterJobWithStats = {
  id: 'job-status-pending',
  title: 'Tandoor Chef',
  applicantCount: 4,
  status: 'Pending'
};

const CLOSED_STATUS_ROW: RecruiterJobWithStats = {
  id: 'job-status-closed',
  title: 'Head Chef',
  applicantCount: 9,
  status: 'Closed'
};

describe('RecruiterMyApplicationsJobsTable', () => {
  it('renders a View button in the Action column for every row', () => {
    render(<RecruiterMyApplicationsJobsTable rows={[FULL_ROW, MINIMAL_ROW]} />);

    expect(screen.getByRole('columnheader', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(2);
  });

  it('opens a dialog with the job details when View is clicked', async () => {
    const user = userEvent.setup();
    render(<RecruiterMyApplicationsJobsTable rows={[FULL_ROW]} />);

    await user.click(screen.getByRole('button', { name: 'View' }));

    const dialog = await screen.findByRole('dialog', { name: FULL_ROW.title });
    expect(within(dialog).getByText('Category: Kitchen Staff')).toBeInTheDocument();
    expect(within(dialog).getByText('Openings: 3')).toBeInTheDocument();
    expect(
      within(dialog).getByText(`Posted On: ${formatPostedOn(FULL_ROW.postedAt!)}`)
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Applicants: 12')).toBeInTheDocument();
    expect(within(dialog).getByText('Active')).toBeInTheDocument();
  });

  it('shows em-dashes in the dialog for a job missing optional fields', async () => {
    const user = userEvent.setup();
    render(<RecruiterMyApplicationsJobsTable rows={[MINIMAL_ROW]} />);

    await user.click(screen.getByRole('button', { name: 'View' }));

    const dialog = await screen.findByRole('dialog', { name: MINIMAL_ROW.title });
    expect(within(dialog).getByText('Category: —')).toBeInTheDocument();
    expect(within(dialog).getByText('Openings: —')).toBeInTheDocument();
    expect(within(dialog).getByText('Posted On: —')).toBeInTheDocument();
    expect(within(dialog).getByText('Applicants: 0')).toBeInTheDocument();
  });

  it('closes the dialog when Close is clicked', async () => {
    const user = userEvent.setup();
    render(<RecruiterMyApplicationsJobsTable rows={[FULL_ROW]} />);

    await user.click(screen.getByRole('button', { name: 'View' }));
    const dialog = await screen.findByRole('dialog', { name: FULL_ROW.title });

    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the empty state and no table when there are no posted jobs', () => {
    render(<RecruiterMyApplicationsJobsTable rows={[]} />);

    expect(screen.getByText('No jobs posted yet')).toBeInTheDocument();
    expect(
      screen.getByText('Once you post a job, it will appear here with its applicant count.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View' })).not.toBeInTheDocument();
  });

  it('shows Active in the table for a row with status Active', () => {
    render(<RecruiterMyApplicationsJobsTable rows={[ACTIVE_STATUS_ROW]} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Pending (not Active) in the table for a row with status Pending', () => {
    render(<RecruiterMyApplicationsJobsTable rows={[PENDING_STATUS_ROW]} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });

  it('shows Closed (not Active) in the table for a row with status Closed', () => {
    render(<RecruiterMyApplicationsJobsTable rows={[CLOSED_STATUS_ROW]} />);

    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });

  it('shows Pending next to Status in the dialog when viewing a row with status Pending', async () => {
    const user = userEvent.setup();
    render(<RecruiterMyApplicationsJobsTable rows={[PENDING_STATUS_ROW]} />);

    await user.click(screen.getByRole('button', { name: 'View' }));

    const dialog = await screen.findByRole('dialog', { name: PENDING_STATUS_ROW.title });
    expect(within(dialog).getByText('Status:')).toBeInTheDocument();
    expect(within(dialog).getByText('Pending')).toBeInTheDocument();
  });
});
