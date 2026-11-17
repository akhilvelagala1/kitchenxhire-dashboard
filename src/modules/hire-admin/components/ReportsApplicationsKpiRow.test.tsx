import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { APPLICATIONS_REPORT } from './reportsTestData';
import { ReportsApplicationsKpiRow } from './ReportsApplicationsKpiRow';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsApplicationsKpiRow', () => {
  it('shows the five figures with their change and an accessible name', async () => {
    get.mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsApplicationsKpiRow />);

    const total = await screen.findByRole('group', {
      name: 'Total Applications, 8,672, up 18% vs previous 30 days'
    });
    expect(total).toHaveTextContent('8,672');
    expect(
      screen.getByRole('group', { name: 'Shortlisted, 4,960, up 20% vs previous 30 days' })
    ).toHaveTextContent('+20%');
    expect(screen.getByRole('group', { name: /^Under Review/ })).toHaveTextContent('2,086');
    expect(screen.getByRole('group', { name: /^Hired/ })).toHaveTextContent('590');
    expect(
      screen.getByRole('group', { name: 'Rejected, 1,036, down 5% vs previous 30 days' })
    ).toHaveTextContent('-5%');
    expect(get).toHaveBeenCalledWith('/hire/admin/reports/applications', { range: '30d' });
  });

  it('shows a loading status first, then an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsApplicationsKpiRow />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading report figures');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the report figures');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('group', { name: /^Hired/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
