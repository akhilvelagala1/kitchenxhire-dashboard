import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminApplication } from '../schemas/adminApplication';
import { ApplicationsTableSection } from './ApplicationsTableSection';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    list: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn()
  }
}));
vi.mock('@/shared/ui/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('./ApplicationRowActions', () => ({
  ApplicationRowActions: ({ application }: { application: { application_id: string } }) => (
    <button type="button">Actions for {application.application_id}</button>
  )
}));
vi.mock('./ApplicationsBulkBar', () => ({
  ApplicationsBulkBar: ({
    selectedIds,
    listQuery
  }: {
    selectedIds: string[];
    listQuery: { page?: number };
  }) => (
    <p>
      Bulk bar: {selectedIds.length} ticked on page {listQuery.page}
    </p>
  )
}));

const api = vi.mocked(apiClient);
const LIST_URL = '/hire/admin/applications';

const application = (over: Partial<HireAdminApplication> = {}): HireAdminApplication => ({
  application_id: 'APP10892',
  candidate_id: 'CAN1',
  candidate_name: 'Rahul Kumar',
  candidate_email: 'rahul@example.com',
  candidate_phone: '9000000001',
  candidate_location: 'Hyderabad, TS',
  job_id: 'JOB1',
  job_title: 'Cook / Chef',
  job_type: 'Full-time',
  recruiter_id: 'REC1',
  recruiter_name: 'Rahul Verma',
  outlet_name: 'Spice Bowl Restaurant',
  location: 'Hyderabad',
  applied_at: '2026-06-24T10:24:00+05:30',
  status: 'reviewed',
  interview_at: null,
  resume_file_name: null,
  ...over
});

const ROWS = [
  application(),
  application({
    application_id: 'APP10891',
    candidate_name: 'Priya Sharma',
    job_title: 'Kitchen Helper',
    outlet_name: 'Urban Bites',
    recruiter_name: 'Anita Rao',
    applied_at: '2026-06-24T09:18:00+05:30',
    status: 'shortlisted'
  }),
  application({
    application_id: 'APP10890',
    candidate_name: 'Amit Mishra',
    job_title: 'Cleaning & Stewarding',
    job_type: 'Part-time',
    status: 'interview_scheduled'
  })
];

const SUMMARY = {
  counts: {
    all: 8672,
    reviewed: 6142,
    shortlisted: 1460,
    interview_scheduled: 642,
    hired: 428,
    rejected: 856
  },
  growth_pct: {
    all: 18,
    reviewed: 16,
    shortlisted: 9,
    interview_scheduled: 14,
    hired: 12,
    rejected: 8
  }
};

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url.endsWith('/summary')) return SUMMARY;
    if (url.endsWith('/options/jobs')) {
      return [
        { value: 'JOB1', label: 'Cook / Chef' },
        { value: 'JOB2', label: 'Kitchen Helper' }
      ];
    }
    if (url.includes('/options/')) return [];
    if (url.startsWith('/jobs/')) return { id: 'exp1', status: 'FAILED', error_message: 'x' };
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({
    items: ROWS,
    meta: { page: 1, page_size: 10, total: 8672 }
  });
  api.post.mockResolvedValue({ id: 'exp1', kind: 'EXPORT', status: 'QUEUED' });
}

async function rowsLoaded() {
  await screen.findByRole('cell', { name: 'APP10892' });
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('ApplicationsTableSection requests', () => {
  it('asks for the first ten applications, newest first, with no filters for the default URL', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 1,
      page_size: 10,
      sort: 'applied_at',
      order: 'desc'
    });
  });

  it('sends the tab, status, job, search, page and page size from the URL', async () => {
    renderPage(<ApplicationsTableSection />, {
      route:
        '/?tab=shortlisted&status=hired&job_id=JOB1&job_label=Cook%20%2F%20Chef&search=rahul&page=2&page_size=20'
    });
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 2,
      page_size: 20,
      search: 'rahul',
      sort: 'applied_at',
      order: 'desc',
      tab: 'shortlisted',
      status: 'hired',
      job_id: 'JOB1'
    });
  });

  it('keeps the job name in its picker after a reload', async () => {
    renderPage(<ApplicationsTableSection />, {
      route: '/?job_id=JOB1&job_label=Cook%20%2F%20Chef'
    });
    await rowsLoaded();

    expect(screen.getByRole('combobox', { name: 'Filter by job' })).toHaveValue('Cook / Chef');
  });
});

describe('ApplicationsTableSection table', () => {
  it('lists the seven columns in the order of the design', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();

    const headers = screen.getAllByRole('columnheader').slice(1);
    expect(headers.map((header) => header.textContent)).toEqual([
      'Application ID',
      'Candidate',
      'Applied For (Job)',
      'Recruiter / Outlet',
      'Applied On',
      'Status',
      'Actions'
    ]);
  });

  it('shows the candidate, job, outlet, applied date and status in each row', async () => {
    renderPage(<ApplicationsTableSection />);

    const row = (await screen.findByRole('cell', { name: 'APP10892' })).closest('tr')!;
    expect(within(row).getByText('RK')).toBeInTheDocument();
    expect(within(row).getByText('Rahul Kumar')).toBeInTheDocument();
    expect(within(row).getByText('Hyderabad, TS')).toBeInTheDocument();
    expect(within(row).getByText('Cook / Chef')).toBeInTheDocument();
    expect(within(row).getByText('Full-time')).toBeInTheDocument();
    expect(within(row).getByText('Spice Bowl Restaurant')).toBeInTheDocument();
    expect(within(row).getByText('Rahul Verma')).toBeInTheDocument();
    expect(within(row).getByText('24 Jun 2026, 10:24 AM')).toBeInTheDocument();
    expect(within(row).getByText('Reviewed')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Actions for APP10892' })).toBeInTheDocument();
  });

  it('names the table by its total', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();

    expect(screen.getByRole('table', { name: 'Applications - 8672 total' })).toBeInTheDocument();
  });

  it('toggles the order when Applied On is clicked', async () => {
    renderPage(<ApplicationsTableSection />, { route: '/?page=3' });
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Applied On' }));
    await waitFor(() => expect(routerLocation.search).toContain('order=asc'));
    expect(routerLocation.search).not.toContain('page=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ sort: 'applied_at', order: 'asc', page: 1 })
    );

    await userEvent.click(screen.getByRole('button', { name: 'Applied On' }));
    await waitFor(() => expect(routerLocation.search).toContain('order=desc'));
  });

  it('ticks every row from the select-all box and unticks them again', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();
    const all = screen.getByRole('checkbox', { name: 'Select all rows on this page' });
    expect(all).not.toBeChecked();

    await userEvent.click(all);

    expect(all).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select row APP10891' })).toBeChecked();
    expect(await screen.findByText('Bulk bar: 3 ticked on page 1')).toBeInTheDocument();

    await userEvent.click(all);

    expect(all).not.toBeChecked();
    expect(screen.getByText('Bulk bar: 0 ticked on page 1')).toBeInTheDocument();
  });

  it('forgets the ticked rows when the filters change', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row APP10892' }));
    expect(screen.getByText('Bulk bar: 1 ticked on page 1')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Filter by status' }), [
      'Hired'
    ]);

    await waitFor(() =>
      expect(screen.getByText('Bulk bar: 0 ticked on page 1')).toBeInTheDocument()
    );
  });
});

describe('ApplicationsTableSection states', () => {
  it('shows the error with a retry, and the rows after it is pressed', async () => {
    api.list.mockRejectedValueOnce(
      new ApiError({ code: 'HTTP_ERROR', status: 500, message: 'Server down' })
    );
    renderPage(<ApplicationsTableSection />);

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await rowsLoaded();
    expect(screen.queryByText('Server down')).not.toBeInTheDocument();
  });

  it('explains an empty list and clears the filters, search text included, from its action', async () => {
    api.list.mockImplementation(async (_url: string, query?: { search?: string }) =>
      query?.search
        ? { items: [], meta: { page: 1, page_size: 10, total: 0 } }
        : { items: ROWS, meta: { page: 1, page_size: 10, total: 8672 } }
    );
    renderPage(<ApplicationsTableSection />, { route: '/?search=zzz' });

    expect(await screen.findByText('No applications match')).toBeInTheDocument();
    expect(
      screen.getByText('Change filters or clear search to see more applications.')
    ).toBeInTheDocument();
    expect(screen.getByText('Showing 0 applications')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Applications pagination' })).toBeNull();

    const clears = screen.getAllByRole('button', { name: 'Clear filters' });
    expect(clears).toHaveLength(2);
    await userEvent.click(clears[1]!);

    await rowsLoaded();
    expect(routerLocation.search).not.toContain('search=');
    expect(screen.getByRole('searchbox', { name: 'Search applications' })).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });
});

describe('ApplicationsTableSection tabs', () => {
  it('shows each stage with its count and marks the current one', async () => {
    renderPage(<ApplicationsTableSection />);

    const all = await screen.findByRole('tab', { name: 'All Applications (8,672)' });
    expect(all).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Reviewed (6,142)' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    ['Shortlisted (1,460)', 'Interview Scheduled (642)', 'Hired (428)', 'Rejected (856)'].forEach(
      (name) => expect(screen.getByRole('tab', { name })).toBeInTheDocument()
    );
  });

  it('puts the clicked tab in the URL, drops the page and asks for that stage', async () => {
    renderPage(<ApplicationsTableSection />, { route: '/?page=3' });

    await userEvent.click(await screen.findByRole('tab', { name: 'Hired (428)' }));

    await waitFor(() => expect(routerLocation.search).toContain('tab=hired'));
    expect(routerLocation.search).not.toContain('page=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ tab: 'hired', page: 1 })
    );

    await userEvent.click(screen.getByRole('tab', { name: 'All Applications (8,672)' }));
    await waitFor(() => expect(routerLocation.search).not.toContain('tab='));
  });
});

describe('ApplicationsTableSection filters', () => {
  it('puts the picked status in the URL and the next request', async () => {
    renderPage(<ApplicationsTableSection />, { route: '/?page=2' });
    await rowsLoaded();

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Filter by status' }), [
      'Shortlisted'
    ]);

    await waitFor(() => expect(routerLocation.search).toContain('status=shortlisted'));
    expect(routerLocation.search).not.toContain('page=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ status: 'shortlisted', page: 1 })
    );
  });

  it('puts the debounced search text in the URL and the next request', async () => {
    renderPage(<ApplicationsTableSection />, { route: '/?page=2' });
    await rowsLoaded();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search applications' }), 'priya');

    await waitFor(() => expect(routerLocation.search).toContain('search=priya'));
    expect(routerLocation.search).not.toContain('page=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ search: 'priya', page: 1 })
    );
  });

  it('keeps the id and the name of a picked job in the URL and filters by the id', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();

    await userEvent.click(screen.getByRole('combobox', { name: 'Filter by job' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Kitchen Helper' }));

    await waitFor(() => expect(routerLocation.search).toContain('job_id=JOB2'));
    expect(routerLocation.search).toContain('job_label=Kitchen+Helper');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ job_id: 'JOB2' })
    );
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('shows the chosen applied dates and clears them from the date panel', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();
    const trigger = screen.getByRole('button', { name: 'Filter by applied date' });

    await userEvent.click(trigger);
    fireEvent.change(screen.getByLabelText('Applied date from'), {
      target: { value: '2026-06-01' }
    });
    fireEvent.change(screen.getByLabelText('Applied date to'), {
      target: { value: '2026-06-24' }
    });

    await waitFor(() => expect(trigger).toHaveTextContent('1 Jun – 24 Jun'));
    expect(routerLocation.search).toContain('from=2026-06-01');
    expect(routerLocation.search).toContain('to=2026-06-24');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ from: '2026-06-01', to: '2026-06-24' })
    );

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(routerLocation.search).not.toContain('from='));
    expect(routerLocation.search).not.toContain('to=');
  });

  it('closes the date panel on Escape and on a click outside it', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();
    const trigger = screen.getByRole('button', { name: 'Filter by applied date' });

    await userEvent.click(trigger);
    expect(screen.getByRole('group', { name: 'Applied date filter' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('group', { name: 'Applied date filter' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('searchbox', { name: 'Search applications' }));
    expect(screen.queryByRole('group', { name: 'Applied date filter' })).not.toBeInTheDocument();
  });

  it('offers Export to a role that can manage applications and exports the current view', async () => {
    renderPage(<ApplicationsTableSection />, { route: '/?tab=hired' });

    await userEvent.click(await screen.findByRole('button', { name: 'Export' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        `${LIST_URL}/exports`,
        expect.objectContaining({ tab: 'hired', page: 1, application_ids: [] })
      )
    );
  });

  it('hides Export and the bulk bar from a role that can only view', async () => {
    serve(['hire.admin.view']);
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/auth/me'));

    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Bulk bar:/)).not.toBeInTheDocument();
  });
});

describe('ApplicationsTableSection pager', () => {
  it('shows the count and the labelled numbered pager for 8,672 applications', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();

    expect(screen.getByText('Showing 1 – 10 of 8,672 applications')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 5' })).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('button', { name: 'Page 6' })).not.toBeInTheDocument();
    expect(screen.getByText('…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 868' })).toHaveTextContent('868');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveTextContent('Previous');
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveTextContent('Next');
    expect(screen.queryByRole('combobox', { name: 'Rows per page' })).not.toBeInTheDocument();
  });

  it('asks for the next page and for the last page', async () => {
    renderPage(<ApplicationsTableSection />);
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(routerLocation.search).toContain('page=2'));
    expect(api.list).toHaveBeenLastCalledWith(LIST_URL, expect.objectContaining({ page: 2 }));

    await userEvent.click(await screen.findByRole('button', { name: 'Page 868' }));
    await waitFor(() => expect(routerLocation.search).toContain('page=868'));
  });
});
