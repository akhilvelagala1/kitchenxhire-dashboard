import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { RECRUITERS_REPORT } from './reportsTestData';
import { ReportsRecruitersLeaderboardCard } from './ReportsRecruitersLeaderboardCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const RECRUITERS_URL = '/hire/admin/reports/recruiters';

beforeEach(() => vi.resetAllMocks());

describe('ReportsRecruitersLeaderboardCard', () => {
  it('shows each recruiter with their hires and their share of all hires', async () => {
    get.mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersLeaderboardCard />);

    const rows = within(await screen.findByRole('list')).getAllByRole('listitem');

    expect(screen.getByRole('heading', { name: 'Top Recruiters by Hires' })).toBeInTheDocument();
    expect(rows).toHaveLength(5);
    expect(within(rows[0]!).getByText('Rajesh Kumar')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('96')).toBeInTheDocument();
    expect(within(rows[0]!).getByText('(16.3%)')).toBeInTheDocument();
  });

  it('asks for the range in the URL', async () => {
    get.mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersLeaderboardCard />, { route: '/?range=90d' });

    await screen.findByRole('list');

    expect(get).toHaveBeenCalledWith(RECRUITERS_URL, { range: '90d' });
  });

  it('shows an error with a working retry when the request fails', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersLeaderboardCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Rajesh Kumar')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the empty state when no recruiter has a hire in the period', async () => {
    get.mockResolvedValue({ ...RECRUITERS_REPORT, top_recruiters: [] });
    renderPage(<ReportsRecruitersLeaderboardCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
