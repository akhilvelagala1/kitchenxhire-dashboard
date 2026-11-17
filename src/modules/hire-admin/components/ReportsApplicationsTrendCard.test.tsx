import { cloneElement, type ReactElement } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { APPLICATIONS_REPORT } from './reportsTestData';
import { ReportsApplicationsTrendCard } from './ReportsApplicationsTrendCard';

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

describe('ReportsApplicationsTrendCard', () => {
  it('shows the title and names the chart from the first to the last date', async () => {
    get.mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsApplicationsTrendCard />);

    expect(screen.getByRole('heading', { name: 'Applications Trend' })).toBeInTheDocument();
    expect(
      await screen.findByRole('img', { name: 'Applications trend from 26 May to 24 Jun' })
    ).toBeInTheDocument();
  });

  it('lists every sample for screen readers', async () => {
    get.mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsApplicationsTrendCard />);

    expect(await screen.findByText('26 May: 469 applications')).toBeInTheDocument();
    expect(screen.getByText('24 Jun: 1,842 applications')).toBeInTheDocument();
  });

  it('shows the empty state when there is no sample', async () => {
    get.mockResolvedValue({ ...APPLICATIONS_REPORT, applications_trend: [] });
    renderPage(<ReportsApplicationsTrendCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(APPLICATIONS_REPORT);
    renderPage(<ReportsApplicationsTrendCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('26 May: 469 applications')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
