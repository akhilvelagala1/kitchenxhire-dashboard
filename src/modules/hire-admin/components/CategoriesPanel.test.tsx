import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { HireAdminCategory } from '../schemas/adminCategoryRole';
import { CategoriesPanel } from './CategoriesPanel';

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
const LIST_URL = '/hire/admin/categories';

const category = (over: Partial<HireAdminCategory> = {}): HireAdminCategory => ({
  category_id: 'CAT001',
  name: 'Restaurant',
  code: 'RESTAURANT',
  business_type: 'Restaurant',
  icon: 'utensils',
  description: '',
  businesses: 248,
  outlets: 1024,
  status: 'active',
  ...over
});

const ROWS = [
  category(),
  category({
    category_id: 'CAT002',
    name: 'Cloud Kitchen',
    code: 'CLOUD_KITCHEN',
    business_type: 'Cloud Kitchen',
    icon: 'cloud',
    businesses: 182,
    outlets: 642
  })
];

function serve(permissions: string[] = ['*'], items: HireAdminCategory[] = ROWS, total = 12) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    throw new Error(`unexpected get ${url}`);
  });
  api.list.mockResolvedValue({ items, meta: { page: 1, page_size: 5, total } });
  api.patch.mockResolvedValue(category());
  api.post.mockResolvedValue({ affected: 1 });
}

function renderPanel(route?: string) {
  const handlers = { onAddCategory: vi.fn(), onViewCategory: vi.fn(), onEditCategory: vi.fn() };
  renderPage(<CategoriesPanel {...handlers} />, route ? { route } : undefined);
  return handlers;
}

beforeEach(() => {
  vi.resetAllMocks();
  serve();
});

describe('CategoriesPanel list', () => {
  it('asks for five categories and shows the rows with grouped numbers and the footer', async () => {
    renderPanel();

    expect(await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' })).toBeVisible();
    expect(api.list).toHaveBeenCalledWith(LIST_URL, { page: 1, page_size: 5 });
    expect(screen.getByRole('cell', { name: '1,024' })).toBeVisible();
    expect(screen.getByText('Showing 1 – 5 of 12 categories')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Business Categories' })).toBeVisible();
  });

  it('sends search, status and page from the URL', async () => {
    renderPanel('/?q=cloud&status=inactive&page=2');
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });

    expect(api.list).toHaveBeenCalledWith(LIST_URL, {
      page: 2,
      page_size: 5,
      q: 'cloud',
      status: 'inactive'
    });
  });

  it('puts the status filter in the URL, drops the page and keeps other params', async () => {
    renderPanel('/?page=2&tab=permissions&role=ROLE003');
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by status' }),
      'Archived'
    );

    await waitFor(() => expect(routerLocation.search).toContain('status=archived'));
    expect(routerLocation.search).not.toContain('page=');
    expect(routerLocation.search).toContain('tab=permissions');
    expect(routerLocation.search).toContain('role=ROLE003');
  });

  it('types a search into the URL after a pause', async () => {
    renderPanel();
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search categories' }), 'bak');

    await waitFor(() => expect(routerLocation.search).toContain('q=bak'));
  });

  it('goes to the next page from the pager', async () => {
    renderPanel();
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => expect(routerLocation.search).toContain('page=2'));
    expect(
      within(screen.getByRole('navigation', { name: 'Categories pagination' })).getByRole(
        'button',
        { name: 'Page 3' }
      )
    ).toBeVisible();
  });

  it('shows the empty state with Clear filters when a filter hides everything', async () => {
    serve(['*'], [], 0);
    renderPanel('/?status=archived');

    expect(await screen.findByText('No categories match these filters')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    await waitFor(() => expect(routerLocation.search).not.toContain('status='));
  });

  it('shows an error with a retry', async () => {
    api.list.mockRejectedValueOnce(new Error('boom'));
    renderPanel();

    const retry = await screen.findByRole('button', { name: /retry|try again/i });
    await userEvent.click(retry);

    expect(await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' })).toBeVisible();
  });
});

describe('CategoriesPanel actions', () => {
  it('reports add, view and edit to the page', async () => {
    const handlers = renderPanel();
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });

    await userEvent.click(screen.getByRole('button', { name: 'Add Category' }));
    await userEvent.click(screen.getByRole('button', { name: 'View category CAT002' }));
    await userEvent.click(screen.getByRole('button', { name: 'Edit category CAT002' }));

    expect(handlers.onAddCategory).toHaveBeenCalledTimes(1);
    expect(handlers.onViewCategory).toHaveBeenCalledWith(ROWS[1]);
    expect(handlers.onEditCategory).toHaveBeenCalledWith(ROWS[1]);
  });

  it('confirms before deactivating from the row menu, then sends the status', async () => {
    renderPanel();
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });

    await userEvent.click(screen.getByRole('button', { name: 'More actions for CAT002' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Deactivate' }));
    expect(api.patch).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('dialog', { name: 'Deactivate this category?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(`${LIST_URL}/CAT002`, { status: 'inactive' })
    );
  });

  it('archives after confirming', async () => {
    renderPanel();
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });

    await userEvent.click(screen.getByRole('button', { name: 'More actions for CAT001' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Archive' }));
    const dialog = await screen.findByRole('dialog', { name: 'Archive this category?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Archive' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(`${LIST_URL}/CAT001`, { status: 'archived' })
    );
  });

  it('activates an inactive category at once, without a confirmation', async () => {
    serve(['*'], [category({ status: 'inactive' })]);
    renderPanel();
    await screen.findByRole('cell', { name: 'RESTAURANT' });

    await userEvent.click(screen.getByRole('button', { name: 'More actions for CAT001' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Activate' }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(`${LIST_URL}/CAT001`, { status: 'active' })
    );
  });

  it('ticks rows, shows the bulk bar and bulk-activates the selection', async () => {
    renderPanel();
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    const bar = await screen.findByRole('region', { name: 'Bulk actions' });
    expect(within(bar).getByText('2 selected')).toBeVisible();
    await userEvent.click(within(bar).getByRole('button', { name: 'Activate' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(`${LIST_URL}/bulk`, {
        action: 'set_status',
        status: 'active',
        category_ids: ['CAT001', 'CAT002']
      })
    );
  });

  it('confirms a bulk archive', async () => {
    renderPanel();
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row CAT001' }));

    const bar = await screen.findByRole('region', { name: 'Bulk actions' });
    await userEvent.click(within(bar).getByRole('button', { name: 'Archive' }));
    const dialog = await screen.findByRole('dialog', { name: 'Archive selected categories?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Archive' }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(`${LIST_URL}/bulk`, {
        action: 'set_status',
        status: 'archived',
        category_ids: ['CAT001']
      })
    );
  });

  it('hides add, edit, more and the bulk bar from people who can only view', async () => {
    serve(['hire.admin.view']);
    renderPanel();
    await screen.findByRole('cell', { name: 'CLOUD_KITCHEN' });
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Add Category' })).not.toBeInTheDocument()
    );

    expect(screen.getByRole('button', { name: 'View category CAT001' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Edit category CAT001' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions for CAT001' })
    ).not.toBeInTheDocument();
  });
});
