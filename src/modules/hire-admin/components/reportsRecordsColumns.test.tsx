import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Column, DataTable } from '@/shared/components/DataTable';
import {
  REPORTS_SORT_KEYS,
  type ReportsApplicationRow,
  type ReportsHiredRow,
  type ReportsJobRow,
  type ReportsRecordsMetric,
  type ReportsRejectedRow
} from '../schemas/adminReportsDrilldown';
import {
  applicationsColumns,
  hiredColumns,
  jobsPostedColumns,
  rejectedColumns
} from './reportsRecordsColumns';

const JOB: ReportsJobRow = {
  job_id: 'JOB-1024',
  title: 'Cook / Chef',
  recruiter_name: 'Rahul Verma',
  outlet_name: 'Spice Bowl Restaurant',
  posted_at: '2026-06-24T10:24:00+05:30',
  applications_count: 1482
};

const APPLICATION: ReportsApplicationRow = {
  application_id: 'APP-9421',
  candidate_name: 'Priya Sharma',
  job_title: 'Cook / Chef',
  outlet_name: 'Spice Bowl Restaurant',
  applied_at: '2026-06-24T10:24:00+05:30',
  status: 'shortlisted'
};

/** Hired at 8 pm UTC on the 23rd, which is already the morning of the 24th in India. */
const HIRED: ReportsHiredRow = {
  application_id: 'APP-9300',
  candidate_id: 'JS-2041',
  candidate_name: 'Anil Kumar Reddy',
  job_title: 'Kitchen Helper',
  recruiter_name: 'Meena Rao',
  outlet_name: 'Biryani House',
  hired_at: '2026-06-23T20:00:00Z'
};

const REJECTED: ReportsRejectedRow = {
  application_id: 'APP-9188',
  candidate_name: 'Rahul Kumar',
  job_title: 'Bakery Assistant',
  outlet_name: 'Sweet Crumbs',
  rejected_at: '2026-06-22T09:00:00+05:30',
  rejection_reason: 'Experience does not match the requirements'
};

/** One row in a DataTable with sorting switched on, and the spy its sort buttons report to. */
function renderTable<Row>(columns: Column<Row>[], row: Row, getRowId: (row: Row) => string) {
  const onSort = vi.fn();
  render(
    <DataTable<Row>
      columns={columns}
      rows={[row]}
      getRowId={getRowId}
      isLoading={false}
      error={undefined}
      onRetry={vi.fn()}
      showPagination={false}
      sort={{ key: undefined, order: undefined, onChange: onSort }}
      empty={{ title: 'No records' }}
      caption="Records"
    />
  );
  return onSort;
}

const headers = () => screen.getAllByRole('columnheader').map((th) => th.textContent);
const cells = () => screen.getAllByRole('cell').map((td) => td.textContent);
const sortButtons = () => screen.getAllByRole('button').map((button) => button.textContent);

describe('jobsPostedColumns', () => {
  it('lists the job id, title, recruiter, outlet, India-time posted day and application count', () => {
    renderTable(jobsPostedColumns, JOB, (row) => row.job_id);

    expect(headers()).toEqual([
      '#',
      'Job Title',
      'Posted By (Recruiter)',
      'Outlet / Restaurant',
      'Posted On',
      'Applications'
    ]);
    expect(cells()).toEqual([
      'JOB-1024',
      'Cook / Chef',
      'Rahul Verma',
      'Spice Bowl Restaurant',
      '24 Jun 2026',
      '1,482'
    ]);
  });

  it('puts the sort arrows on Posted On and Applications only, each sorting by its API key', async () => {
    const onSort = renderTable(jobsPostedColumns, JOB, (row) => row.job_id);

    expect(sortButtons()).toEqual(['Posted On', 'Applications']);
    await userEvent.click(screen.getByRole('button', { name: 'Posted On' }));
    expect(onSort).toHaveBeenLastCalledWith('posted_at', 'asc');
    await userEvent.click(screen.getByRole('button', { name: 'Applications' }));
    expect(onSort).toHaveBeenLastCalledWith('applications_count', 'asc');
  });

  it('right-aligns the Applications column and sets the title and the count in bold', () => {
    renderTable(jobsPostedColumns, JOB, (row) => row.job_id);

    expect(screen.getByRole('columnheader', { name: 'Applications' })).toHaveClass('text-right');
    expect(screen.getByRole('cell', { name: '1,482' })).toHaveClass('text-right');
    expect(screen.getByText('1,482')).toHaveClass('font-semibold');
    expect(screen.getByText('Cook / Chef')).toHaveClass('font-semibold');
  });
});

describe('applicationsColumns', () => {
  it('lists the application id, applicant, job, outlet, India-time applied day and status', () => {
    renderTable(applicationsColumns, APPLICATION, (row) => row.application_id);

    expect(headers()).toEqual([
      '#',
      'Applicant',
      'Applied For',
      'Outlet / Restaurant',
      'Applied On',
      'Status'
    ]);
    // The applicant cell reads as the avatar's initials, then the name, and nothing under it.
    expect(cells()).toEqual([
      'APP-9421',
      'PSPriya Sharma',
      'Cook / Chef',
      'Spice Bowl Restaurant',
      '24 Jun 2026',
      'Shortlisted'
    ]);
  });

  it('shows the applicant as round initials and a name, with no city line or icon', () => {
    renderTable(applicationsColumns, APPLICATION, (row) => row.application_id);

    const cell = screen.getByRole('cell', { name: 'Priya Sharma' });
    expect(screen.getByText('PS')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Priya Sharma')).toHaveAttribute('title', 'Priya Sharma');
    expect(cell.querySelector('svg')).toBeNull();
  });

  it('sorts only by Applied On', async () => {
    const onSort = renderTable(applicationsColumns, APPLICATION, (row) => row.application_id);

    expect(sortButtons()).toEqual(['Applied On']);
    await userEvent.click(screen.getByRole('button', { name: 'Applied On' }));
    expect(onSort).toHaveBeenLastCalledWith('applied_at', 'asc');
  });
});

describe('hiredColumns', () => {
  it('lists the candidate id, candidate, job, recruiter, outlet and hired day', () => {
    renderTable(hiredColumns, HIRED, (row) => row.application_id);

    expect(headers()).toEqual([
      '#',
      'Candidate',
      'Hired For',
      'Recruited By',
      'Outlet / Restaurant',
      'Hired On'
    ]);
    expect(cells()).toEqual([
      'JS-2041',
      'ARAnil Kumar Reddy',
      'Kitchen Helper',
      'Meena Rao',
      'Biryani House',
      '24 Jun 2026'
    ]);
  });

  it('shows the hired day in India time, not in the day the timestamp has in UTC', () => {
    renderTable(hiredColumns, HIRED, (row) => row.application_id);

    expect(screen.getByText('24 Jun 2026')).toBeInTheDocument();
    expect(screen.queryByText('23 Jun 2026')).not.toBeInTheDocument();
  });

  it('sorts only by Hired On', async () => {
    const onSort = renderTable(hiredColumns, HIRED, (row) => row.application_id);

    expect(sortButtons()).toEqual(['Hired On']);
    await userEvent.click(screen.getByRole('button', { name: 'Hired On' }));
    expect(onSort).toHaveBeenLastCalledWith('hired_at', 'asc');
  });
});

describe('rejectedColumns', () => {
  it('lists the application id, applicant, job, outlet, rejected day and reason', () => {
    renderTable(rejectedColumns, REJECTED, (row) => row.application_id);

    expect(headers()).toEqual([
      '#',
      'Applicant',
      'Applied For',
      'Outlet / Restaurant',
      'Rejected On',
      'Reason'
    ]);
    expect(cells()).toEqual([
      'APP-9188',
      'RKRahul Kumar',
      'Bakery Assistant',
      'Sweet Crumbs',
      '22 Jun 2026',
      'Experience does not match the requirements'
    ]);
    expect(screen.queryByText('Not recorded')).not.toBeInTheDocument();
  });

  it.each([null, '', '   '])('says "Not recorded", muted, when the reason is %j', (reason) => {
    renderTable(
      rejectedColumns,
      { ...REJECTED, rejection_reason: reason },
      (row) => row.application_id
    );

    expect(screen.getByText('Not recorded')).toHaveClass('text-ink-soft');
  });

  it('sorts only by Rejected On', async () => {
    const onSort = renderTable(rejectedColumns, REJECTED, (row) => row.application_id);

    expect(sortButtons()).toEqual(['Rejected On']);
    await userEvent.click(screen.getByRole('button', { name: 'Rejected On' }));
    expect(onSort).toHaveBeenLastCalledWith('rejected_at', 'asc');
  });
});

describe('sort keys', () => {
  const LISTS: [ReportsRecordsMetric, { sortKey?: string }[]][] = [
    ['jobs_posted', jobsPostedColumns],
    ['applications', applicationsColumns],
    ['hired', hiredColumns],
    ['rejected', rejectedColumns]
  ];

  it.each(LISTS)('%s sorts by exactly the columns the server accepts', (metric, columns) => {
    const sortKeys = columns.flatMap((column) => column.sortKey ?? []);

    expect(sortKeys).toEqual(REPORTS_SORT_KEYS[metric]);
  });
});
