import { cloneElement, type ReactElement } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import type { ReportsTimeToHire } from '../schemas/adminReportsDrilldown';
import { ReportsTimeToHireSection } from './ReportsTimeToHireSection';

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
    }) => cloneElement(children, { width: 800, height: 240 })
  };
});

const get = vi.mocked(apiClient.get);
const TREND_TITLE = 'Average Time to Hire: 6.8 days';
const CATEGORIES_TITLE = 'Time to Hire – by Job Category';

const TIME_TO_HIRE: ReportsTimeToHire = {
  range: { from: '2026-05-26', to: '2026-06-24' },
  average_days: 6.8,
  change_pct: -22,
  hires_counted: 211,
  trend: [
    { date: '2026-05-26', average_days: 9.4 },
    { date: '2026-06-24', average_days: 6.8 }
  ],
  by_category: [{ label: 'Cook / Chef', average_days: 5.2, hires: 211 }]
};

beforeEach(() => {
  vi.resetAllMocks();
  get.mockResolvedValue(TIME_TO_HIRE);
});

describe('ReportsTimeToHireSection', () => {
  it('shows the trend card and the by-category card from one request', async () => {
    renderPage(<ReportsTimeToHireSection />);

    expect(await screen.findByRole('heading', { name: TREND_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: CATEGORIES_TITLE })).toBeInTheDocument();
    expect(await screen.findByText('Cook / Chef')).toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('shows an error in both cards, and one retry brings both back', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsTimeToHireSection />);

    expect(await screen.findAllByRole('alert')).toHaveLength(2);
    await userEvent.click(screen.getAllByRole('button', { name: 'Try again' })[0]!);

    expect(await screen.findByRole('heading', { name: TREND_TITLE })).toBeInTheDocument();
    expect(await screen.findByText('Cook / Chef')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(get).toHaveBeenCalledTimes(2);
  });
});
