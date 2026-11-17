import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminBusiness } from '../schemas/adminBusiness';
import { AdminBusinessesPage } from './AdminBusinessesPage';

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

const api = vi.mocked(apiClient);
const BASE = '/hire/admin/businesses';

const business: HireAdminBusiness = {
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
  joined_at: '2024-06-24T10:24:00+05:30'
};

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
    if (url === `${BASE}/summary`) return SUMMARY;
    if (url === `${BASE}/locations`) return [{ value: 'Hyderabad', label: 'Hyderabad' }];
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({ items: [business], meta: { page: 1, page_size: 10, total: 642 } });
}

const lastListQuery = () => api.list.mock.lastCall![1] as Record<string, unknown>;

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('AdminBusinessesPage', () => {
  it('shows one title and asks for the ten newest businesses with no joined filter', async () => {
    renderPage(<AdminBusinessesPage />);

    await screen.findByRole('cell', { name: 'BUS0642' });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Businesses / Outlets' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Manage employer businesses, branches and outlet locations.')
    ).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        page: 1,
        page_size: 10,
        sort: 'joined_at',
        order: 'desc'
      })
    );
    expect(lastListQuery().joined).toBeUndefined();
    expect(screen.getByText('Showing 1 – 10 of 642 businesses')).toBeInTheDocument();
  });

  it('narrows the table to the Inactive tab and clears the exact status', async () => {
    renderPage(<AdminBusinessesPage />, { route: '/?status=under_review&page=3' });
    await screen.findByRole('cell', { name: 'BUS0642' });

    await userEvent.click(await screen.findByRole('tab', { name: /^Inactive/ }));

    await waitFor(() => expect(lastListQuery()).toMatchObject({ tab: 'inactive', page: 1 }));
    expect(lastListQuery().status).toBeUndefined();
    expect(routerLocation.search).toContain('tab=inactive');
    expect(routerLocation.search).not.toContain('status=');
  });

  it('opens the Add Business dialog from the header button for a manager', async () => {
    renderPage(<AdminBusinessesPage />);
    await screen.findByRole('cell', { name: 'BUS0642' });

    const [headerButton] = await screen.findAllByRole('button', { name: 'Add Business' });
    await userEvent.click(headerButton!);

    expect(await screen.findByRole('dialog', { name: 'Add Business' })).toBeInTheDocument();
  });

  it('opens the details of a business from its eye button', async () => {
    renderPage(<AdminBusinessesPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'View business BUS0642' }));

    const dialog = await screen.findByRole('dialog', {
      name: 'Spice Bowl Restaurant (BUS0642)'
    });
    expect(dialog).toHaveTextContent('Ramesh Kumar');
    expect(dialog).toHaveTextContent('+91 98765 43210');
    expect(dialog).toHaveTextContent('Verified');
  });

  it('gives a person who can only view the list the eye button and no way to change data', async () => {
    serve(['hire.admin.view']);
    renderPage(<AdminBusinessesPage />);

    expect(
      await screen.findByRole('button', { name: 'View business BUS0642' })
    ).toBeInTheDocument();
    await waitFor(() => expect(api.get.mock.calls.some(([url]) => url === '/auth/me')).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit business BUS0642' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for BUS0642' })
    ).not.toBeInTheDocument();
  });
});
