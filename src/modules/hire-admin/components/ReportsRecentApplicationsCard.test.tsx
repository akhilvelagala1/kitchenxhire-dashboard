import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { APPLICATIONS_REPORT } from './reportsTestData';
import { ReportsRecentApplicationsCard } from './ReportsRecentApplicationsCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsRecentApplicationsCard', () => {
  it('lists the recent applications with their id, applicant, job title and status', async () => {
    get.mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsRecentApplicationsCard />);

    expect(screen.getByRole('heading', { name: 'Recent Applications' })).toBeInTheDocument();
    const table = await screen.findByRole('table');
    expect(within(table).getByText('APP-9421')).toBeInTheDocument();
    expect(within(table).getByText('Priya Sharma')).toBeInTheDocument();
    expect(within(table).getByText('Cook / Chef')).toBeInTheDocument();
    expect(within(table).getByText('Shortlisted')).toBeInTheDocument();
    expect(within(table).getByText('Pending Review')).toBeInTheDocument();
    expect(within(table).getByText('Rejected')).toBeInTheDocument();
  });

  it('shows the empty state when no application was received in the window', async () => {
    get.mockResolvedValue({ ...APPLICATIONS_REPORT, recent_applications: [] });
    renderPage(<ReportsRecentApplicationsCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsRecentApplicationsCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('APP-9421')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
