import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage, routerLocation } from '@/shared/test/render';
import { ROLES } from './roleTestData';
import { RolesPermissionsTab } from './RolesPermissionsTab';

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

function renderTab(route = '/?tab=permissions&role=ROLE003') {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions: ['*'] };
    if (url === '/audit-events') return [];
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({ items: ROLES, meta: { page: 1, page_size: 50, total: 3 } });
  api.patch.mockResolvedValue(ROLES[1]);
  renderPage(<RolesPermissionsTab />, { route });
}

const box = (name: string) => screen.findByRole('checkbox', { name });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('RolesPermissionsTab', () => {
  it('shows the role from the URL with its saved permissions and Save disabled', async () => {
    renderTab();

    expect(await box('Jobs: View')).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Jobs: Create' })).not.toBeChecked();
    expect(await screen.findByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('turns View on when another action is granted and then enables Save', async () => {
    renderTab();
    const user = userEvent.setup();

    await user.click(await box('User Management: Edit'));

    expect(screen.getByRole('checkbox', { name: 'User Management: View' })).toBeChecked();
    expect(await screen.findByRole('button', { name: 'Save changes' })).toBeEnabled();
  });

  it('clears the other actions when View is turned off', async () => {
    renderTab();
    const user = userEvent.setup();

    await user.click(await box('Jobs: All'));
    await user.click(screen.getByRole('checkbox', { name: 'Jobs: View' }));

    expect(screen.getByRole('checkbox', { name: 'Jobs: Export' })).not.toBeChecked();
  });

  it('saves the whole matrix for the role', async () => {
    renderTab();
    const user = userEvent.setup();

    await user.click(await box('Reports & Analytics: Export'));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(api.patch).toHaveBeenCalled());
    const [url, body] = api.patch.mock.lastCall!;
    expect(url).toBe('/hire/admin/roles/ROLE003/permissions');
    expect((body as { permissions: { reports: string[] } }).permissions.reports).toEqual([
      'view',
      'export'
    ]);
  });

  it('puts the saved permissions back with Reset', async () => {
    renderTab();
    const user = userEvent.setup();

    await user.click(await box('User Management: View'));
    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByRole('checkbox', { name: 'User Management: View' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('locks every checkbox of a protected role and shows the note', async () => {
    renderTab('/?tab=permissions&role=ROLE001');

    expect(await box('Jobs: View')).toBeDisabled();
    expect(screen.getByText(/Super Admin and Admin permissions are protected/)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('switches roles in the URL when nothing is unsaved', async () => {
    renderTab();
    const user = userEvent.setup();
    await box('Jobs: View');

    await user.click(screen.getByRole('radio', { name: /Trainee/ }));

    await waitFor(() => expect(routerLocation.search).toContain('role=ROLE009'));
    expect(screen.getByRole('region', { name: 'Permissions of Trainee' })).toBeInTheDocument();
  });

  it('asks before leaving a role with unsaved changes and keeps them when cancelled', async () => {
    renderTab();
    const user = userEvent.setup();
    await user.click(await box('User Management: View'));

    await user.click(screen.getByRole('radio', { name: /Trainee/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(routerLocation.search).toContain('role=ROLE003');
    expect(screen.getByRole('checkbox', { name: 'User Management: View' })).toBeChecked();
  });

  it('discards the changes and switches when the person confirms', async () => {
    renderTab();
    const user = userEvent.setup();
    await user.click(await box('User Management: View'));

    await user.click(screen.getByRole('radio', { name: /Trainee/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Discard and switch' }));

    await waitFor(() => expect(routerLocation.search).toContain('role=ROLE009'));
  });
});
