import { cloneElement, type ReactElement } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { RECRUITERS_REPORT } from './reportsTestData';
import { ReportsRecruitersActivityCard } from './ReportsRecruitersActivityCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({
      children
    }: {
      children: ReactElement<{ width: number; height: number }>;
    }) => cloneElement(children, { width: 900, height: 300 })
  };
});

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsRecruitersActivityCard', () => {
  it('shows the title, the legend and names the chart from the first to the last date', async () => {
    get.mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersActivityCard />);

    expect(screen.getByRole('heading', { name: 'Recruiter Activity Trend' })).toBeInTheDocument();
    expect(screen.getByText('Jobs Posted')).toBeInTheDocument();
    expect(screen.getByText('Hires')).toBeInTheDocument();
    expect(
      await screen.findByRole('img', {
        name: 'Recruiter activity trend from 26 May to 24 Jun: jobs posted and hires'
      })
    ).toBeInTheDocument();
  });

  it('lists every sample for screen readers', async () => {
    get.mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersActivityCard />);

    expect(await screen.findByText('26 May: 211 jobs posted, 67 hires')).toBeInTheDocument();
    expect(screen.getByText('24 Jun: 812 jobs posted, 590 hires')).toBeInTheDocument();
  });

  it('shows the empty state when there is no sample', async () => {
    get.mockResolvedValue({ ...RECRUITERS_REPORT, recruiter_activity: [] });
    renderPage(<ReportsRecruitersActivityCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(RECRUITERS_REPORT);
    renderPage(<ReportsRecruitersActivityCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('26 May: 211 jobs posted, 67 hires')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
