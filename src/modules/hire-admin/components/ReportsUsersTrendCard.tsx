import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from 'recharts';
import type { UserGrowthPoint } from '../schemas/adminReports';
import { niceAxis } from './reportsAxis';
import { ReportCard } from './ReportCard';
import { formatCount } from './reportsFormat';
import { monthLabel } from './reportsGrowth';
import { useElementScale } from './useElementScale';
import { useReportsUsers } from './useReportsUsers';

const LINE_COLOR = '#FF4B16';
const GRID_COLOR = '#E7E9F0';
const TICK_COLOR = '#475467';
const GRADIENT_ID = 'reports-users-trend';

const MARGIN_TOP = 22;
const Y_AXIS_WIDTH = 54;
const Y_TICK_GAP = 11;
const X_AXIS_HEIGHT = 30;
const X_TICK_GAP = 13;
const TICK_FONT = 13.5;
const LINE_WIDTH = 2.5;

function TrendTooltip({ active, payload }: TooltipProps<number, string>) {
  const point = payload?.[0]?.payload as UserGrowthPoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-[#E7E9F0] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-[#101828]">{monthLabel(point.month)}</p>
      <p className="text-[#475467]">{formatCount(point.users)} total users</p>
    </div>
  );
}

function TrendChart({ points }: { points: UserGrowthPoint[] }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const u = useElementScale(box);
  if (points.length === 0) return null;
  const peak = Math.max(0, ...points.map((p) => p.users));
  const { max, step } = niceAxis(peak, 4);
  const ticks = Array.from({ length: 5 }, (_, i) => i * step);
  const tick = { fill: TICK_COLOR, fontSize: TICK_FONT * u };

  return (
    <>
      <div ref={setBox} className="relative min-h-60 flex-1 lg:min-h-0">
        <div
          role="img"
          aria-label={`User registration trend from ${monthLabel(points[0]!.month)} to ${monthLabel(points.at(-1)!.month)}`}
          className="absolute inset-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: MARGIN_TOP * u, right: 12 * u, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={GRID_COLOR} />
              <XAxis
                dataKey="month"
                interval="preserveStartEnd"
                tickFormatter={monthLabel}
                tick={tick}
                axisLine={false}
                tickLine={false}
                tickSize={0}
                tickMargin={X_TICK_GAP * u}
                height={X_AXIS_HEIGHT * u}
              />
              <YAxis
                domain={[0, max]}
                ticks={ticks}
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
              <Area
                type="monotone"
                dataKey="users"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH * u}
                strokeLinecap="round"
                fill={`url(#${GRADIENT_ID})`}
                dot={false}
                activeDot={{ r: 4 * u, fill: LINE_COLOR, stroke: '#fff', strokeWidth: 2 * u }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ul className="sr-only">
        {points.map((point) => (
          <li key={point.month}>
            {monthLabel(point.month)}: {formatCount(point.users)} total users
          </li>
        ))}
      </ul>
    </>
  );
}

/** Total registered users at the end of each of the last six months, the same shape as Platform Growth. */
export function ReportsUsersTrendCard() {
  const { data, isLoading, error, refetch } = useReportsUsers();
  const points = data?.user_growth ?? [];

  return (
    <ReportCard
      title="User Registration Trend"
      subtitle="New user registrations over time."
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
