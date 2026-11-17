import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { CategoriesRolesKpiRow } from './CategoriesRolesKpiRow';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const SUMMARY = { categories: 12, roles: 8, growth_pct: { categories: 20, roles: 14 } };

beforeEach(() => vi.resetAllMocks());

describe('CategoriesRolesKpiRow', () => {
  it('shows both counts with their growth and an accessible name', async () => {
    get.mockResolvedValue(SUMMARY);
    renderPage(<CategoriesRolesKpiRow />);

    const categories = await screen.findByRole('group', {
      name: 'Total Categories, 12 categories'
    });
    expect(categories).toHaveTextContent('+20%');
    expect(categories).toHaveTextContent('vs last month');
    expect(screen.getByRole('group', { name: 'Total Roles, 8 roles' })).toHaveTextContent('+14%');
    expect(get).toHaveBeenCalledWith('/hire/admin/categories-roles/summary');
  });

  it('shows a drop in red without a plus sign', async () => {
    get.mockResolvedValue({ categories: 12, roles: 8, growth_pct: { categories: 20, roles: -5 } });
    renderPage(<CategoriesRolesKpiRow />);

    const roles = await screen.findByRole('group', { name: 'Total Roles, 8 roles' });
    expect(roles).toHaveTextContent('-5%');
    expect(roles).not.toHaveTextContent('+');
  });

  it('shows a loading status first, then an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(SUMMARY);
    renderPage(<CategoriesRolesKpiRow />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading category and role counts');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('group', { name: 'Total Roles, 8 roles' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
