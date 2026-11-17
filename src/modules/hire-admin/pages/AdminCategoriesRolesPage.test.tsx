import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminRole } from '../schemas/adminCategoryRole';
import { AdminCategoriesRolesPage } from './AdminCategoriesRolesPage';

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

const role = { role_id: 'ROLE003', name: 'Business Owner' } as HireAdminRole;

vi.mock('../components/CategoriesPanel', () => ({
  CategoriesPanel: ({ onAddCategory }: { onAddCategory: () => void }) => (
    <button type="button" onClick={onAddCategory}>
      Add Category
    </button>
  )
}));
vi.mock('../components/RolesPanel', () => ({
  RolesPanel: ({ onViewRole }: { onViewRole: (r: HireAdminRole) => void }) => (
    <button type="button" onClick={() => onViewRole(role)}>
      View role stub
    </button>
  )
}));
vi.mock('../components/RolesPermissionsTab', () => ({
  RolesPermissionsTab: () => <p>Permission matrix stub</p>
}));
vi.mock('../components/CategoryFormDialog', () => ({
  CategoryFormDialog: ({ open }: { open: boolean }) => (open ? <p>Category form open</p> : null)
}));
vi.mock('../components/CategoryViewDialog', () => ({ CategoryViewDialog: () => null }));
vi.mock('../components/RoleFormDialog', () => ({ RoleFormDialog: () => null }));
vi.mock('../components/RoleViewDialog', () => ({
  RoleViewDialog: ({
    role: viewing,
    onEditPermissions
  }: {
    role: HireAdminRole | undefined;
    onEditPermissions: (r: HireAdminRole) => void;
  }) =>
    viewing ? (
      <button type="button" onClick={() => onEditPermissions(viewing)}>
        Edit permissions stub
      </button>
    ) : null
}));

const api = vi.mocked(apiClient);

function serve() {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions: ['*'] };
    if (url === '/hire/admin/categories-roles/summary') {
      return { categories: 12, roles: 8, growth_pct: { categories: 20, roles: 14 } };
    }
    if (url === '/audit-events') return [];
    throw new Error(`unexpected get ${url}`);
  });
  api.post.mockResolvedValue({ id: 'job1', status: 'QUEUED' });
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('AdminCategoriesRolesPage', () => {
  it('shows one title, the breadcrumb, both counts and the Categories tab by default', async () => {
    renderPage(<AdminCategoriesRolesPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Categories & Roles' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent(
      'Platform Management'
    );
    expect(
      await screen.findByRole('group', { name: 'Total Categories, 12 categories' })
    ).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Total Roles, 8 roles' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Categories', selected: true })).toBeInTheDocument();
    expect(screen.queryByText('Permission matrix stub')).not.toBeInTheDocument();
  });

  it('switches tabs through the tab URL parameter and keeps the other parameters', async () => {
    renderPage(<AdminCategoriesRolesPage />, { route: '/?q=cloud' });

    await userEvent.click(screen.getByRole('tab', { name: 'Roles & Permissions' }));

    expect(await screen.findByText('Permission matrix stub')).toBeInTheDocument();
    expect(routerLocation.search).toContain('tab=permissions');
    expect(routerLocation.search).toContain('q=cloud');

    await userEvent.click(screen.getByRole('tab', { name: 'Categories' }));

    await waitFor(() => expect(routerLocation.search).not.toContain('tab='));
    expect(routerLocation.search).toContain('q=cloud');
  });

  it('moves between the tabs with the arrow keys', async () => {
    renderPage(<AdminCategoriesRolesPage />);

    screen.getByRole('tab', { name: 'Categories' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(
      await screen.findByRole('tab', { name: 'Roles & Permissions', selected: true })
    ).toHaveFocus();
  });

  it('opens the category form from Add Category', async () => {
    renderPage(<AdminCategoriesRolesPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    expect(await screen.findByText('Category form open')).toBeInTheDocument();
  });

  it('opens Audit Logs with the category and role trails for every event', async () => {
    renderPage(<AdminCategoriesRolesPage />);

    await userEvent.click(screen.getByRole('button', { name: 'Audit Logs' }));

    const dialog = await screen.findByRole('dialog', { name: 'Audit Logs' });
    expect(dialog).toHaveTextContent('Categories');
    expect(dialog).toHaveTextContent('Roles');
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/audit-events', {
        entity_type: 'hire_category',
        entity_id: 'all'
      })
    );
    expect(api.get).toHaveBeenCalledWith('/audit-events', {
      entity_type: 'hire_role',
      entity_id: 'all'
    });
  });

  it('exports the filtered categories from the header', async () => {
    renderPage(<AdminCategoriesRolesPage />, { route: '/?status=inactive' });

    await userEvent.click(await screen.findByRole('button', { name: 'Export' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/hire/admin/categories/exports',
        expect.objectContaining({ status: 'inactive', category_ids: [] })
      )
    );
  });

  it('goes from the role details to that role in the permissions tab', async () => {
    renderPage(<AdminCategoriesRolesPage />);

    await userEvent.click(screen.getByRole('button', { name: 'View role stub' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Edit permissions stub' }));

    expect(await screen.findByText('Permission matrix stub')).toBeInTheDocument();
    expect(routerLocation.search).toContain('tab=permissions');
    expect(routerLocation.search).toContain('role=ROLE003');
    expect(screen.queryByRole('button', { name: 'Edit permissions stub' })).not.toBeInTheDocument();
  });

  it('hides Export from a person who can only view', async () => {
    api.get.mockImplementation(async (url: string) => {
      if (url === '/auth/me') {
        return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions: ['hire.admin.view'] };
      }
      if (url === '/hire/admin/categories-roles/summary') {
        return { categories: 12, roles: 8, growth_pct: { categories: 20, roles: 14 } };
      }
      throw new Error(`unexpected get ${url}`);
    });
    renderPage(<AdminCategoriesRolesPage />);

    await waitFor(() => expect(api.get.mock.calls.some(([url]) => url === '/auth/me')).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Audit Logs' })).toBeInTheDocument();
  });
});
