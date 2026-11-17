import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminRecruiter } from '../schemas/adminRecruiter';
import { RecruiterTableSection } from './RecruiterTableSection';

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
vi.mock('./RecruiterRowActions', () => ({
  RecruiterRowActions: ({ recruiter }: { recruiter: { recruiter_id: string } }) => (
    <button type="button">Actions for {recruiter.recruiter_id}</button>
  )
}));
vi.mock('./RecruitersBulkBar', () => ({
  RecruitersBulkBar: ({
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
const LIST_URL = '/hire/admin/recruiters';

const recruiter = (over: Partial<HireAdminRecruiter> = {}): HireAdminRecruiter => ({
  recruiter_id: 'REC10892',
  business_name: 'Spice Bowl Restaurant',
  business_type: 'Restaurant',
  area: 'Rajiv Nagar',
  city: 'Hyderabad',
  owner_name: 'Rajesh Kumar',
  phone: '9848012345',
  email: 'rajiv@example.com',
  outlets: 12,
  open_jobs: 48,
  applications: 24,
  status: 'active',
  verification: 'verified',
  joined_at: '2024-06-24T10:24:00+05:30',
  last_login_at: '2024-06-24T10:24:00+05:30',
  ...over
});

const ROWS = [
  recruiter(),
  recruiter({
    recruiter_id: 'REC10891',
    business_name: 'Urban Bites',
    business_type: 'Cloud Kitchen',
    area: 'Banjara Hills',
    status: 'inactive'
  }),
  recruiter({
    recruiter_id: 'REC10890',
    business_name: 'The Food Court',
    business_type: 'Food Court',
    status: 'pending',
    verification: 'pending'
  })
];

const SUMMARY = {
  total: 312,
  active: 286,
  inactive: 12,
  pending: 8,
  suspended: 6,
  outlets: 642,
  open_jobs: 1428,
  hiring_actions: 4862,
  growth_pct: {
    total: 7,
    active: 8,
    inactive: -4,
    pending: 12,
    suspended: -8,
    outlets: 14,
    open_jobs: 12,
    hiring_actions: 18
  }
};

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === `${LIST_URL}/summary`) return SUMMARY;
    if (url === `${LIST_URL}/locations`) {
      return [
        { value: 'Hyderabad', label: 'Hyderabad' },
        { value: 'Pune', label: 'Pune' }
      ];
    }
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({ items: ROWS, meta: { page: 1, page_size: 10, total: 312 } });
}

async function rowsLoaded() {
  await screen.findByRole('cell', { name: 'REC10892' });
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('RecruiterTableSection requests', () => {
  it('asks for the first ten recruiters, newest login first, with no filters for the default URL', async () => {
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 1,
      page_size: 10,
      sort: 'last_login_at',
      order: 'desc'
    });
  });

  it('sends the tab, filters, search, page size and joined range from the URL', async () => {
    renderPage(<RecruiterTableSection />, {
      route:
        '/?tab=active&status=active&business_type=Cloud%20Kitchen&city=Pune&search=spice&page=2&page_size=20&joined=30d'
    });
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 2,
      page_size: 20,
      search: 'spice',
      sort: 'last_login_at',
      order: 'desc',
      tab: 'active',
      status: 'active',
      business_type: 'Cloud Kitchen',
      city: 'Pune',
      joined: '30d'
    });
  });
});

describe('RecruiterTableSection tabs and filters', () => {
  it('shows each tab with its count and marks the current one', async () => {
    renderPage(<RecruiterTableSection />);

    const all = await screen.findByRole('tab', { name: 'All Recruiters (312)' });
    expect(all).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Active (286)' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('tab', { name: 'Inactive (12)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pending (8)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Suspended (6)' })).toBeInTheDocument();
  });

  it('puts the clicked tab in the URL, drops the page and clears the exact status', async () => {
    renderPage(<RecruiterTableSection />, { route: '/?page=3&status=pending' });

    await userEvent.click(await screen.findByRole('tab', { name: 'Inactive (12)' }));

    await waitFor(() => expect(routerLocation.search).toContain('tab=inactive'));
    expect(routerLocation.search).not.toContain('page=');
    expect(routerLocation.search).not.toContain('status=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ tab: 'inactive', page: 1 })
    );
  });

  it('filters by business type, location, status and joined range, each in the URL and the next request', async () => {
    renderPage(<RecruiterTableSection />, { route: '/?page=2' });
    await rowsLoaded();
    await screen.findByRole('option', { name: 'Pune' });

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by business type' }),
      'Food Court'
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by location' }),
      'Pune'
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by status' }),
      'Pending'
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by last login' }),
      'Last 7 Days'
    );

    await waitFor(() =>
      expect(api.list).toHaveBeenLastCalledWith(
        LIST_URL,
        expect.objectContaining({
          business_type: 'Food Court',
          city: 'Pune',
          status: 'pending',
          joined: '7d',
          page: 1
        })
      )
    );
    expect(routerLocation.search).toContain('business_type=Food+Court');
    expect(routerLocation.search).toContain('city=Pune');
    expect(routerLocation.search).toContain('joined=7d');
    expect(routerLocation.search).not.toContain('page=');
  });

  it('searches after a pause and puts the text in the URL', async () => {
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search recruiters' }), 'urban');

    await waitFor(() => expect(routerLocation.search).toContain('search=urban'));
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ search: 'urban' })
    );
  });

  it('offers Clear filters only while a filter is active, and empties the search box with it', async () => {
    renderPage(<RecruiterTableSection />, { route: '/?status=active&search=zzz&tab=active' });
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull());
    expect(routerLocation.search).toBe('?tab=active');
    expect(screen.getByRole('searchbox', { name: 'Search recruiters' })).toHaveValue('');
  });
});

describe('RecruiterTableSection table', () => {
  it('lists the columns in the order of the Recruiter Management design', async () => {
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();

    const headers = screen.getAllByRole('columnheader').slice(1);
    expect(headers.map((header) => header.textContent)).toEqual([
      'Recruiter ID',
      'Recruiter',
      'Contact Details',
      'Business / Outlet',
      'Verification',
      'Jobs Posted',
      'Applications',
      'Last Login',
      'Status',
      'Actions'
    ]);
  });

  it('shows the person, contact, company, verification, counts and status in each row', async () => {
    renderPage(<RecruiterTableSection />);

    const row = (await screen.findByRole('cell', { name: 'REC10892' })).closest('tr')!;
    expect(within(row).getByText('Rajesh Kumar')).toBeInTheDocument();
    expect(within(row).getByText('Spice Bowl Restaurant')).toBeInTheDocument();
    expect(within(row).getByText('Rajiv Nagar, Hyderabad')).toBeInTheDocument();
    expect(within(row).getByText('rajiv@example.com')).toBeInTheDocument();
    expect(within(row).getByText('Verified')).toBeInTheDocument();
    expect(within(row).getByText('48')).toBeInTheDocument();
    expect(within(row).getByText('24')).toBeInTheDocument();
    expect(within(row).getByText('Active')).toBeInTheDocument();
    expect(within(row).getByText('24 Jun 2024, 10:24 AM')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Actions for REC10892' })).toBeInTheDocument();
  });

  it('toggles the order when Last Login is clicked and drops the page', async () => {
    renderPage(<RecruiterTableSection />, { route: '/?page=3' });
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Last Login' }));
    await waitFor(() => expect(routerLocation.search).toContain('order=asc'));
    expect(routerLocation.search).not.toContain('page=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ sort: 'last_login_at', order: 'asc', page: 1 })
    );

    await userEvent.click(screen.getByRole('button', { name: 'Last Login' }));
    await waitFor(() => expect(routerLocation.search).toContain('order=desc'));
  });

  it('has sort buttons on Recruiter ID, Recruiter, Business / Outlet and Last Login', async () => {
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();

    const head = screen.getAllByRole('rowgroup')[0]!;
    expect(
      within(head)
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(['Recruiter ID', 'Recruiter', 'Business / Outlet', 'Last Login']);
  });

  it('forgets the ticked rows when the filters change', async () => {
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row REC10892' }));
    expect(screen.getByText('Bulk bar: 1 ticked on page 1')).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by status' }),
      'Active'
    );

    await waitFor(() =>
      expect(screen.getByText('Bulk bar: 0 ticked on page 1')).toBeInTheDocument()
    );
  });
});

describe('RecruiterTableSection footer', () => {
  it('says which recruiters are shown out of the real total', async () => {
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();

    expect(screen.getByText('Showing 1 – 10 of 312 recruiters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 32' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveTextContent('Previous');
  });

  it('shows the last page of 312 recruiters as 311 – 312', async () => {
    api.list.mockResolvedValue({ items: ROWS, meta: { page: 32, page_size: 10, total: 312 } });
    renderPage(<RecruiterTableSection />, { route: '/?page=32' });
    await rowsLoaded();

    expect(screen.getByText('Showing 311 – 312 of 312 recruiters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('asks for the page that is clicked', async () => {
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));

    await waitFor(() => expect(routerLocation.search).toContain('page=2'));
    expect(api.list).toHaveBeenLastCalledWith(LIST_URL, expect.objectContaining({ page: 2 }));
  });
});

describe('RecruiterTableSection states', () => {
  it('shows the error with a retry, and the rows after it is pressed', async () => {
    api.list.mockRejectedValueOnce(
      new ApiError({ code: 'HTTP_ERROR', status: 500, message: 'Server down' })
    );
    renderPage(<RecruiterTableSection />);

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await rowsLoaded();
    expect(screen.queryByText('Server down')).not.toBeInTheDocument();
  });

  it('explains an empty list and clears the filters from its action', async () => {
    api.list.mockImplementation(async (_url: string, query?: { search?: string }) =>
      query?.search
        ? { items: [], meta: { page: 1, page_size: 10, total: 0 } }
        : { items: ROWS, meta: { page: 1, page_size: 10, total: 312 } }
    );
    renderPage(<RecruiterTableSection />, { route: '/?search=zzz' });

    expect(await screen.findByText('No recruiters match')).toBeInTheDocument();
    expect(screen.getByText('Showing 0 recruiters')).toBeInTheDocument();

    const clears = screen.getAllByRole('button', { name: 'Clear filters' });
    expect(clears).toHaveLength(2);
    await userEvent.click(clears[1]!);

    await rowsLoaded();
    expect(routerLocation.search).not.toContain('search=');
  });
});

describe('RecruiterTableSection permissions', () => {
  it('shows the bulk slot to a person who can manage', async () => {
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();

    expect(await screen.findByText('Bulk bar: 0 ticked on page 1')).toBeInTheDocument();
  });

  it('hides the bulk slot from a person who can only view', async () => {
    serve(['hire.admin.view']);
    renderPage(<RecruiterTableSection />);
    await rowsLoaded();
    await waitFor(() => expect(api.get.mock.calls.some(([url]) => url === '/auth/me')).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.queryByText(/Bulk bar/)).not.toBeInTheDocument();
  });
});
