import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { RECRUITERS_REPORT } from './reportsTestData';
import { ReportsRecruitersKpiRow } from './ReportsRecruitersKpiRow';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsRecruitersKpiRow', () => {
  it('shows the five figures with their change and an accessible name', async () => {
    get.mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersKpiRow />);

    const total = await screen.findByRole('group', {
      name: 'Total Recruiters, 312, up 10% vs previous 30 days'
    });
    expect(total).toHaveTextContent('312');
    expect(
      screen.getByRole('group', { name: 'Active Recruiters, 248, up 12% vs previous 30 days' })
    ).toHaveTextContent('+12%');
    expect(screen.getByRole('group', { name: /^Inactive Recruiters/ })).toHaveTextContent('48');
    expect(screen.getByRole('group', { name: /^New Recruiters/ })).toHaveTextContent('28');
    expect(screen.getByRole('group', { name: /^Avg\. Hires per Recruiter/ })).toHaveTextContent(
      '2.4'
    );
    expect(get).toHaveBeenCalledWith('/hire/admin/reports/recruiters', { range: '30d' });
  });

  it('draws a fall in inactive recruiters green, since fewer inactive is good', async () => {
    get.mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersKpiRow />);

    const inactive = await screen.findByRole('group', { name: /^Inactive Recruiters/ });
    expect(inactive).toHaveTextContent('-6%');
  });

  it('shows a loading status first, then an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersKpiRow />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading report figures');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load the report figures');

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('group', { name: /^Active Recruiters/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
