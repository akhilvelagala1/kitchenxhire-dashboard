import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { JOBS_REPORT } from './reportsTestData';
import { ReportsJobsKpiRow } from './ReportsJobsKpiRow';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsJobsKpiRow', () => {
  it('shows the five figures with their change and an accessible name', async () => {
    get.mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsJobsKpiRow />);

    const total = await screen.findByRole('group', {
      name: 'Total Jobs, 1,482, up 12% vs previous 30 days'
    });
    expect(total).toHaveTextContent('1,482');
    expect(
      screen.getByRole('group', { name: 'Active, 1,120, up 9% vs previous 30 days' })
    ).toHaveTextContent('+9%');
    expect(screen.getByRole('group', { name: /^Closed/ })).toHaveTextContent('122');
    expect(screen.getByRole('group', { name: /^Draft/ })).toHaveTextContent('40');
    expect(
      screen.getByRole('group', {
        name: 'Avg. Time to Fill, 6.8 days, down 22% vs previous 30 days'
      })
    ).toHaveTextContent('6.8 days');
    expect(get).toHaveBeenCalledWith('/hire/admin/reports/jobs', { range: '30d' });
  });

  it('shows a loading status first, then an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsJobsKpiRow />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading report figures');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the report figures');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('group', { name: /^Active/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
