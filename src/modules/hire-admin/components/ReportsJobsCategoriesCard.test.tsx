import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { JOBS_REPORT } from './reportsTestData';
import { ReportsJobsCategoriesCard } from './ReportsJobsCategoriesCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const JOBS_URL = '/hire/admin/reports/jobs';

beforeEach(() => vi.resetAllMocks());

describe('ReportsJobsCategoriesCard', () => {
  it('shows each category with its count and its share of total jobs', async () => {
    get.mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsJobsCategoriesCard />);

    const rows = within(await screen.findByRole('list')).getAllByRole('listitem');

    expect(screen.getByRole('heading', { name: 'Top Job Categories' })).toBeInTheDocument();
    expect(rows).toHaveLength(6);
    expect(within(rows[0]!).getByText('Cook / Chef')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('428')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('(28.9%)')).toBeInTheDocument();
  });

  it('asks for the range in the URL', async () => {
    get.mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsJobsCategoriesCard />, { route: '/?range=90d' });

    await screen.findByRole('list');

    expect(get).toHaveBeenCalledWith(JOBS_URL, { range: '90d' });
  });

  it('shows an error with a working retry when the request fails', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsJobsCategoriesCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Cook / Chef')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the empty state when no category has a job in the period', async () => {
    get.mockResolvedValue({ ...JOBS_REPORT, top_categories: [] });
    renderPage(<ReportsJobsCategoriesCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
