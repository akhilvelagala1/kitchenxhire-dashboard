import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { USERS_REPORT } from './reportsTestData';
import { ReportsUsersLocationsCard } from './ReportsUsersLocationsCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const USERS_URL = '/hire/admin/reports/users';

beforeEach(() => vi.resetAllMocks());

describe('ReportsUsersLocationsCard', () => {
  it('shows each location with its count and its share of total users', async () => {
    get.mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsUsersLocationsCard />);

    const rows = within(await screen.findByRole('list')).getAllByRole('listitem');

    expect(screen.getByRole('heading', { name: 'Users by Location' })).toBeInTheDocument();
    expect(rows).toHaveLength(5);
    expect(within(rows[0]!).getByText('Hyderabad')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('9,686')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('(37.5%)')).toBeInTheDocument();
  });

  it('asks for the range in the URL', async () => {
    get.mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsUsersLocationsCard />, { route: '/?range=90d' });

    await screen.findByRole('list');

    expect(get).toHaveBeenCalledWith(USERS_URL, { range: '90d' });
  });

  it('shows an error with a working retry when the request fails', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsUsersLocationsCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Hyderabad')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the empty state when no location has a user in the period', async () => {
    get.mockResolvedValue({ ...USERS_REPORT, top_locations: [] });
    renderPage(<ReportsUsersLocationsCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
