import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminBusiness } from '../schemas/adminBusiness';
import { BusinessTableSection } from './BusinessTableSection';

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
vi.mock('./BusinessRowActions', () => ({
  BusinessRowActions: ({
    business,
    handlers
  }: {
    business: { business_id: string };
    handlers: {
      onSetStatus: (
        business: { business_id: string },
        status: 'active' | 'inactive' | 'suspended'
      ) => void;
    };
  }) => (
    <>
      <button type="button" onClick={() => handlers.onSetStatus(business, 'inactive')}>
        Deactivate {business.business_id}
      </button>
      <button type="button" onClick={() => handlers.onSetStatus(business, 'active')}>
        Activate {business.business_id}
      </button>
    </>
  )
}));
vi.mock('./BusinessesBulkBar', () => ({
  BusinessesBulkBar: ({
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
const LIST_URL = '/hire/admin/businesses';
const noop = () => undefined;

const business = (over: Partial<HireAdminBusiness> = {}): HireAdminBusiness => ({
  business_id: 'BUS0642',
  business_name: 'Spice Bowl Restaurant',
  business_type: 'Restaurant',
  area: 'Rajiv Nagar',
  city: 'Hyderabad',
  owner_name: 'Ramesh Kumar',
  phone: '9876543210',
  email: 'ramesh@example.com',
  outlets: 12,
  status: 'active',
  verification: 'verified',
  joined_at: '2024-06-24T10:24:00+05:30',
  ...over
});

const ROWS = [
  business(),
  business({
    business_id: 'BUS0639',
    business_name: 'FreshStock Warehouse',
    business_type: 'Warehouse',
    area: 'Patancheru',
    owner_name: 'Sangeetha Devi',
    phone: '9012345678',
    outlets: 1,
    status: 'inactive',
    verification: 'unverified'
  })
];

const SUMMARY = {
  total: 642,
  active: 586,
  inactive: 36,
  outlets: 1428,
  active_outlets: 1312,
  warehouses: 24,
  growth_pct: {
    total: 14,
    active: 12,
    inactive: -5,
    outlets: 18,
    active_outlets: 16,
    warehouses: 9
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
  api.list.mockResolvedValue({ items: ROWS, meta: { page: 1, page_size: 10, total: 642 } });
  api.patch.mockResolvedValue(business());
}

const renderSection = (route?: string) =>
  renderPage(<BusinessTableSection onView={noop} onEdit={noop} />, route ? { route } : undefined);

async function rowsLoaded() {
  await screen.findByRole('cell', { name: 'BUS0642' });
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('BusinessTableSection requests', () => {
  it('asks for the first ten businesses, newest first, with no filters for the default URL', async () => {
    renderSection();
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 1,
      page_size: 10,
      sort: 'joined_at',
      order: 'desc'
    });
    expect(screen.getByRole('combobox', { name: 'Filter by joined date' })).toHaveValue('all');
  });

  it('sends the tab, filters, search, page size and joined range from the URL', async () => {
    renderSection(
      '/?tab=active&status=active&business_type=Cloud%20Kitchen&city=Pune&verification=verified&search=spice&page=2&page_size=20&joined=7d'
    );
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 2,
      page_size: 20,
      search: 'spice',
      sort: 'joined_at',
      order: 'desc',
      tab: 'active',
      status: 'active',
      business_type: 'Cloud Kitchen',
      city: 'Pune',
      verification: 'verified',
      joined: '7d'
    });
  });

  it('sends no joined limit when the URL says any time', async () => {
    renderSection('/?joined=all');
    await rowsLoaded();

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 1,
      page_size: 10,
      sort: 'joined_at',
      order: 'desc'
    });
  });
});

describe('BusinessTableSection tabs and filters', () => {
  it('shows each tab with its count and marks the current one', async () => {
    renderSection();

    const all = await screen.findByRole('tab', { name: 'All Businesses (642)' });
    expect(all).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Active (586)' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('tab', { name: 'Inactive (36)' })).toBeInTheDocument();
  });

  it('puts the clicked tab in the URL, drops the page and clears the exact status', async () => {
    renderSection('/?page=3&status=under_review');

    await userEvent.click(await screen.findByRole('tab', { name: 'Inactive (36)' }));

    await waitFor(() => expect(routerLocation.search).toContain('tab=inactive'));
    expect(routerLocation.search).not.toContain('page=');
    expect(routerLocation.search).not.toContain('status=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ tab: 'inactive', page: 1 })
    );
  });

  it('filters by business type, location, verification, status and joined range', async () => {
    renderSection('/?page=2');
    await rowsLoaded();
    await screen.findByRole('option', { name: 'Pune' });

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by business type' }),
      'Warehouse'
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by location' }),
      'Pune'
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by verification' }),
      'Pending'
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by status' }),
      'Under Review'
    );
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by joined date' }),
      'Last 7 Days'
    );

    await waitFor(() =>
      expect(api.list).toHaveBeenLastCalledWith(
        LIST_URL,
        expect.objectContaining({
          business_type: 'Warehouse',
          city: 'Pune',
          verification: 'pending',
          status: 'under_review',
          joined: '7d',
          page: 1
        })
      )
    );
    expect(routerLocation.search).toContain('business_type=Warehouse');
    expect(routerLocation.search).toContain('city=Pune');
    expect(routerLocation.search).toContain('joined=7d');
    expect(routerLocation.search).not.toContain('page=');
  });

  it('keeps "Any time" as the default and puts Last 30 Days in the URL when chosen', async () => {
    renderSection();
    await rowsLoaded();
    const joined = screen.getByRole('combobox', { name: 'Filter by joined date' });

    expect(joined).toHaveValue('all');
    await userEvent.selectOptions(joined, 'Last 30 Days');
    await waitFor(() => expect(routerLocation.search).toContain('joined=30d'));

    await userEvent.selectOptions(joined, 'Any time');
    await waitFor(() => expect(routerLocation.search).not.toContain('joined='));
  });

  it('searches after a pause and puts the text in the URL', async () => {
    renderSection();
    await rowsLoaded();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search businesses' }), 'urban');

    await waitFor(() => expect(routerLocation.search).toContain('search=urban'));
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ search: 'urban' })
    );
  });

  it('offers Clear filters only when a filter is active and resets joined and the search box', async () => {
    renderSection('/?status=active&search=zzz&tab=active&joined=7d');
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull());
    expect(routerLocation.search).toBe('?tab=active');
    expect(screen.getByRole('searchbox', { name: 'Search businesses' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Filter by joined date' })).toHaveValue('all');
  });

  it('does not offer Clear filters for the default view', async () => {
    renderSection();
    await rowsLoaded();

    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });
});

describe('BusinessTableSection table', () => {
  it('lists the columns in the order of the design', async () => {
    renderSection();
    await rowsLoaded();

    const headers = screen.getAllByRole('columnheader').slice(1);
    expect(headers.map((header) => header.textContent)).toEqual([
      'Business ID',
      'Business / Brand',
      'Business Type',
      'Outlets',
      'Primary Contact',
      'Verification',
      'Joined On',
      'Status',
      'Actions'
    ]);
  });

  it('shows the business, type, outlets, contact, verification, joined date and status', async () => {
    renderSection();

    const row = (await screen.findByRole('cell', { name: 'BUS0642' })).closest('tr')!;
    expect(within(row).getByText('Spice Bowl Restaurant')).toBeInTheDocument();
    expect(within(row).getByText('Rajiv Nagar, Hyderabad')).toBeInTheDocument();
    expect(within(row).getByText('Restaurant')).toBeInTheDocument();
    expect(within(row).getByText('12')).toBeInTheDocument();
    expect(within(row).getByText('Ramesh Kumar')).toBeInTheDocument();
    expect(within(row).getByText('+91 98765 43210')).toBeInTheDocument();
    expect(within(row).getByText('Verified')).toBeInTheDocument();
    expect(within(row).getByText('Active')).toBeInTheDocument();
    expect(within(row).getByText('24 Jun 2024')).toBeInTheDocument();
  });

  it('gives every business the same orange store tile', async () => {
    renderSection();
    await rowsLoaded();

    expect(screen.getAllByTestId('business-tile')).toHaveLength(2);
  });

  it('toggles the order when Joined On is clicked and drops the page', async () => {
    renderSection('/?page=3');
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Joined On' }));
    await waitFor(() => expect(routerLocation.search).toContain('order=asc'));
    expect(routerLocation.search).not.toContain('page=');
    expect(api.list).toHaveBeenLastCalledWith(
      LIST_URL,
      expect.objectContaining({ sort: 'joined_at', order: 'asc', page: 1 })
    );

    await userEvent.click(screen.getByRole('button', { name: 'Joined On' }));
    await waitFor(() => expect(routerLocation.search).toContain('order=desc'));
  });

  it('has sort buttons on Business / Brand and Joined On', async () => {
    renderSection();
    await rowsLoaded();

    const head = screen.getAllByRole('rowgroup')[0]!;
    expect(
      within(head)
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(['Business / Brand', 'Joined On']);
  });

  it('forgets the ticked rows when the filters change', async () => {
    renderSection();
    await rowsLoaded();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row BUS0642' }));
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

describe('BusinessTableSection status changes', () => {
  it('asks with the business name before deactivating, and sends nothing until confirmed', async () => {
    renderSection();
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Deactivate BUS0642' }));

    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this business?' });
    expect(
      within(dialog).getByText(/Spice Bowl Restaurant will be marked as Inactive/)
    ).toBeVisible();
    expect(api.patch).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(`${LIST_URL}/BUS0642`, { status: 'inactive' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('sends nothing when the question is cancelled', async () => {
    renderSection();
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Deactivate BUS0642' }));
    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this business?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('activates at once without asking', async () => {
    renderSection();
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Activate BUS0639' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(`${LIST_URL}/BUS0639`, { status: 'active' })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('BusinessTableSection footer', () => {
  it('says which businesses are shown out of the real total', async () => {
    renderSection();
    await rowsLoaded();

    expect(screen.getByText('Showing 1 – 10 of 642 businesses')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 65' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveTextContent('Previous');
  });

  it('shows the last page of 642 businesses as 641 – 642', async () => {
    api.list.mockResolvedValue({ items: ROWS, meta: { page: 65, page_size: 10, total: 642 } });
    renderSection('/?page=65');
    await rowsLoaded();

    expect(screen.getByText('Showing 641 – 642 of 642 businesses')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('asks for the page that is clicked', async () => {
    renderSection();
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));

    await waitFor(() => expect(routerLocation.search).toContain('page=2'));
    expect(api.list).toHaveBeenLastCalledWith(LIST_URL, expect.objectContaining({ page: 2 }));
  });
});

describe('BusinessTableSection states', () => {
  it('shows the error with a retry, and the rows after it is pressed', async () => {
    api.list.mockRejectedValueOnce(
      new ApiError({ code: 'HTTP_ERROR', status: 500, message: 'Server down' })
    );
    renderSection();

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await rowsLoaded();
    expect(screen.queryByText('Server down')).not.toBeInTheDocument();
  });

  it('explains an empty list and clears the filters from its action', async () => {
    api.list.mockImplementation(async (_url: string, query?: { search?: string }) =>
      query?.search
        ? { items: [], meta: { page: 1, page_size: 10, total: 0 } }
        : { items: ROWS, meta: { page: 1, page_size: 10, total: 642 } }
    );
    renderSection('/?search=zzz');

    expect(await screen.findByText('No businesses match')).toBeInTheDocument();
    expect(screen.getByText('Showing 0 businesses')).toBeInTheDocument();

    const clears = screen.getAllByRole('button', { name: 'Clear filters' });
    expect(clears).toHaveLength(2);
    await userEvent.click(clears[1]!);

    await rowsLoaded();
    expect(routerLocation.search).not.toContain('search=');
  });
});

describe('BusinessTableSection permissions', () => {
  it('shows the bulk slot to a person who can manage', async () => {
    renderSection();
    await rowsLoaded();

    expect(await screen.findByText('Bulk bar: 0 ticked on page 1')).toBeInTheDocument();
  });

  it('hides the bulk slot from a person who can only view', async () => {
    serve(['hire.admin.view']);
    renderSection();
    await rowsLoaded();
    await waitFor(() => expect(api.get.mock.calls.some(([url]) => url === '/auth/me')).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.queryByText(/Bulk bar/)).not.toBeInTheDocument();
  });
});
