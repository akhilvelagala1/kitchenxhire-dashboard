import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Spinner } from '@/shared/ui/Spinner';
import { fetchApplicationsTrend } from '../api/hireDashboardApi';
import { hireDashboardKeys } from '../api/hireDashboardKeys';
import type { TrendRange } from '../api/hireDashboardTypes';
import { dashboardCardClass } from './dashboardCardStyles';
import { TrendRangeDropdown } from './TrendRangeDropdown';

function formatAxisDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function yAxisMax(values: number[]) {
  const peak = Math.max(...values, 0);
  if (peak <= 2000) return 2000;
  return Math.ceil(peak / 500) * 500;
}

export function ApplicationsTrendCard() {
  const [range, setRange] = useState<TrendRange>('30d');
  const { data, isLoading, isError } = useQuery({
    queryKey: hireDashboardKeys.trend(range),
    queryFn: () => fetchApplicationsTrend(range)
  });

  const chartData = useMemo(
    () =>
      data?.map((p) => ({
        ...p,
        label: formatAxisDate(p.date)
      })) ?? [],
    [data]
  );

  const yMax = useMemo(() => yAxisMax(chartData.map((d) => d.count)), [chartData]);
  const lastCount = chartData.at(-1)?.count;

  return (
    <section className={dashboardCardClass}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line/80 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Applications Trend</h2>
          <p className="text-sm text-[#667085]">Total applications received over time</p>
        </div>
        <TrendRangeDropdown value={range} onChange={setRange} />
      </div>
      <div className="relative min-h-0 flex-1 px-2 pb-3 pt-2">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {isError && <p className="p-4 text-sm text-ink-soft">Could not load trend data.</p>}
        {chartData.length > 0 && !isLoading && !isError && (
          <ResponsiveContainer width="100%" height="100%" minHeight={168}>
            <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="hireTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4F18" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#FF4F18" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E9EBF0" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#667085', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                domain={[0, yMax]}
                ticks={[0, 500, 1000, 1500, 2000].filter((t) => t <= yMax)}
                tick={{ fill: '#667085', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#FF4F18"
                strokeWidth={3}
                fill="url(#hireTrendFill)"
                dot={false}
                activeDot={{ r: 5, fill: '#FF4F18', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {lastCount !== undefined && !isLoading && (
          <p className="pointer-events-none absolute top-3 right-6 text-xs font-semibold text-ink">
            {lastCount.toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </section>
  );
}
