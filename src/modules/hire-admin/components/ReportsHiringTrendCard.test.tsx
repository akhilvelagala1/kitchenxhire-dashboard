import { cloneElement, type ReactElement } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { ReportsHiringTrendCard } from './ReportsHiringTrendCard';
import { REPORTS_OVERVIEW } from './reportsTestData';

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
const CHART_NAME = 'Hiring trend from 26 May to 24 Jun: applications, jobs and hires';

function axisLabels(container: HTMLElement, axis: 'xAxis' | 'yAxis'): string[] {
  return Array.from(container.querySelectorAll(`.recharts-${axis} .recharts-cartesian-axis-tick`))
    .map((tick) => tick.textContent ?? '')
    .filter(Boolean);
}

beforeEach(() => {
  vi.resetAllMocks();
  get.mockResolvedValue(REPORTS_OVERVIEW);
});

describe('ReportsHiringTrendCard', () => {
  it('shows the title, the subtitle and what each colour stands for', async () => {
    renderPage(<ReportsHiringTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(screen.getByRole('heading', { name: 'Hiring Trend' })).toBeInTheDocument();
    expect(screen.getByText('Jobs, applications and hires over time.')).toBeInTheDocument();
    const legend = screen.getAllByRole('list')[0] as HTMLElement;
    expect(
      within(legend)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['Applications', 'Jobs', 'Hires']);
    expect(get).toHaveBeenCalledWith('/hire/admin/reports/overview', { range: '30d' });
  });

  it('draws the value axis from 0 up to the next round number above the highest series', async () => {
    const { container } = renderPage(<ReportsHiringTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(axisLabels(container, 'yAxis')).toEqual(['0', '500', '1,000', '1,500', '2,000']);
  });

  it('labels every sample with its day and short month', async () => {
    const { container } = renderPage(<ReportsHiringTrendCard />);
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

  it('tags the last sample of each series with its value', async () => {
    renderPage(<ReportsHiringTrendCard />);

    expect(await screen.findByText('1,842')).toBeInTheDocument();
    expect(screen.getByText('312')).toBeInTheDocument();
    expect(screen.getByText('124')).toBeInTheDocument();
  });

  it('gives screen readers the chart as a picture with a name and every sample as a sentence', async () => {
    renderPage(<ReportsHiringTrendCard />);
    await screen.findByRole('img', { name: CHART_NAME });

    expect(screen.getByText('26 May: 469 applications, 81 jobs, 14 hires')).toBeInTheDocument();
    expect(screen.getByText('24 Jun: 1,842 applications, 312 jobs, 124 hires')).toBeInTheDocument();
    expect(screen.getAllByText(/applications, \d+ jobs, \d+ hires$/)).toHaveLength(8);
  });

  it('says so when the range has no samples', async () => {
    get.mockResolvedValue({ ...REPORTS_OVERVIEW, hiring_trend: [] });
    renderPage(<ReportsHiringTrendCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: CHART_NAME })).not.toBeInTheDocument();
  });

  it('shows a loading status while the first request is out', () => {
    get.mockReturnValue(new Promise(() => {}));
    renderPage(<ReportsHiringTrendCard />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading Hiring Trend');
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsHiringTrendCard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('img', { name: CHART_NAME })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
