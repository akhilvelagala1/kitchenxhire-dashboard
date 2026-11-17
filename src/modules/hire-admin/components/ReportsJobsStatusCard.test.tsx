import { cloneElement, type ReactElement } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { JOBS_REPORT } from './reportsTestData';
import { ReportsJobsStatusCard } from './ReportsJobsStatusCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

/** jsdom has no layout, so the real container measures 0 x 0 and draws nothing. */
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({
      children
    }: {
      children: ReactElement<{ width: number; height: number }>;
    }) => cloneElement(children, { width: 193, height: 193 })
  };
});

const get = vi.mocked(apiClient.get);

async function rowTexts(): Promise<(string | null)[]> {
  const list = await screen.findByRole('list');
  return within(list)
    .getAllByRole('listitem')
    .map((row) => row.textContent);
}

beforeEach(() => {
  vi.resetAllMocks();
  get.mockResolvedValue(JOBS_REPORT);
});

describe('ReportsJobsStatusCard', () => {
  it('shows the title and the total in the middle of the donut', async () => {
    renderPage(<ReportsJobsStatusCard />);

    expect(screen.getByRole('heading', { name: 'Jobs by Status' })).toBeInTheDocument();
    expect(await screen.findByText('1,482')).toBeInTheDocument();
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
  });

  it('lists every real job status with its count and its share of the total', async () => {
    renderPage(<ReportsJobsStatusCard />);

    expect(await rowTexts()).toEqual([
      'Active1,120(75.6%)',
      'Under Review140(9.4%)',
      'Paused60(4.0%)',
      'Closed122(8.2%)',
      'Draft40(2.7%)'
    ]);
  });

  it('draws one slice per status that has jobs and names the donut', async () => {
    const { container } = renderPage(<ReportsJobsStatusCard />);

    expect(
      await screen.findByRole('img', { name: 'Donut chart of 1,482 jobs split by status' })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(5);
  });

  it('says so when there is no job in the period', async () => {
    get.mockResolvedValue({ ...JOBS_REPORT, jobs_status: [] });
    renderPage(<ReportsJobsStatusCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsJobsStatusCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('1,482')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
