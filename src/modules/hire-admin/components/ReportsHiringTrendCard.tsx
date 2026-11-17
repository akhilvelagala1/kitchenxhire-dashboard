import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Customized,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from 'recharts';
import { cn } from '@/shared/lib/cn';
import type { HiringTrendPoint } from '../schemas/adminReports';
import { ReportCard } from './ReportCard';
import { formatCount } from './reportsFormat';
import {
  TREND_SERIES,
  formatTrendDate,
  trendAriaLabel,
  trendAxis,
  trendRightMargin,
  trendSummary
} from './reportsTrend';
import { ReportsTrendEndTags } from './ReportsTrendEndTags';
import { useElementScale } from './useElementScale';
import { useReportsOverview } from './useReportsOverview';

const GRID_COLOR = '#E7E9F0';
const TICK_COLOR = '#475467';
const GRADIENT_ID = 'reports-hiring-trend';

/** Chart numbers in u (1u is 1px at the 1600x900 reference). The top margin leaves room for the tag above the highest dot. */
const MARGIN_TOP = 22;
const Y_AXIS_WIDTH = 54;
const Y_TICK_GAP = 11;
const X_AXIS_HEIGHT = 30;
const X_TICK_GAP = 13;
const TICK_FONT = 13.5;
const LINE_WIDTH = 2.5;

function TrendLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#475467] lg:mt-[calc(14*var(--u))] lg:mr-[calc(14*var(--u))] lg:gap-x-[calc(24*var(--u))] lg:text-[calc(13*var(--u))]">
      {TREND_SERIES.map((series) => (
        <li key={series.key} className="flex items-center gap-1.5 lg:gap-[calc(7*var(--u))]">
          <span
            aria-hidden="true"
            className={cn('size-2.5 rounded-full lg:size-[calc(10*var(--u))]', series.dotClass)}
          />
          {series.label}
        </li>
      ))}
    </ul>
  );
}

function TrendTooltip({ active, payload }: TooltipProps<number, string>) {
  const point = payload?.[0]?.payload as HiringTrendPoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-[#E7E9F0] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-[#101828]">{formatTrendDate(point.date)}</p>
      <ul className="mt-1 space-y-0.5">
        {TREND_SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-2 text-[#475467]">
            <span aria-hidden="true" className={cn('size-2 rounded-full', series.dotClass)} />
            {series.label}
            <span className="ml-auto pl-3 font-semibold text-[#101828]">
              {formatCount(point[series.key])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrendChart({ points }: { points: HiringTrendPoint[] }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const u = useElementScale(box);
  const last = points.at(-1);
  if (!last) return null;
  const axis = trendAxis(points);
  const tick = { fill: TICK_COLOR, fontSize: TICK_FONT * u };

  return (
    <>
      <div ref={setBox} className="relative min-h-60 flex-1 lg:min-h-0">
        <div role="img" aria-label={trendAriaLabel(points)} className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{
                top: MARGIN_TOP * u,
                right: trendRightMargin(last) * u,
                bottom: 0,
                left: 0
              }}
            >
              <defs>
                {TREND_SERIES.map((series) => (
                  <linearGradient
                    key={series.key}
                    id={`${GRADIENT_ID}-${series.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={series.color} stopOpacity={series.fillTop} />
                    <stop offset="100%" stopColor={series.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis
                dataKey="date"
                interval="preserveStartEnd"
                tickFormatter={formatTrendDate}
                tick={tick}
                axisLine={false}
                tickLine={false}
                tickSize={0}
                tickMargin={X_TICK_GAP * u}
                height={X_AXIS_HEIGHT * u}
              />
              <YAxis
                domain={[0, axis.max]}
                ticks={axis.ticks}
                interval={0}
                tickFormatter={(value: number) => formatCount(value)}
                tick={tick}
                axisLine={false}
                tickLine={false}
                tickSize={0}
                tickMargin={Y_TICK_GAP * u}
                width={Y_AXIS_WIDTH * u}
              />
              <Tooltip cursor={{ stroke: GRID_COLOR }} content={<TrendTooltip />} />
              {TREND_SERIES.map((series) => (
                <Area
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  stroke={series.color}
                  strokeWidth={LINE_WIDTH * u}
                  strokeLinecap="round"
                  fill={`url(#${GRADIENT_ID}-${series.key})`}
                  dot={false}
                  activeDot={{ r: 4 * u, fill: series.color, stroke: '#fff', strokeWidth: 2 * u }}
                  isAnimationActive={false}
                />
              ))}
              <Customized
                component={
                  <ReportsTrendEndTags
                    lastPoint={last}
                    pointCount={points.length}
                    axisMax={axis.max}
                    scaleUnit={u}
                  />
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ul className="sr-only">
        {points.map((point) => (
          <li key={point.date}>{trendSummary(point)}</li>
        ))}
      </ul>
    </>
  );
}

/** Jobs, applications and hires over the chosen range: three smooth areas with the last value tagged. */
export function ReportsHiringTrendCard() {
  const { data, isLoading, error, refetch } = useReportsOverview();
  const points = data?.hiring_trend ?? [];

  return (
    <ReportCard
      title="Hiring Trend"
      subtitle="Jobs, applications and hires over time."
      aside={<TrendLegend />}
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={points.length === 0}
      className="h-full min-h-0"
    >
      <TrendChart points={points} />
    </ReportCard>
  );
}
