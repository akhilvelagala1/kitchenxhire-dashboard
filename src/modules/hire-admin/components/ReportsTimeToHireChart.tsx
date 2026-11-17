import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from 'recharts';
import type { TimeToHireTrendPoint } from '../schemas/adminReportsDrilldown';
import { formatDays } from './reportsFormat';
import { formatTrendDate, tagWidth } from './reportsTrend';
import { useElementScale } from './useElementScale';

const LINE_COLOR = '#FF4B16';
const GRID_COLOR = '#E7E9F0';
const TICK_COLOR = '#475467';
const GRADIENT_ID = 'reports-time-to-hire-trend';

/** Chart numbers in u (1u is 1px at the 1600x900 reference), the same as the Hiring Trend except the wider y axis for "12 days". */
const MARGIN_TOP = 22;
const Y_AXIS_WIDTH = 68;
const Y_TICK_GAP = 11;
const X_AXIS_HEIGHT = 30;
const X_TICK_GAP = 13;
const TICK_FONT = 13.5;
const LINE_WIDTH = 2.5;
const DOT_RADIUS = 3;
const END_DOT_RADIUS = 5;
const ACTIVE_DOT_RADIUS = 5;
const ACTIVE_DOT_RING = 2;

/**
 * The end tag is a solid orange callout over the last dot, with a small tail pointing at it. It is
 * 25u high with 14u bold text, as the Hiring Trend tags are, but it reaches past the dot to the right
 * (so it ends where the card's content ends) instead of being centred on it.
 */
const TAG_HEIGHT = 25;
const TAG_RADIUS = 8;
const TAG_FONT = 14;
/** From the centre of the dot to the bottom of the tag. */
const TAG_RISE = 19;
const TAIL_HEIGHT = 6;
const TAIL_HALF_WIDTH = 4;
const TAG_OVERHANG = 24;
const TAG_MARGIN_SLACK = 2;
/** " days" at 14u bold. `tagWidth` measures only the number: it counts every letter as a small mark. */
const DAYS_WIDTH = 36;

/** A y step is 2 days. When a long wait would put more than this many steps on the axis, the step doubles. */
const MAX_STEPS = 8;
/** The axis is never shorter than this, so its scale stays the same across the 7, 30 and 90 day ranges and a usual wait draws as in the picture (0 to 12 days). */
const MIN_AXIS_DAYS = 12;

/** Ticks every 2 days from 0 up to the next even number above the highest sample, or to 12 days if that is more. */
function dayAxis(peak: number): { max: number; ticks: number[] } {
  let step = 2;
  while (peak / step > MAX_STEPS) step *= 2;
  const max = Math.max(MIN_AXIS_DAYS, (Math.floor(peak / step) + 1) * step);
  return { max, ticks: Array.from({ length: max / step + 1 }, (_, i) => i * step) };
}

/** One sample as a sentence, for the list screen readers get instead of the picture. */
function sampleSummary(point: TimeToHireTrendPoint): string {
  const value = point.average_days === null ? 'no hires yet' : formatDays(point.average_days);
  return `${formatTrendDate(point.date)}: ${value}`;
}

function TrendTooltip({ active, payload }: TooltipProps<number, string>) {
  const point = payload?.[0]?.payload as TimeToHireTrendPoint | undefined;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border border-[#E7E9F0] bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-[#101828]">{formatTrendDate(point.date)}</p>
      <p className="text-[#475467]">{formatDays(point.average_days)}</p>
    </div>
  );
}

interface EndTagProps {
  text: string;
  /** In u. */
  width: number;
  /** The page's scale unit, since SVG sizes are plain numbers. */
  u: number;
  /** The box of the dot. Recharts hands it to the label of a ReferenceDot. */
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
}

/** The orange value callout above the last dot. It stops at the top of the chart instead of leaving it. */
function EndTag({ text, width, u, viewBox }: EndTagProps) {
  if (!viewBox) return null;
  const dotX = (viewBox.x ?? 0) + (viewBox.width ?? 0) / 2;
  const dotY = (viewBox.y ?? 0) + (viewBox.height ?? 0) / 2;
  const tagW = width * u;
  const left = dotX + TAG_OVERHANG * u - tagW;
  const top = Math.max(0, dotY - (TAG_RISE + TAG_HEIGHT) * u);
  const bottom = top + TAG_HEIGHT * u;
  const half = TAIL_HALF_WIDTH * u;
  return (
    <g aria-hidden="true">
      <rect
        x={left}
        y={top}
        width={tagW}
        height={TAG_HEIGHT * u}
        rx={TAG_RADIUS * u}
        fill={LINE_COLOR}
      />
      <path
        d={`M${dotX - half} ${bottom}L${dotX + half} ${bottom}L${dotX} ${bottom + TAIL_HEIGHT * u}Z`}
        fill={LINE_COLOR}
      />
      <text
        x={left + tagW / 2}
        y={top + (TAG_HEIGHT * u) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={TAG_FONT * u}
        fontWeight={700}
        fill="#fff"
      >
        {text}
      </text>
    </g>
  );
}

/** The smooth orange line with its area and its last value tagged; a list of the samples is there for screen readers. */
export function ReportsTimeToHireChart({ points }: { points: TimeToHireTrendPoint[] }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const u = useElementScale(box);
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return null;
  const axis = dayAxis(Math.max(0, ...points.map((p) => p.average_days ?? 0)));
  const tick = { fill: TICK_COLOR, fontSize: TICK_FONT * u };
  const end = last.average_days;

  return (
    <>
      <div ref={setBox} className="relative min-h-60 flex-1 lg:min-h-0">
        <div
          role="img"
          aria-label={`Average time to hire from ${formatTrendDate(first.date)} to ${formatTrendDate(last.date)}`}
          className="absolute inset-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{
                top: MARGIN_TOP * u,
                right: (end === null ? 12 : TAG_OVERHANG + TAG_MARGIN_SLACK) * u,
                bottom: 0,
                left: 0
              }}
            >
              <defs>
                <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
                </linearGradient>
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
                tickFormatter={(value: number) => (value === 0 ? '0' : `${value} days`)}
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
                dataKey="average_days"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH * u}
                strokeLinecap="round"
                fill={`url(#${GRADIENT_ID})`}
                dot={{ r: DOT_RADIUS * u, fill: LINE_COLOR, fillOpacity: 1, stroke: 'none' }}
                activeDot={{
                  r: ACTIVE_DOT_RADIUS * u,
                  fill: LINE_COLOR,
                  stroke: '#fff',
                  strokeWidth: ACTIVE_DOT_RING * u
                }}
                isAnimationActive={false}
              />
              {end !== null && (
                <ReferenceDot
                  x={last.date}
                  y={end}
                  r={END_DOT_RADIUS * u}
                  fill={LINE_COLOR}
                  stroke="none"
                  ifOverflow="visible"
                  label={
                    <EndTag
                      text={formatDays(end)}
                      width={tagWidth(end.toFixed(1)) + DAYS_WIDTH}
                      u={u}
                    />
                  }
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ul className="sr-only">
        {points.map((point) => (
          <li key={point.date}>{sampleSummary(point)}</li>
        ))}
      </ul>
    </>
  );
}
