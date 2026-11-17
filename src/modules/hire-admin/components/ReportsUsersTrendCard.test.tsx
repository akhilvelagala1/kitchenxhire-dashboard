import { cloneElement, type ReactElement } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { USERS_REPORT } from './reportsTestData';
import { ReportsUsersTrendCard } from './ReportsUsersTrendCard';

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

describe('ReportsUsersTrendCard', () => {
  it('shows the title and names the chart from the first to the last month', async () => {
    get.mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsUsersTrendCard />);

    expect(screen.getByRole('heading', { name: 'User Registration Trend' })).toBeInTheDocument();
    expect(
      await screen.findByRole('img', { name: 'User registration trend from Jan to Jun' })
    ).toBeInTheDocument();
  });

  it('lists every sample for screen readers', async () => {
    get.mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsUsersTrendCard />);

    expect(await screen.findByText('Jan: 10,770 total users')).toBeInTheDocument();
    expect(screen.getByText('Jun: 25,830 total users')).toBeInTheDocument();
  });

  it('shows the empty state when there is no sample', async () => {
    get.mockResolvedValue({ ...USERS_REPORT, user_growth: [] });
    renderPage(<ReportsUsersTrendCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(USERS_REPORT);
    renderPage(<ReportsUsersTrendCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Jan: 10,770 total users')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
