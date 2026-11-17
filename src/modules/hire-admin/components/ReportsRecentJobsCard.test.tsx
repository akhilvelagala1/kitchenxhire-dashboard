import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { JOBS_REPORT } from './reportsTestData';
import { ReportsRecentJobsCard } from './ReportsRecentJobsCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsRecentJobsCard', () => {
  it('lists the recent jobs with their id, title, outlet, applications and status', async () => {
    get.mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsRecentJobsCard />);

    expect(screen.getByRole('heading', { name: 'Recent Jobs' })).toBeInTheDocument();
    const table = await screen.findByRole('table');
    expect(within(table).getByText('JOB-2041')).toBeInTheDocument();
    expect(within(table).getByText('Cook / Chef')).toBeInTheDocument();
    expect(within(table).getByText('KitchenX - Banjara Hills')).toBeInTheDocument();
    expect(within(table).getByText('42')).toBeInTheDocument();
    expect(within(table).getAllByText('Active')).toHaveLength(2);
    expect(within(table).getByText('Closed')).toBeInTheDocument();
  });

  it('shows the empty state when no job was posted in the window', async () => {
    get.mockResolvedValue({ ...JOBS_REPORT, recent_jobs: [] });
    renderPage(<ReportsRecentJobsCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsRecentJobsCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('JOB-2041')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
