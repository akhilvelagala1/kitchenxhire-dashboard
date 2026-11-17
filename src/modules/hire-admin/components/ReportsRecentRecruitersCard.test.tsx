import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { RECRUITERS_REPORT } from './reportsTestData';
import { ReportsRecentRecruitersCard } from './ReportsRecentRecruitersCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsRecentRecruitersCard', () => {
  it('lists the recent recruiters with their id, name, jobs posted, hires and status', async () => {
    get.mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecentRecruitersCard />);

    expect(screen.getByRole('heading', { name: 'Recent Recruiters' })).toBeInTheDocument();
    const table = await screen.findByRole('table');
    expect(within(table).getByText('REC-1048')).toBeInTheDocument();
    expect(within(table).getByText('Rahul Menon')).toBeInTheDocument();
    expect(within(table).getByText('KitchenX - Banjara Hills')).toBeInTheDocument();
    expect(within(table).getAllByText('Active')).toHaveLength(2);
    expect(within(table).getByText('Inactive')).toBeInTheDocument();
  });

  it('shows the empty state when no recruiter joined in the window', async () => {
    get.mockResolvedValue({ ...RECRUITERS_REPORT, recent_recruiters: [] });
    renderPage(<ReportsRecentRecruitersCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecentRecruitersCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('REC-1048')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
