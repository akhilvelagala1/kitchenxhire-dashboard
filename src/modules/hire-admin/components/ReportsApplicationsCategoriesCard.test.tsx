import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { APPLICATIONS_REPORT } from './reportsTestData';
import { ReportsApplicationsCategoriesCard } from './ReportsApplicationsCategoriesCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const APPLICATIONS_URL = '/hire/admin/reports/applications';

beforeEach(() => vi.resetAllMocks());

describe('ReportsApplicationsCategoriesCard', () => {
  it('shows each category with its count and its share of total applications', async () => {
    get.mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsApplicationsCategoriesCard />);

    const rows = within(await screen.findByRole('list')).getAllByRole('listitem');

    expect(
      screen.getByRole('heading', { name: 'Applications by Job Category' })
    ).toBeInTheDocument();
    expect(rows).toHaveLength(6);
    expect(within(rows[0]!).getByText('Cook / Chef')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('2,420')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('(27.9%)')).toBeInTheDocument();
  });

  it('asks for the range in the URL', async () => {
    get.mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsApplicationsCategoriesCard />, { route: '/?range=90d' });

    await screen.findByRole('list');

    expect(get).toHaveBeenCalledWith(APPLICATIONS_URL, { range: '90d' });
  });

  it('shows an error with a working retry when the request fails', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsApplicationsCategoriesCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Cook / Chef')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the empty state when no category has an application in the period', async () => {
    get.mockResolvedValue({ ...APPLICATIONS_REPORT, top_categories: [] });
    renderPage(<ReportsApplicationsCategoriesCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
