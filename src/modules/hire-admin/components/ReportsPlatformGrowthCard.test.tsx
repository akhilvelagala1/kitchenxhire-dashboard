import { cloneElement, type ReactElement } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/shared/api/apiClient';
import { renderPage } from '@/shared/test/render';
import { ReportsPlatformGrowthCard } from './ReportsPlatformGrowthCard';
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

function tickLabels(axis: Element | null | undefined): string[] {
  return Array.from(axis?.querySelectorAll('.recharts-cartesian-axis-tick') ?? [])
    .map((tick) => tick.textContent ?? '')
    .filter(Boolean);
}

beforeEach(() => {
  vi.resetAllMocks();
  get.mockResolvedValue(REPORTS_OVERVIEW);
});

describe('ReportsPlatformGrowthCard', () => {
  it('shows the title, the legend and a tag with the latest value of each series', async () => {
    renderPage(<ReportsPlatformGrowthCard />);

    expect(screen.getByRole('heading', { name: 'Platform Growth' })).toBeInTheDocument();
    expect(screen.getByText('Job Seekers')).toBeInTheDocument();
    expect(screen.getByText('Recruiters')).toBeInTheDocument();
    expect(await screen.findByText('24,860')).toBeInTheDocument();
    expect(screen.getByText('312')).toBeInTheDocument();
    expect(get).toHaveBeenCalledWith('/hire/admin/reports/overview', { range: '30d' });
  });

  it('names the months and gives job seekers and recruiters a value scale each', async () => {
    const { container } = renderPage(<ReportsPlatformGrowthCard />);
    await screen.findByText('24,860');

    expect(tickLabels(container.querySelector('.recharts-xAxis'))).toEqual([
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun'
    ]);
    const [seekers, recruiters] = Array.from(container.querySelectorAll('.recharts-yAxis'));
    expect(tickLabels(seekers)).toEqual(['0', '5K', '10K', '15K', '20K', '25K']);
    expect(tickLabels(recruiters)).toEqual(['0', '100', '200', '300', '400', '500']);
  });

  it('describes the chart and every month for screen readers', async () => {
    renderPage(<ReportsPlatformGrowthCard />);
    await screen.findByText('24,860');

    expect(
      screen.getByRole('img', { name: 'Platform growth by month: job seekers and recruiters' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Jan: 9,800 job seekers, 120 recruiters',
      'Feb: 12,300 job seekers, 150 recruiters',
      'Mar: 15,200 job seekers, 190 recruiters',
      'Apr: 17,200 job seekers, 230 recruiters',
      'May: 20,700 job seekers, 270 recruiters',
      'Jun: 24,860 job seekers, 312 recruiters'
    ]);
  });

  it('shows a loading status while the numbers load', () => {
    get.mockReturnValue(new Promise(() => {}));
    renderPage(<ReportsPlatformGrowthCard />);

    expect(screen.getByText('Loading Platform Growth')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows an error with a working retry', async () => {
    get.mockRejectedValueOnce(new Error('boom'));
    renderPage(<ReportsPlatformGrowthCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('24,860')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('says so when there are no months to draw', async () => {
    get.mockResolvedValue({ ...REPORTS_OVERVIEW, platform_growth: [] });
    renderPage(<ReportsPlatformGrowthCard />);

    expect(await screen.findByText('No data for this period')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
