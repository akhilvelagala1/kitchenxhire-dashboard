import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import type { HireAdminCategory } from '../schemas/adminCategoryRole';
import { CategoryViewDialog } from './CategoryViewDialog';

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

const CATEGORY: HireAdminCategory = {
  category_id: 'CAT003',
  name: 'Food Court',
  code: 'FOOD_COURT',
  business_type: 'Food Court',
  icon: 'store',
  description: 'Shared dining halls',
  businesses: 56,
  outlets: 1210,
  status: 'active'
};

function serve(permissions: string[]) {
  api.get.mockImplementation(async (url: string) => {
    if (url === '/auth/me') return { user_id: 'u1', role: 'PLATFORM_ADMIN', permissions };
    if (url === '/audit-events') return [];
    throw new Error(`unexpected get ${url}`);
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('CategoryViewDialog', () => {
  it('shows nothing while no category is chosen', () => {
    serve(['*']);
    renderPage(<CategoryViewDialog category={undefined} onClose={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the details and asks for the category history', async () => {
    serve(['*']);
    renderPage(<CategoryViewDialog category={CATEGORY} onClose={vi.fn()} onEdit={vi.fn()} />);

    expect(await screen.findByRole('dialog', { name: 'Food Court (CAT003)' })).toBeInTheDocument();
    expect(screen.getByText('FOOD_COURT')).toBeVisible();
    expect(screen.getByText('1,210')).toBeVisible();
    expect(screen.getByText('Shared dining halls')).toBeVisible();
    await screen.findByText('No changes recorded yet.');
    expect(api.get).toHaveBeenCalledWith('/audit-events', {
      entity_type: 'hire_category',
      entity_id: 'CAT003'
    });
  });

  it('goes on to edit for managers', async () => {
    serve(['*']);
    const onEdit = vi.fn();
    renderPage(<CategoryViewDialog category={CATEGORY} onClose={vi.fn()} onEdit={onEdit} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(CATEGORY);
  });

  it('hides Edit from people who can only view', async () => {
    serve(['hire.admin.view']);
    renderPage(<CategoryViewDialog category={CATEGORY} onClose={vi.fn()} onEdit={vi.fn()} />);

    await screen.findByText('No changes recorded yet.');
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });
});
