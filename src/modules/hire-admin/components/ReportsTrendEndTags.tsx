import type { HiringTrendPoint } from '../schemas/adminReports';
import { formatCount } from './reportsFormat';
import { TAG_DOT_CLEAR, TREND_SERIES, spreadTags, tagWidth } from './reportsTrend';

/** Sizes in u. A tag is 14u bold text with 4u x 9u padding. */
const TAG_HEIGHT = 25;
const TAG_RADIUS = 8;
const TAG_FONT = 14;
/** From the centre of a dot to the bottom of the tag above it. */
const TAG_RISE = 8;
const TAG_SPACING = 2;
/** A tag may reach this far below the baseline, no further, or it would meet the day labels. */
const BASELINE_ALLOWANCE = 3;
const DOT_RADIUS = 5;
const DOT_RING = 2;

interface ReportsTrendEndTagsProps {
  lastPoint: HiringTrendPoint;
  pointCount: number;
  axisMax: number;
  /** The scale unit in px, as read from the card. */
  scaleUnit: number;
  /** The plot area. Recharts adds it to every Customized layer, so it is missing only outside a chart. */
  offset?: { left: number; top: number; width: number; height: number };
}

/**
 * The round dot and the value tag at the end of each line. It is drawn inside the chart, over the
 * areas, because only the chart knows where the plot is. The tags are laid out together so that
 * they never overlap each other and never reach the day labels.
 */
export function ReportsTrendEndTags({
  lastPoint,
  pointCount,
  axisMax,
  scaleUnit: u,
  offset
}: ReportsTrendEndTagsProps) {
  if (!offset) return null;
  const { left, top, width, height } = offset;
  // The last sample sits on the right edge of the plot, or in the middle when it is the only one.
  const dotX = left + (pointCount > 1 ? width : width / 2);

  const ends = TREND_SERIES.map((series) => {
    const value = lastPoint[series.key];
    const text = formatCount(value);
    const tagW = tagWidth(text) * u;
    const dotY = top + height * (1 - value / axisMax);
    const above = series.tag === 'above';
    return {
      series,
      text,
      tagW,
      dotY,
      x: above ? dotX - tagW / 2 : dotX + TAG_DOT_CLEAR * u,
      want: above ? dotY - (TAG_RISE + TAG_HEIGHT) * u : dotY - (TAG_HEIGHT * u) / 2
    };
  });
  const tops = spreadTags(
    ends.map((end) => end.want),
    TAG_HEIGHT * u,
    TAG_SPACING * u,
    0,
    top + height + BASELINE_ALLOWANCE * u
  );

  return (
    <g aria-hidden="true">
      {ends.map((end, i) => {
        const tagTop = tops[i] ?? end.want;
        return (
          <g key={end.series.key}>
            <rect
              x={end.x}
              y={tagTop}
              width={end.tagW}
              height={TAG_HEIGHT * u}
              rx={TAG_RADIUS * u}
              fill={end.series.tint}
            />
            <text
              x={end.x + end.tagW / 2}
              y={tagTop + (TAG_HEIGHT * u) / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={TAG_FONT * u}
              fontWeight={700}
              fill={end.series.ink}
            >
              {end.text}
            </text>
          </g>
        );
      })}
      {ends.map((end) => (
        <circle
          key={end.series.key}
          cx={dotX}
          cy={end.dotY}
          r={DOT_RADIUS * u}
          fill={end.series.color}
          stroke="#fff"
          strokeWidth={DOT_RING * u}
        />
      ))}
    </g>
  );
}
