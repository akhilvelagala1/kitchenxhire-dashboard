import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { USERS_REPORT } from './reportsTestData';
import { ReportsRecentUsersCard } from './ReportsRecentUsersCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsRecentUsersCard', () => {
  it('lists the recent users with their id, name, type and status', async () => {
    get.mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsRecentUsersCard />);

    expect(screen.getByRole('heading', { name: 'Recent Users' })).toBeInTheDocument();
    const table = await screen.findByRole('table');
    expect(within(table).getByText('USR-9421')).toBeInTheDocument();
    expect(within(table).getByText('Priya Sharma')).toBeInTheDocument();
    expect(within(table).getByText('Job Seeker')).toBeInTheDocument();
    expect(within(table).getByText('Business / Outlet')).toBeInTheDocument();
    expect(within(table).getAllByText('Active')).toHaveLength(3);
  });

  it('shows the empty state when no user registered in the window', async () => {
    get.mockResolvedValue({ ...USERS_REPORT, recent_users: [] });
    renderPage(<ReportsRecentUsersCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsRecentUsersCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('USR-9421')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
