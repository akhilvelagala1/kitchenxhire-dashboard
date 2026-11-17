import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import type { HireAdminUser } from '../schemas/adminUser';
import { AdminUsersPage } from './AdminUsersPage';

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
const BASE = '/hire/admin/users';

const user = (over: Partial<HireAdminUser> = {}): HireAdminUser => ({
  user_id: 'UST1001',
  name: 'Ananya Rao',
  email: 'ananya@kitchenx.in',
  role: 'Super Admin',
  department: 'Platform Ops',
  access_scope: 'All modules',
  last_login_at: '2026-11-10T09:42:00+05:30',
  status: 'active',
  created_at: '2026-10-12T10:00:00+05:30',
  ...over
});

const ROWS = [
  user(),
  user({
    user_id: 'UST1004',
    name: 'Kiran Das',
    email: 'kiran@kitchenx.in',
    role: 'Support',
    department: 'Customer Support',
    access_scope: 'Read-only',
    status: 'inactive'
  }),
  user({
    user_id: 'UST1005',
    name: 'Meera Nair',
    email: 'meera@kitchenx.in',
    role: 'Analyst',
    department: 'Operations',
    access_scope: 'Reports only',
    last_login_at: null,
    status: 'pending'
  })
];

const SUMMARY = {
  total: 128,
  active: 112,
  inactive: 8,
  administrators: 8,
  pending: 5,
  suspended: 3,
  growth_pct: {
    total: 14,
    active: 12,
    inactive: -20,
    administrators: 0,
    pending: 25,
    suspended: -25
  }
};

function serve(permissions: string[] = ['*']) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url.endsWith('/summary')) return SUMMARY;
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({ items: ROWS, meta: { page: 1, page_size: 10, total: 128 } });
  api.post.mockResolvedValue(user({ user_id: 'UST1129' }));
  api.patch.mockResolvedValue(user());
}

const lastListQuery = () => api.list.mock.lastCall![1] as Record<string, unknown>;

async function rowsLoaded() {
  return (await screen.findByRole('cell', { name: 'UST1001' })).closest('tr')!;
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('AdminUsersPage', () => {
  it('shows the heading and asks for ten users with last-login newest first', async () => {
    renderPage(<AdminUsersPage />);
    await rowsLoaded();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'User Management' })).toBeInTheDocument();
    expect(
      screen.getByText('Manage platform staff, roles, access permissions, and account status.')
    ).toBeVisible();
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
    expect(screen.queryByText('User Activity Trend')).not.toBeInTheDocument();
    expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'All Users (128)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pending (5)' })).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledWith(
      BASE,
      expect.objectContaining({
        page: 1,
        page_size: 10,
        sort: 'last_login_at',
        order: 'desc',
        active: '30d'
      })
    );
    expect(screen.getByText('Showing 1 – 10 of 128 users')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 13' })).toBeInTheDocument();
  });

  it('lists the columns in the order of the design and the first user in full', async () => {
    renderPage(<AdminUsersPage />);
    const row = await rowsLoaded();

    const headers = screen.getAllByRole('columnheader').slice(1);
    expect(headers.map((h) => h.textContent)).toEqual([
      'User ID',
      'User',
      'Role',
      'Department',
      'Access Scope',
      'Last Login',
      'Status',
      'Actions'
    ]);
    expect(within(row).getByText('Ananya Rao')).toBeInTheDocument();
    expect(within(row).getByText('ananya@kitchenx.in')).toBeInTheDocument();
    expect(within(row).getByText('AR')).toBeInTheDocument();
    expect(within(row).getByText('Super Admin')).toBeInTheDocument();
    expect(within(row).getByText('Platform Ops')).toBeInTheDocument();
    expect(within(row).getByText('All modules')).toBeInTheDocument();
    expect(within(row).getByText('10 Nov, 9:42 AM')).toBeInTheDocument();
    expect(within(row).getByText('Active')).toBeInTheDocument();
  });

  it('shows "Invite sent" for a pending user who never signed in', async () => {
    renderPage(<AdminUsersPage />);
    await rowsLoaded();

    const row = screen.getByRole('cell', { name: 'UST1005' }).closest('tr')!;
    expect(within(row).getByText('Invite sent')).toBeInTheDocument();
    expect(within(row).getByText('Pending')).toBeInTheDocument();
  });

  it('opens the details of a user in a dialog and closes it again', async () => {
    renderPage(<AdminUsersPage />);
    const row = await rowsLoaded();

    await userEvent.click(within(row).getByRole('button', { name: 'View user UST1001' }));
    const dialog = await screen.findByRole('dialog', { name: 'User details' });
    expect(within(dialog).getByText('Platform Ops')).toBeInTheDocument();
    expect(within(dialog).getByText('All modules')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'User details' })).toBeNull());
  });

  it('edits a user and sends only the fields that changed', async () => {
    renderPage(<AdminUsersPage />);
    const row = await rowsLoaded();

    await userEvent.click(within(row).getByRole('button', { name: 'Edit user UST1001' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit User' });
    const name = within(dialog).getByLabelText(/Full name/);
    expect(name).toHaveValue('Ananya Rao');
    await userEvent.clear(name);
    await userEvent.type(name, 'Ananya R Rao');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(`${BASE}/UST1001`, { name: 'Ananya R Rao' })
    );
  });

  it('adds a user from the header button after the form passes its checks', async () => {
    renderPage(<AdminUsersPage />);
    await rowsLoaded();

    await userEvent.click(screen.getByRole('button', { name: 'Add User' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add User' });

    await userEvent.click(within(dialog).getByRole('button', { name: 'Send invite' }));
    expect(await within(dialog).findByText('Choose a role')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();

    await userEvent.type(within(dialog).getByLabelText(/Full name/), 'Rohit Sen');
    await userEvent.type(within(dialog).getByLabelText(/E-mail/), 'rohit@kitchenx.in');
    await userEvent.selectOptions(within(dialog).getByLabelText(/Role/), 'Analyst');
    await userEvent.selectOptions(within(dialog).getByLabelText(/Department/), 'Operations');
    await userEvent.selectOptions(within(dialog).getByLabelText(/Access scope/), 'Reports only');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Send invite' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(BASE, {
        name: 'Rohit Sen',
        email: 'rohit@kitchenx.in',
        role: 'Analyst',
        department: 'Operations',
        access_scope: 'Reports only'
      })
    );
  });

  it('asks before suspending and then sends the status', async () => {
    renderPage(<AdminUsersPage />);
    const row = await rowsLoaded();

    await userEvent.click(within(row).getByRole('button', { name: 'More actions for UST1001' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Suspend' }));
    const dialog = await screen.findByRole('dialog', { name: 'Suspend this user?' });
    expect(api.patch).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Suspend' }));
    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(`${BASE}/UST1001`, { status: 'suspended' })
    );
  });

  it('activates an inactive user straight away, without a question', async () => {
    renderPage(<AdminUsersPage />);
    await rowsLoaded();

    const row = screen.getByRole('cell', { name: 'UST1004' }).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: 'More actions for UST1004' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Activate' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(`${BASE}/UST1004`, { status: 'active' })
    );
  });

  it('offers no status change for a pending invite', async () => {
    renderPage(<AdminUsersPage />);
    await rowsLoaded();

    const row = screen.getByRole('cell', { name: 'UST1005' }).closest('tr')!;
    await userEvent.click(within(row).getByRole('button', { name: 'More actions for UST1005' }));
    expect(await screen.findByRole('menuitem', { name: 'Copy user ID' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Activate' })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: 'Suspend' })).toBeNull();
  });

  it('shows the bulk bar for ticked rows', async () => {
    renderPage(<AdminUsersPage />);
    await rowsLoaded();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    const bar = await screen.findByRole('region', { name: 'Bulk actions' });
    expect(within(bar).getByText('3 selected')).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: 'Suspend selected' })).toBeInTheDocument();
  });

  it('hides Export, Add, Edit, the "..." menu and the bulk bar from a read-only role', async () => {
    serve(['hire.admin.view']);
    renderPage(<AdminUsersPage />);
    const row = await rowsLoaded();

    expect(within(row).getByRole('button', { name: 'View user UST1001' })).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: 'Edit user UST1001' })).toBeNull();
    expect(within(row).queryByRole('button', { name: /More actions/ })).toBeNull();
    await waitFor(() => expect(api.get.mock.calls.some(([url]) => url === '/auth/me')).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add User' })).not.toBeInTheDocument();
    expect(lastListQuery().page_size).toBe(10);
  });
});
