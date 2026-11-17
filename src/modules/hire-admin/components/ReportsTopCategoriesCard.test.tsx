import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { REPORTS_OVERVIEW } from './reportsTestData';
import { ReportsTopCategoriesCard } from './ReportsTopCategoriesCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const OVERVIEW_URL = '/hire/admin/reports/overview';

const ROWS = [
  { name: 'Cook / Chef', count: '428', share: '(28.9%)' },
  { name: 'Kitchen Helper', count: '276', share: '(18.6%)' },
  { name: 'Cleaning & Stewarding', count: '198', share: '(13.4%)' },
  { name: 'Delivery & Store Support', count: '142', share: '(9.6%)' },
  { name: 'Bakery Assistant', count: '118', share: '(8.0%)' },
  { name: 'Others', count: '86', share: '(5.8%)' }
];

beforeEach(() => vi.resetAllMocks());

describe('ReportsTopCategoriesCard', () => {
  it('shows each category with its count and its share of all jobs posted', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopCategoriesCard />);

    const rows = within(await screen.findByRole('list')).getAllByRole('listitem');

    expect(screen.getByRole('heading', { name: 'Top Job Categories' })).toBeInTheDocument();
    expect(rows).toHaveLength(ROWS.length);
    rows.forEach((row, index) => {
      const { name, count, share } = ROWS[index]!;
      expect(within(row).getByText(name)).toBeInTheDocument();
      expect(within(row).getByText(count)).toBeInTheDocument();
      expect(within(row).getByText(share)).toBeInTheDocument();
    });
  });

  it('asks for the range in the URL', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopCategoriesCard />, { route: '/?range=90d' });

    await screen.findByRole('list');

    expect(get).toHaveBeenCalledWith(OVERVIEW_URL, { range: '90d' });
  });

  it('shows a loading status until the overview arrives', async () => {
    get.mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopCategoriesCard />);

    expect(screen.getByText('Loading Top Job Categories')).toBeInTheDocument();
    expect(await screen.findByText('Cook / Chef')).toBeInTheDocument();
    expect(screen.queryByText('Loading Top Job Categories')).not.toBeInTheDocument();
  });

  it('shows an error with a working retry when the request fails', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(REPORTS_OVERVIEW);
    renderPage(<ReportsTopCategoriesCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Cook / Chef')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the empty state when no category has a job in the period', async () => {
    get.mockResolvedValue({ ...REPORTS_OVERVIEW, top_categories: [] });
    renderPage(<ReportsTopCategoriesCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
