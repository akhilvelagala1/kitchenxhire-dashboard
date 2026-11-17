import type { HiringTrendPoint } from '../schemas/adminReports';
import { niceAxis } from './reportsAxis';
import { formatCount } from './reportsFormat';

interface TrendSeries {
  key: 'applications' | 'jobs' | 'hires';
  label: string;
  /** The line, its dot and the legend dot. */
  color: string;
  /** Background of the value tag at the end of the line: a pale tint of the colour. */
  tint: string;
  /** Text of the value tag. The plain colour is about 3:1 on the tint, so this is a darker shade of it (AA). */
  ink: string;
  /** Opacity of the area fill at the line; it fades to nothing at the baseline. */
  fillTop: number;
  /** Where the value tag sits against its dot: centred above it, or beside it on the right. */
  tag: 'above' | 'right';
  /** The same colour as a class, for the legend and tooltip dots. */
  dotClass: string;
}

/** In drawing order: the later series are painted over the earlier ones. */
export const TREND_SERIES: readonly TrendSeries[] = [
  {
    key: 'applications',
    label: 'Applications',
    color: '#FF4B16',
    tint: '#FFE9E0',
    ink: '#B93A0A',
    fillTop: 0.25,
    tag: 'above',
    dotClass: 'bg-[#FF4B16]'
  },
  {
    key: 'jobs',
    label: 'Jobs',
    color: '#2688F5',
    tint: '#E4F0FE',
    ink: '#1565C0',
    fillTop: 0.15,
    tag: 'above',
    dotClass: 'bg-[#2688F5]'
  },
  {
    key: 'hires',
    label: 'Hires',
    color: '#16A34A',
    tint: '#E1F5E8',
    ink: '#137A3A',
    fillTop: 0.15,
    // Hires run far below the other two, so a tag under the dot would land on the day labels.
    tag: 'right',
    dotClass: 'bg-[#16A34A]'
  }
];

const dayMonth = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC'
});

/** "2026-05-26" -> "26 May". Read in UTC from the text, so the day never shifts with the viewer's time zone. */
export function formatTrendDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? isoDate : dayMonth.format(date);
}

function counted(count: number, noun: string): string {
  return `${formatCount(count)} ${noun}${count === 1 ? '' : 's'}`;
}

/** One sample as a sentence, for the list screen readers get instead of the picture. */
export function trendSummary(point: HiringTrendPoint): string {
  const { applications, jobs, hires } = point;
  return `${formatTrendDate(point.date)}: ${counted(applications, 'application')}, ${counted(jobs, 'job')}, ${counted(hires, 'hire')}`;
}

export function trendAriaLabel(points: readonly HiringTrendPoint[]): string {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return 'Hiring trend';
  return `Hiring trend from ${formatTrendDate(first.date)} to ${formatTrendDate(last.date)}: applications, jobs and hires`;
}

/** Four equal steps from 0 up to the next tidy number above the highest of the three series. */
export function trendAxis(points: readonly HiringTrendPoint[]): { max: number; ticks: number[] } {
  const peak = Math.max(0, ...points.flatMap((p) => TREND_SERIES.map((s) => p[s.key])));
  const { max, step } = niceAxis(peak, 4);
  return { max, ticks: Array.from({ length: 5 }, (_, i) => i * step) };
}

/** Where a tag on the right of its dot starts, measured from the dot's centre, in u. */
export const TAG_DOT_CLEAR = 9;
const TAG_PAD_X = 9;
const DIGIT_WIDTH = 8.7;
const MARK_WIDTH = 4.5;
const MARGIN_SLACK = 2;

/** Width in u of a value tag: its text at 14u bold plus the side padding. The text is centred, so a small error is invisible. */
export function tagWidth(text: string): number {
  return [...text].reduce(
    (sum, ch) => sum + (/\d/.test(ch) ? DIGIT_WIDTH : MARK_WIDTH),
    2 * TAG_PAD_X
  );
}

/** Room in u that the chart keeps on its right so the value tags of the last sample are not cut off. */
export function trendRightMargin(last: HiringTrendPoint): number {
  const needs = TREND_SERIES.map((series) => {
    const width = tagWidth(formatCount(last[series.key]));
    return series.tag === 'above' ? width / 2 + MARGIN_SLACK : TAG_DOT_CLEAR + width + MARGIN_SLACK;
  });
  return Math.max(...needs);
}

/**
 * Top edges for tags that each want to start at `wants[i]`. They stay `gap` apart and inside
 * [min, max], moving as little as they can: pushed down from the top first, then back up from the
 * bottom. The result is in the order of `wants`.
 */
export function spreadTags(
  wants: readonly number[],
  height: number,
  gap: number,
  min: number,
  max: number
): number[] {
  const order = wants.map((_, i) => i).sort((a, b) => (wants[a] ?? 0) - (wants[b] ?? 0));
  const tops = [...wants];
  let floor = min;
  for (const i of order) {
    const top = Math.max(wants[i] ?? 0, floor);
    tops[i] = top;
    floor = top + height + gap;
  }
  let ceiling = max - height;
  for (const i of [...order].reverse()) {
    const top = Math.min(tops[i] ?? 0, ceiling);
    tops[i] = top;
    ceiling = top - height - gap;
  }
  return tops;
}
