import { cloneElement, type ReactElement } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { JOBS_REPORT } from './reportsTestData';
import { ReportsJobsTrendCard } from './ReportsJobsTrendCard';

vi.mock('@/shared/api/apiClient', () => ({ apiClient: { get: vi.fn() } }));

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({
      children
    }: {
      children: ReactElement<{ width: number; height: number }>;
    }) => cloneElement(children, { width: 900, height: 266 })
  };
});

const get = vi.mocked(apiClient.get);

beforeEach(() => vi.resetAllMocks());

describe('ReportsJobsTrendCard', () => {
  it('shows the title and names the chart from the first to the last date', async () => {
    get.mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsJobsTrendCard />);

    expect(screen.getByRole('heading', { name: 'Jobs Posted Trend' })).toBeInTheDocument();
    expect(
      await screen.findByRole('img', { name: 'Jobs posted trend from 26 May to 24 Jun' })
    ).toBeInTheDocument();
  });

  it('lists every sample for screen readers', async () => {
    get.mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsJobsTrendCard />);

    expect(await screen.findByText('26 May: 81 jobs posted')).toBeInTheDocument();
    expect(screen.getByText('24 Jun: 312 jobs posted')).toBeInTheDocument();
  });

  it('shows the empty state when there is no sample', async () => {
    get.mockResolvedValue({ ...JOBS_REPORT, jobs_trend: [] });
    renderPage(<ReportsJobsTrendCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(JOBS_REPORT);
    renderPage(<ReportsJobsTrendCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('26 May: 81 jobs posted')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
