import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminJobSeeker } from '../schemas/adminJobSeeker';
import { JobSeekerTableSection } from './JobSeekerTableSection';

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
vi.mock('./JobSeekerRowActions', () => ({
  JobSeekerRowActions: ({ jobSeeker }: { jobSeeker: { job_seeker_id: string } }) => (
    <button type="button">Actions for {jobSeeker.job_seeker_id}</button>
  )
}));
vi.mock('./JobSeekersBulkBar', () => ({
  JobSeekersBulkBar: ({
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
const LIST_URL = '/hire/admin/job-seekers';

const jobSeeker = (over: Partial<HireAdminJobSeeker> = {}): HireAdminJobSeeker => ({
  job_seeker_id: 'JS12846',
  name: 'Ramesh Kumar',
  email: 'ramesh.kumar@email.com',
  phone: '9876543210',
  city: 'Hyderabad',
  state: 'TS',
  preferred_job_title: 'Cook / Chef',
  experience_years: 3,
  profile_completion: 92,
  applications_count: 12,
  interviews_count: 4,
  shortlisted_count: 4,
  hired_count: 1,
  status: 'active',
  joined_at: '2026-06-22T10:24:00+05:30',
  last_active_at: '2026-06-24T10:24:00+05:30',
  ...over
});

const ROWS = [
  jobSeeker(),
  jobSeeker({
    job_seeker_id: 'JS12845',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    profile_completion: 88,
    applications_count: 8,
    interviews_count: 3,
    last_active_at: '2026-06-22T09:18:00+05:30'
  }),
  jobSeeker({
    job_seeker_id: 'JS12843',
    name: 'Sangeetha Devi',
    email: 'sangeetha.devi@email.com',
    city: 'Madhapur',
    profile_completion: 64,
    applications_count: 5,
    interviews_count: 1,
    status: 'inactive'
  })
];

const SUMMARY = {
  total: 12846,
  active: 10982,
  inactive: 1864,
  total_applications: 28642,
  shortlisted: 4286,
  hired: 1842,
  growth_pct: {
    total: 14,
    active: 16,
    inactive: -6,
    total_applications: 18,
    shortlisted: 12,
    hired: 20
  }
};

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url.endsWith('/summary')) return SUMMARY;
    if (url.endsWith('/locations')) {
      return [
        { value: 'Hyderabad', label: 'Hyderabad' },
        { value: 'Vijayawada', label: 'Vijayawada' }
      ];
    }
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({
    items: ROWS,
    meta: { page: 1, page_size: 10, total: 12846 }
  });
}

async function rowsLoaded() {
  await screen.findByRole('cell', { name: 'JS12846' });
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('JobSeekerTableSection requests', () => {
  it('asks for the first ten job seekers, newest activity first, with no filters for the default URL', async () => {
    renderPage(<JobSeekerTableSection />);
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 1,
      page_size: 10,
      sort: 'last_active_at',
      order: 'desc'
    });
  });

  it('sends the tab, filters, search, page, page size and joined range from the URL', async () => {
    renderPage(<JobSeekerTableSection />, {
      route:
        '/?tab=active&status=under_review&experience=2-3&city=Vijayawada&search=priya&joined=30d&page=2&page_size=20'
    });
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 2,
      page_size: 20,
      search: 'priya',
      sort: 'last_active_at',
      order: 'desc',
      tab: 'active',
      status: 'under_review',
      experience: '2-3',
      city: 'Vijayawada',
      joined: '30d'
    });
  });
});

describe('JobSeekerTableSection table', () => {
  it('lists the columns in the order of the design', async () => {
    renderPage(<JobSeekerTableSection />);
    await rowsLoaded();

    const headers = screen.getAllByRole('columnheader').slice(1);
    expect(headers.map((header) => header.textContent)).toEqual([
      'Seeker ID',
      'Job Seeker',
      'Contact Details',
      'Location',
      'Profile Completion',
      'Applications',
      'Interviews',
      'Last Active',
      'Account Status',
      'Actions'
    ]);
  });

  it('shows id, person, contact, location, completion, counts, last active and status', async () => {
    renderPage(<JobSeekerTableSection />);

    const row = (await screen.findByRole('cell', { name: 'JS12846' })).closest('tr')!;
    expect(within(row).getByText('RK')).toBeInTheDocument();
    expect(within(row).getByText('Ramesh Kumar')).toBeInTheDocument();
    expect(within(row).getAllByText('ramesh.kumar@email.com')).toHaveLength(2);
    expect(within(row).getByText('9876543210')).toBeInTheDocument();
    expect(within(row).getByText('Hyderabad, TS')).toBeInTheDocument();
    expect(within(row).getByText('92%')).toBeInTheDocument();
    expect(within(row).getByText('12')).toBeInTheDocument();
    expect(within(row).getByText('4')).toBeInTheDocument();
    expect(within(row).getByText('24 Jun 2026, 10:24 AM')).toBeInTheDocument();
    expect(within(row).getByText('Active')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Actions for JS12846' })).toBeInTheDocument();
  });

  it('shows an inactive job seeker as Inactive', async () => {
    renderPage(<JobSeekerTableSection />);

    const row = (await screen.findByRole('cell', { name: 'JS12843' })).closest('tr')!;
    expect(within(row).getByText('Inactive')).toBeInTheDocument();
  });

  it('toggles the order when Last Active is clicked and drops the page', async () => {
    renderPage(<JobSeekerTableSection />, { route: '/?page=3' });
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Last Active' }));
    await waitFor(() => expect(routerLocation.search).toContain('order=asc'));
    expect(routerLocation.search).not.toContain('page=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ sort: 'last_active_at', order: 'asc', page: 1 })
    );
  });

  it('has sort buttons on Job Seeker, Profile Completion, Applications and Last Active', async () => {
    renderPage(<JobSeekerTableSection />);
    await rowsLoaded();

    const head = screen.getAllByRole('rowgroup')[0]!;
    expect(
      within(head)
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(['Job Seeker', 'Profile Completion', 'Applications', 'Last Active']);
  });
});

describe('JobSeekerTableSection tabs', () => {
  it('shows each tab with its count and marks the current one', async () => {
    renderPage(<JobSeekerTableSection />);

    const all = await screen.findByRole('tab', { name: 'All Job Seekers (12,846)' });
    expect(all).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Active (10,982)' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('tab', { name: 'Inactive (1,864)' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Hired/ })).not.toBeInTheDocument();
  });

  it('puts the clicked tab in the URL, drops the page and the status filter, and asks for it', async () => {
    renderPage(<JobSeekerTableSection />, { route: '/?page=3&status=inactive' });

    await userEvent.click(await screen.findByRole('tab', { name: 'Inactive (1,864)' }));

    await waitFor(() => expect(routerLocation.search).toContain('tab=inactive'));
    expect(routerLocation.search).not.toContain('page=');
    expect(routerLocation.search).not.toContain('status=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ tab: 'inactive', page: 1 })
    );
  });
});

describe('JobSeekerTableSection states', () => {
  it('shows the error with a retry, and the rows after it is pressed', async () => {
    api.list.mockRejectedValueOnce(
      new ApiError({ code: 'HTTP_ERROR', status: 500, message: 'Server down' })
    );
    renderPage(<JobSeekerTableSection />);

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await rowsLoaded();
    expect(screen.queryByText('Server down')).not.toBeInTheDocument();
  });

  it('explains an empty list and clears the filters from its action', async () => {
    api.list.mockImplementation(async (_url: string, query?: { search?: string }) =>
      query?.search
        ? { items: [], meta: { page: 1, page_size: 10, total: 0 } }
        : { items: ROWS, meta: { page: 1, page_size: 10, total: 12846 } }
    );
    renderPage(<JobSeekerTableSection />, { route: '/?search=zzz' });

    expect(await screen.findByText('No job seekers match')).toBeInTheDocument();

    const clears = screen.getAllByRole('button', { name: 'Clear filters' });
    await userEvent.click(clears[clears.length - 1]!);

    await rowsLoaded();
    expect(routerLocation.search).not.toContain('search=');
  });
});

describe('JobSeekerTableSection footer', () => {
  it('says which job seekers are shown out of the real total', async () => {
    renderPage(<JobSeekerTableSection />);
    await rowsLoaded();

    expect(screen.getByText('Showing 1 – 10 of 12,846 job seekers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1,285' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveTextContent('Previous');
  });

  it('shows the last page of 12,846 job seekers as 12,841 – 12,846', async () => {
    api.list.mockResolvedValue({
      items: ROWS,
      meta: { page: 1285, page_size: 10, total: 12846 }
    });
    renderPage(<JobSeekerTableSection />, { route: '/?page=1285' });
    await rowsLoaded();

    expect(screen.getByText('Showing 12,841 – 12,846 of 12,846 job seekers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
});

describe('JobSeekerTableSection permissions', () => {
  it('shows the bulk bar to a role that can manage job seekers', async () => {
    renderPage(<JobSeekerTableSection />);

    expect(await screen.findByText('Bulk bar: 0 ticked on page 1')).toBeInTheDocument();
  });

  it('hides the bulk bar from a role that can only view', async () => {
    serve(['hire.admin.view']);
    renderPage(<JobSeekerTableSection />);
    await rowsLoaded();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/auth/me'));

    expect(screen.queryByText(/Bulk bar:/)).not.toBeInTheDocument();
  });
});
