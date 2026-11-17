import { cloneElement, type ReactElement } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import type { ReportsTimeToHire } from '../schemas/adminReportsDrilldown';
import { ReportsTimeToHireTrendCard } from './ReportsTimeToHireTrendCard';

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
const TIME_TO_HIRE_URL = '/hire/admin/reports/overview/time-to-hire';
const CHART_NAME = 'Average time to hire from 26 May to 24 Jun';
const GREEN = 'text-[#0F7A3A]';
const RED = 'text-[#B42318]';

/** The same sample days as the Hiring Trend chart. */
const DATES = [
  '2026-05-26',
  '2026-05-30',
  '2026-06-03',
  '2026-06-07',
  '2026-06-11',
  '2026-06-15',
  '2026-06-19',
  '2026-06-24'
];

/** One sample per day above; a missing value is a day on which nobody had been hired yet. */
function trendOf(values: (number | null)[]) {
  return DATES.map((date, index) => ({ date, average_days: values[index] ?? null }));
}

/** The 30-day view as drawn in the reference picture: 6.8 days, 22% quicker than the 30 days before. */
const TIME_TO_HIRE: ReportsTimeToHire = {
  range: { from: '2026-05-26', to: '2026-06-24' },
  average_days: 6.8,
  change_pct: -22,
  hires_counted: 590,
  trend: trendOf([9.4, 8.9, 8.2, 7.6, 7.4, 7.1, 6.9, 6.8]),
  by_category: []
};

/** A 30-day window in which nobody was hired. */
const NO_HIRES: ReportsTimeToHire = {
  ...TIME_TO_HIRE,
  average_days: null,
  change_pct: null,
  hires_counted: 0,
  trend: trendOf([])
};

/** The pill is the element around the bold percent and the words after it. */
async function findPill(percent: string) {
  const pill = (await screen.findByText(percent)).parentElement;
  if (!pill) throw new Error(`Nothing around ${percent}`);
  return pill;
}

function axisLabels(container: HTMLElement, axis: 'xAxis' | 'yAxis'): string[] {
  return Array.from(container.querySelectorAll(`.recharts-${axis} .recharts-cartesian-axis-tick`))
    .map((tick) => tick.textContent ?? '')
    .filter(Boolean);
}

beforeEach(() => {
  vi.resetAllMocks();
  get.mockResolvedValue(TIME_TO_HIRE);
});

describe('ReportsTimeToHireTrendCard', () => {
  it('shows the title with the average, the subtitle, and asks for the range in the URL', async () => {
    renderPage(<ReportsTimeToHireTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(
      screen.getByRole('heading', { name: 'Average Time to Hire: 6.8 days' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Average number of days from application to hire.')
    ).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith(TIME_TO_HIRE_URL, { range: '30d' });
  });

  it('shows a fall as a green pill with a down arrow and a minus sign', async () => {
    renderPage(<ReportsTimeToHireTrendCard />);

    const pill = await findPill('-22%');

    expect(pill).toHaveTextContent('-22% vs previous 30 days');
    expect(pill).toHaveClass(GREEN);
    expect(pill.querySelector('svg')).toHaveClass('lucide-arrow-down');
  });

  it('shows a rise as a red pill with an up arrow and a plus sign', async () => {
    get.mockResolvedValue({ ...TIME_TO_HIRE, average_days: 7.5, change_pct: 10 });
    renderPage(<ReportsTimeToHireTrendCard />);

    const pill = await findPill('+10%');

    expect(pill).toHaveTextContent('+10% vs previous 30 days');
    expect(pill).toHaveClass(RED);
    expect(pill.querySelector('svg')).toHaveClass('lucide-arrow-up');
    expect(
      screen.getByRole('heading', { name: 'Average Time to Hire: 7.5 days' })
    ).toBeInTheDocument();
  });

  it('shows no change as 0% in a neutral colour with no arrow', async () => {
    get.mockResolvedValue({ ...TIME_TO_HIRE, change_pct: 0 });
    renderPage(<ReportsTimeToHireTrendCard />);

    const pill = await findPill('0%');

    expect(pill).toHaveTextContent('0% vs previous 30 days');
    expect(pill).not.toHaveClass(GREEN);
    expect(pill).not.toHaveClass(RED);
    expect(pill.querySelector('svg')).not.toBeInTheDocument();
  });

  it('counts the days of the pill from the range in the URL', async () => {
    renderPage(<ReportsTimeToHireTrendCard />, { route: '/?range=90d' });

    expect(await findPill('-22%')).toHaveTextContent('-22% vs previous 90 days');
    expect(get).toHaveBeenCalledWith(TIME_TO_HIRE_URL, { range: '90d' });
  });

  it('shows a dash and no coloured pill when there is no earlier window to compare with', async () => {
    get.mockResolvedValue({ ...TIME_TO_HIRE, change_pct: null });
    renderPage(<ReportsTimeToHireTrendCard />);

    const note = await screen.findByText('— vs previous 30 days');

    expect(note).not.toHaveClass(GREEN);
    expect(note).not.toHaveClass(RED);
    expect(note).toHaveAttribute('title', 'No hires in the previous 30 days to compare with');
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('shows a dash for a missing average and draws no pill', async () => {
    get.mockResolvedValue({ ...TIME_TO_HIRE, average_days: null, change_pct: null });
    renderPage(<ReportsTimeToHireTrendCard />);

    expect(
      await screen.findByRole('heading', { name: 'Average Time to Hire: —' })
    ).toBeInTheDocument();
    expect(screen.queryByText(/vs previous/)).not.toBeInTheDocument();
  });

  it('shows the empty state when nobody was hired in the window', async () => {
    get.mockResolvedValue(NO_HIRES);
    renderPage(<ReportsTimeToHireTrendCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Average Time to Hire: —' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: CHART_NAME })).not.toBeInTheDocument();
    expect(screen.queryByText(/vs previous/)).not.toBeInTheDocument();
  });

  it('shows the empty state when the count says no hire, whatever the samples say', async () => {
    get.mockResolvedValue({ ...TIME_TO_HIRE, hires_counted: 0 });
    renderPage(<ReportsTimeToHireTrendCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: CHART_NAME })).not.toBeInTheDocument();
  });

  it('shows the empty state when no sample has a value to draw', async () => {
    get.mockResolvedValue({ ...TIME_TO_HIRE, trend: trendOf([]) });
    renderPage(<ReportsTimeToHireTrendCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: CHART_NAME })).not.toBeInTheDocument();
  });

  it('draws the value axis in days from 0 to 12 for a usual wait, as in the picture', async () => {
    const { container } = renderPage(<ReportsTimeToHireTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(axisLabels(container, 'yAxis')).toEqual([
      '0',
      '2 days',
      '4 days',
      '6 days',
      '8 days',
      '10 days',
      '12 days'
    ]);
  });

  it('goes on to the next even number when a sample is above 12 days', async () => {
    get.mockResolvedValue({
      ...TIME_TO_HIRE,
      trend: trendOf([13.1, 11, 9.2, 8.6, 7.4, 7.1, 6.9, 6.8])
    });
    const { container } = renderPage(<ReportsTimeToHireTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(axisLabels(container, 'yAxis')).toEqual([
      '0',
      '2 days',
      '4 days',
      '6 days',
      '8 days',
      '10 days',
      '12 days',
      '14 days'
    ]);
  });

  it('doubles the step instead of crowding the labels when the wait is long', async () => {
    get.mockResolvedValue({
      ...TIME_TO_HIRE,
      trend: trendOf([31.2, 28, 24, 20, 18, 16, 15, 14.5])
    });
    const { container } = renderPage(<ReportsTimeToHireTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(axisLabels(container, 'yAxis')).toEqual([
      '0',
      '4 days',
      '8 days',
      '12 days',
      '16 days',
      '20 days',
      '24 days',
      '28 days',
      '32 days'
    ]);
  });

  it('labels every sample with its day and short month', async () => {
    const { container } = renderPage(<ReportsTimeToHireTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(axisLabels(container, 'xAxis')).toEqual([
      '26 May',
      '30 May',
      '3 Jun',
      '7 Jun',
      '11 Jun',
      '15 Jun',
      '19 Jun',
      '24 Jun'
    ]);
  });

  it('tags the last sample with its value in days', async () => {
    renderPage(<ReportsTimeToHireTrendCard />);

    expect(await screen.findByText('6.8 days')).toBeInTheDocument();
  });

  it('draws the end tag as white text on solid orange', async () => {
    renderPage(<ReportsTimeToHireTrendCard />);

    const tag = await screen.findByText('6.8 days');

    expect(tag).toHaveAttribute('fill', '#fff');
    expect(tag.parentElement?.querySelector('rect')).toHaveAttribute('fill', '#FF4B16');
  });

  it('keeps the end tag inside the chart, reaching past the last dot', async () => {
    const { container } = renderPage(<ReportsTimeToHireTrendCard />);

    const tag = await screen.findByText('6.8 days');
    const rect = tag.parentElement?.querySelector('rect');
    const dot = container.querySelector('.recharts-reference-dot-dot');
    const left = Number(rect?.getAttribute('x'));
    const right = left + Number(rect?.getAttribute('width'));

    expect(left).toBeGreaterThan(0);
    expect(right).toBeGreaterThan(Number(dot?.getAttribute('cx')));
    expect(right).toBeLessThanOrEqual(800);
  });

  it('puts a dot on every sample', async () => {
    const { container } = renderPage(<ReportsTimeToHireTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(container.querySelectorAll('.recharts-area-dot')).toHaveLength(8);
  });

  it('leaves out the dot of a day on which nobody had been hired yet', async () => {
    get.mockResolvedValue({
      ...TIME_TO_HIRE,
      trend: trendOf([null, null, 8.2, 7.6, 7.4, 7.1, 6.9, 6.8])
    });
    const { container } = renderPage(<ReportsTimeToHireTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(container.querySelectorAll('.recharts-area-dot')).toHaveLength(6);
  });

  it('gives screen readers the chart as a picture with a name and every sample as a sentence', async () => {
    get.mockResolvedValue({
      ...TIME_TO_HIRE,
      trend: trendOf([null, 8.9, 8.2, 7.6, 7.4, 7.1, 6.9, 6.8])
    });
    renderPage(<ReportsTimeToHireTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(screen.getByText('26 May: no hires yet')).toBeInTheDocument();
    expect(screen.getByText('30 May: 8.9 days')).toBeInTheDocument();
    expect(screen.getByText('24 Jun: 6.8 days')).toBeInTheDocument();
    expect(screen.getAllByText(/^\d+ [A-Z][a-z]{2}: /)).toHaveLength(8);
  });

  it('shows a loading status while the first request is out', () => {
    get.mockReturnValue(new Promise(() => {}));
    renderPage(<ReportsTimeToHireTrendCard />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading Average Time to Hire');
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsTimeToHireTrendCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('img', { name: CHART_NAME })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
