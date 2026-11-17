import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from 'recharts';
import type { PlatformGrowthPoint } from '../schemas/adminReports';
import { ReportCard } from './ReportCard';
import { formatCount } from './reportsFormat';
import { describeGrowth, formatAxisThousands, growthAxes, monthLabel } from './reportsGrowth';
import { useElementScale } from './useElementScale';
import { useReportsOverview } from './useReportsOverview';

const SEEKERS_COLOR = '#FF4B16';
const RECRUITERS_COLOR = '#FFC7A6';
const AXIS_TEXT = '#475467';
const RECRUITERS_AXIS_TEXT = '#B4764F';
const GRID_COLOR = '#E7E9F0';

interface ValueTagProps {
  /** The tag is drawn on one bar only: the last month. */
  lastIndex: number;
  /** The page's scale unit, since SVG sizes are plain numbers. */
  scale: number;
  textColor: string;
  tintColor: string;
  /** Handed over by Recharts: the box of the bar, its value and its place in the data. */
  x?: number;
  y?: number;
  width?: number;
  value?: number | string;
  index?: number;
}

/** The small rounded value above the last bar of a series, centred on the bar. */
function ValueTag({
  lastIndex,
  scale,
  textColor,
  tintColor,
  x = 0,
  y = 0,
  width = 0,
  value,
  index
}: ValueTagProps) {
  const amount = Number(value);
  if (index !== lastIndex || value === undefined || !Number.isFinite(amount)) return null;
  const text = formatCount(amount);
  const tagWidth = (text.length * 8.3 + 18) * scale;
  const tagHeight = 25 * scale;
  const top = y - tagHeight - 3 * scale;
  const centre = x + width / 2;
  return (
    <g>
      <rect
        x={centre - tagWidth / 2}
        y={top}
        width={tagWidth}
        height={tagHeight}
        rx={8 * scale}
        fill={tintColor}
      />
      <text
        x={centre}
        y={top + tagHeight / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14 * scale}
        fontWeight={700}
        fill={textColor}
      >
        {text}
      </text>
    </g>
  );
}

function GrowthTooltip({ active, payload }: TooltipProps<number, string>) {
  const point = payload?.[0]?.payload as PlatformGrowthPoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-[#E7E9F0] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-[#101828]">{monthLabel(point.month)}</p>
      <p className="text-[#475467]">{formatCount(point.job_seekers)} job seekers</p>
      <p className="text-[#475467]">{formatCount(point.recruiters)} recruiters</p>
    </div>
  );
}

/**
 * Two bars a month. The scales differ by a factor of about eighty, so Job Seekers read off the left
 * axis and Recruiters off their own on the right; both have five steps and share the gridlines.
 * The tags use darker text than the bars so they stay readable on their pale tint.
 */
function GrowthChart({ points, u }: { points: PlatformGrowthPoint[]; u: number }) {
  const axes = useMemo(() => growthAxes(points), [points]);
  const last = points.length - 1;
  const tick = { fill: AXIS_TEXT, fontSize: 13.5 * u };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={points}
        margin={{ top: 28 * u, right: 4 * u, bottom: 0, left: 0 }}
        barGap={4 * u}
      >
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="month"
          tickFormatter={monthLabel}
          tick={tick}
          interval={0}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={8 * u}
          height={26 * u}
        />
        <YAxis
          yAxisId="seekers"
          orientation="left"
          domain={[0, axes.seekers.max]}
          ticks={axes.seekers.ticks}
          tickFormatter={formatAxisThousands}
          tick={tick}
          interval={0}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={6 * u}
          width={36 * u}
        />
        <YAxis
          yAxisId="recruiters"
          orientation="right"
          domain={[0, axes.recruiters.max]}
          ticks={axes.recruiters.ticks}
          tick={{ fill: RECRUITERS_AXIS_TEXT, fontSize: 12 * u }}
          interval={0}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={6 * u}
          width={32 * u}
        />
        <Tooltip cursor={false} content={<GrowthTooltip />} />
        <Bar
          yAxisId="seekers"
          dataKey="job_seekers"
          name="Job Seekers"
          fill={SEEKERS_COLOR}
          barSize={20 * u}
          radius={[4 * u, 4 * u, 0, 0]}
          isAnimationActive={false}
          label={<ValueTag lastIndex={last} scale={u} textColor="#C2410C" tintColor="#FFF1EC" />}
        />
        <Bar
          yAxisId="recruiters"
          dataKey="recruiters"
          name="Recruiters"
          fill={RECRUITERS_COLOR}
          barSize={18 * u}
          radius={[4 * u, 4 * u, 0, 0]}
          isAnimationActive={false}
          label={<ValueTag lastIndex={last} scale={u} textColor="#9A5A33" tintColor="#FFEFE3" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 lg:gap-[calc(7*var(--u))]">
      <span
        aria-hidden="true"
        className="size-2.5 rounded-full lg:size-[calc(12*var(--u))]"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

/**
 * Platform Growth: job seekers and recruiters at the end of each of the last six months. Fills its
 * grid cell; the plot takes whatever height the card leaves, and a month-by-month list for screen
 * readers sits beside the picture of it.
 */
export function ReportsPlatformGrowthCard() {
  const { data, isLoading, error, refetch } = useReportsOverview();
  const [plot, setPlot] = useState<HTMLDivElement | null>(null);
  const u = useElementScale(plot);
  const points = data?.platform_growth ?? [];

  return (
    <ReportCard
      title="Platform Growth"
      aside={
        <div className="flex items-center gap-4 self-center text-sm text-[#475467] lg:gap-[calc(20*var(--u))] lg:text-[calc(13*var(--u))]">
          <LegendItem color={SEEKERS_COLOR} label="Job Seekers" />
          <LegendItem color={RECRUITERS_COLOR} label="Recruiters" />
        </div>
      }
      isLoading={isLoading}
      error={data ? undefined : error}
      onRetry={() => void refetch()}
      isEmpty={points.length === 0}
      className="h-full min-h-0"
    >
      <div ref={setPlot} className="relative min-h-[240px] flex-1 lg:min-h-0">
        <div
          role="img"
          aria-label="Platform growth by month: job seekers and recruiters"
          className="absolute inset-0"
        >
          <GrowthChart points={points} u={u} />
        </div>
        <ul className="sr-only">
          {points.map((point) => (
            <li key={point.month}>{describeGrowth(point)}</li>
          ))}
        </ul>
      </div>
    </ReportCard>
  );
}
