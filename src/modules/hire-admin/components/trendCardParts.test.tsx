import { cloneElement, type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { TrendChart } from './trendCardParts';
import { DEFAULT_TREND_STYLE, type TrendChartStyle } from './trendChartStyle';

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

const POINTS = [
  { date: '2026-06-22', count: 900 },
  { date: '2026-06-23', count: 1200 },
  { date: '2026-06-24', count: 1460 }
];

function yLabels(style: TrendChartStyle): string[] {
  const { container } = render(
    <TrendChart points={POINTS} u={1} unit="things" gradientId="test-gradient" style={style} />
  );
  return Array.from(container.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick'))
    .map((tick) => tick.textContent ?? '')
    .filter(Boolean);
}

describe('TrendChart y axis', () => {
  it('rounds the axis up from the largest value when no range is given', () => {
    expect(yLabels(DEFAULT_TREND_STYLE)).toEqual(['0', '500', '1,000', '1,500']);
  });

  it('draws exactly the labels of a fixed axis range', () => {
    const labels = yLabels({
      ...DEFAULT_TREND_STYLE,
      axisRange: { min: 500, max: 2000, step: 500 }
    });

    expect(labels).toEqual(['500', '1,000', '1,500', '2,000']);
  });

  it('keeps the value badge of the last point on a fixed axis', () => {
    render(
      <TrendChart
        points={POINTS}
        u={1}
        unit="things"
        gradientId="test-gradient-badge"
        style={{ ...DEFAULT_TREND_STYLE, axisRange: { min: 0, max: 2000, step: 500 } }}
      />
    );

    expect(screen.getByText('1,460')).toBeInTheDocument();
  });
});
