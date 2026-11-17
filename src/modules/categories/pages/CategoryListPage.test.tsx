import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/errors';
import { renderPage, routerLocation } from '@/shared/test/render';
import type { Category } from '../schemas/category';
import { CategoryListPage } from './CategoryListPage';

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

const api = vi.mocked(apiClient);

const row = (over: Partial<Category> = {}): Category => ({
  id: 'c1',
  name: 'Dairy',
  code: 'DAIRY',
  description: null,
  parent_id: null,
  parent_name: null,
  status: 'ACTIVE',
  sort_order: 0,
  product_count: 120,
  version: 1,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-02T00:00:00Z',
  deleted_at: null,
  ...over
});

beforeEach(() => {
  vi.resetAllMocks();
  api.get.mockResolvedValue({ user_id: 'u1', role: 'PLATFORM_ADMIN', permissions: ['*'] });
});

describe('CategoryListPage', () => {
  it('requests the first server page sorted by name and renders the rows', async () => {
    api.list.mockResolvedValue({ items: [row()], meta: { page: 1, page_size: 25, total: 1 } });
    renderPage(<CategoryListPage />);

    expect(await screen.findByRole('link', { name: 'Dairy' })).toHaveAttribute(
      'href',
      '/catalogue/categories/c1'
    );
    expect(api.list).toHaveBeenCalledWith(
      '/catalog/categories',
      expect.objectContaining({ page: 1, page_size: 25, sort: 'name', order: 'asc' })
    );
  });

  it('shows the error state with a retry when the list request fails', async () => {
    api.list.mockRejectedValue(
      new ApiError({ code: 'HTTP_ERROR', status: 500, message: 'Server down' })
    );
    renderPage(<CategoryListPage />);

    expect(await screen.findByText('Server down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('puts the debounced search term in the URL and resets to page 1', async () => {
    api.list.mockResolvedValue({ items: [row()], meta: { page: 2, page_size: 25, total: 60 } });
    renderPage(<CategoryListPage />, { route: '/?page=2' });

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'milk');

    await waitFor(() => expect(routerLocation.search).toBe('?search=milk'));
  });

  it('asks for a reason before archiving the selected rows', async () => {
    api.list.mockResolvedValue({ items: [row()], meta: { page: 1, page_size: 25, total: 1 } });
    api.post.mockResolvedValue({ affected: 1 });
    renderPage(<CategoryListPage />);

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Select row c1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
    const confirm = screen.getAllByRole('button', { name: 'Archive' }).at(-1)!;
    expect(confirm).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox', { name: /Reason/ }), 'Duplicate of Milk');
    await userEvent.click(confirm);

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/catalog/categories/bulk-actions', {
        action: 'ARCHIVE',
        ids: ['c1'],
        reason: 'Duplicate of Milk'
      })
    );
  });
});
