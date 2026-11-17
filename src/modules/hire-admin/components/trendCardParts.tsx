import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatAxisDate, niceAxis, sparseTicks } from './jobsTrendScale';
import type { TrendChartStyle, TrendPoint } from './trendChartStyle';

/** The y domain and gridline values: the fixed range of the style when it has one, else a rounded one. */
function yAxisFor(
  maxValue: number,
  style: Pick<TrendChartStyle, 'axisHeadroom' | 'axisRange'>
): { min: number; top: number; ticks: number[] } {
  const range = style.axisRange;
  if (!range || !(range.step > 0) || range.max <= range.min) {
    return { min: 0, ...niceAxis(maxValue * style.axisHeadroom) };
  }
  const top = Math.max(range.max, Math.ceil(maxValue / range.step) * range.step);
  const count = Math.floor((top - range.min) / range.step + 1e-9);
  const ticks = Array.from({ length: count + 1 }, (_, i) => range.min + i * range.step);
  if (ticks[ticks.length - 1] !== top) ticks.push(top);
  return { min: range.min, top, ticks };
}

/**
 * Pill above the highlighted last point. Recharts hands a ReferenceDot label the dot's box as
 * `viewBox`. `u` is the page's scale unit, since SVG sizes here are plain numbers.
 */
function LastValueBadge({
  viewBox,
  value,
  u,
  style
}: {
  viewBox?: { x?: number; y?: number; width?: number };
  value: number;
  u: number;
  style: TrendChartStyle;
}) {
  const k = (style.badgeFont / 11) * u;
  const text = value.toLocaleString('en-IN');
  const width = (text.length * 7 + 14) * k;
  const centre = (viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2;
  const right = style.badgeCentered ? centre + width / 2 : centre + 8 * u;
  const top = (viewBox?.y ?? 0) - 24 * k;
  return (
    <g>
      <rect x={right - width} y={top} width={width} height={18 * k} rx={9 * k} fill="#FFE9E0" />
      <text
        x={right - width / 2}
        y={top + 12.5 * k}
        textAnchor="middle"
        fontSize={style.badgeFont * u}
        fontWeight={700}
        fill={style.color}
      >
        {text}
      </text>
    </g>
  );
}

/** The area chart itself: a smooth line over a soft gradient, a dot and a value badge on the last point. */
export function TrendChart({
  points,
  u,
  unit,
  gradientId,
  style
}: {
  points: TrendPoint[];
  u: number;
  /** Name of what is counted, for the tooltip. */
  unit: string;
  gradientId: string;
  style: TrendChartStyle;
}) {
  const { axisHeadroom, axisRange } = style;
  const axis = useMemo(
    () => yAxisFor(Math.max(0, ...points.map((p) => p.count)), { axisHeadroom, axisRange }),
    [points, axisHeadroom, axisRange]
  );
  const xTicks = useMemo(() => sparseTicks(points.map((p) => p.date)), [points]);
  const last = points.at(-1);
  const tick = { fill: '#526079', fontSize: style.tick * u };
  const { margin } = style;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={points}
        margin={{
          top: margin.top * u,
          right: margin.right * u,
          left: margin.left * u,
          bottom: margin.bottom * u
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={style.color} stopOpacity={style.fillTop} />
            <stop offset="100%" stopColor={style.color} stopOpacity={style.fillBottom} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#E9EBF0" />
        <XAxis
          dataKey="date"
          ticks={xTicks}
          interval={0}
          tickFormatter={formatAxisDate}
          tick={tick}
          axisLine={false}
          tickLine={false}
          tickMargin={style.xTickMargin * u}
        />
        <YAxis
          domain={[axis.min, axis.top]}
          ticks={axis.ticks}
          interval={0}
          tickFormatter={(v: number) => v.toLocaleString('en-IN')}
          tick={tick}
          axisLine={false}
          tickLine={false}
          width={style.yAxisWidth * u}
          tickMargin={style.yTickMargin === undefined ? undefined : style.yTickMargin * u}
        />
        <Tooltip
          cursor={{ stroke: '#E9EBF0' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0]?.payload as TrendPoint;
            return (
              <div className="rounded-lg border border-[#E9ECF2] bg-white px-3 py-2 text-xs shadow-md">
                <p className="font-semibold text-[#111111]">{formatAxisDate(p.date)}</p>
                <p className="text-[#526079]">
                  {p.count.toLocaleString('en-IN')} {unit}
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={style.color}
          strokeWidth={style.line * u}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: (style.dot + 0.5) * u, fill: style.color, strokeWidth: 0 }}
        />
        {last && (
          <ReferenceDot
            x={last.date}
            y={last.count}
            r={style.dot * u}
            fill={style.color}
            stroke="#fff"
            strokeWidth={2 * u}
            label={<LastValueBadge value={last.count} u={u} style={style} />}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
