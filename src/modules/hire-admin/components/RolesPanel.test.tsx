import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { ROLES } from './roleTestData';
import { RolesPanel } from './RolesPanel';

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

function renderPanel(permissions: string[] = ['*']) {
  const handlers = { onAddRole: vi.fn(), onViewRole: vi.fn(), onEditRole: vi.fn() };
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({ items: ROLES, meta: { page: 1, page_size: 50, total: 3 } });
  api.patch.mockResolvedValue({});
  api.delete.mockResolvedValue(undefined);
  renderPage(<RolesPanel {...handlers} />);
  return handlers;
}

async function openMenu(name: string) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: `More actions for ${name}` }));
  await screen.findByRole('menu');
  return user;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('RolesPanel', () => {
  it('asks for all roles at once and lists them with the footer count', async () => {
    renderPanel();

    expect(await screen.findByText('Trainee')).toBeInTheDocument();
    expect(api.list).toHaveBeenCalledWith('/hire/admin/roles', { page: 1, page_size: 50 });
    expect(screen.getByText('Showing 1 – 3 of 3 roles')).toBeInTheDocument();
  });

  it('opens the role from the eye button and the edit dialog from the pencil', async () => {
    const handlers = renderPanel();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'View permissions of Business Owner' })
    );
    await user.click(screen.getByRole('button', { name: 'Edit role Business Owner' }));

    expect(handlers.onViewRole).toHaveBeenCalledWith(ROLES[1]);
    expect(handlers.onEditRole).toHaveBeenCalledWith(ROLES[1]);
  });

  it('hides Add Role, the pencil and the menu from a person who can only view', async () => {
    renderPanel(['hire.admin.view']);

    await screen.findByText('Trainee');
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Add Role' })).not.toBeInTheDocument()
    );

    expect(screen.queryByRole('button', { name: 'Edit role Trainee' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View permissions of Trainee' })).toBeInTheDocument();
  });

  it('reports Add Role to the page', async () => {
    const handlers = renderPanel();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Add Role' }));

    expect(handlers.onAddRole).toHaveBeenCalledTimes(1);
  });

  it('shows how many roles are selected and clears the selection', async () => {
    renderPanel();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(screen.getByText('3 selected')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByText('3 selected')).not.toBeInTheDocument();
  });

  it('disables Deactivate and Delete for a protected role and says why', async () => {
    renderPanel();
    const user = await openMenu('Super Admin');

    const items = screen.getAllByRole('menuitem');
    expect(items.every((item) => item.hasAttribute('disabled'))).toBe(true);
    expect(screen.getAllByText('Protected system role')).toHaveLength(2);
    await user.keyboard('{Escape}');
  });

  it('disables Delete for a role that still has users and says to reassign them', async () => {
    renderPanel();
    await openMenu('Business Owner');

    expect(screen.getByRole('menuitem', { name: /Delete role/ })).toBeDisabled();
    expect(screen.getByText('Reassign its 586 users first')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Deactivate' })).toBeEnabled();
  });

  it('deactivates a role only after confirmation', async () => {
    renderPanel();
    const user = await openMenu('Business Owner');

    await user.click(screen.getByRole('menuitem', { name: 'Deactivate' }));
    expect(api.patch).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/hire/admin/roles/ROLE003', { status: 'inactive' })
    );
  });

  it('deletes an empty role only after confirmation', async () => {
    renderPanel();
    const user = await openMenu('Trainee');

    await user.click(screen.getByRole('menuitem', { name: 'Delete role' }));
    expect(api.delete).not.toHaveBeenCalled();

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete role' }));

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/hire/admin/roles/ROLE009'));
  });

  it('shows the error state with a retry when the list request fails', async () => {
    renderPanel();
    api.list.mockRejectedValue(new Error('boom'));
    renderPage(<RolesPanel onAddRole={vi.fn()} onViewRole={vi.fn()} onEditRole={vi.fn()} />);

    expect(await screen.findByRole('button', { name: /retry|try again/i })).toBeInTheDocument();
  });
});
