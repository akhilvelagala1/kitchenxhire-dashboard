import type { PlatformGrowthPoint } from '../schemas/adminReports';
import { niceAxis } from './reportsAxis';
import { formatCount } from './reportsFormat';

/** Both value axes have this many steps, so the gridlines of one are the gridlines of the other. */
const AXIS_STEPS = 5;

const MONTH_NAME = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' });

/** "2026-06" -> "Jun". Text that is not a month is returned as it came. */
export function monthLabel(month: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? month : MONTH_NAME.format(date);
}

/** 25000 -> "25K", 2500 -> "2.5K", 750 -> "750": the labels of the Job Seekers axis. */
export function formatAxisThousands(value: number): string {
  if (Math.abs(value) >= 1e6) return `${Number((value / 1e6).toFixed(2))}M`;
  if (Math.abs(value) >= 1e3) return `${Number((value / 1e3).toFixed(2))}K`;
  return String(value);
}

/**
 * A value axis from 0 in `AXIS_STEPS` equal steps that reach `largest`. These are head counts, so a
 * step is always a whole number, and an empty or tiny series still gets 0 to 5.
 */
function axisFor(largest: number): { max: number; ticks: number[] } {
  const step = Math.ceil(niceAxis(Math.max(largest, AXIS_STEPS), AXIS_STEPS).step);
  return {
    max: step * AXIS_STEPS,
    ticks: Array.from({ length: AXIS_STEPS + 1 }, (_, i) => i * step)
  };
}

/**
 * The two value axes of the chart. Job seekers number in the tens of thousands and recruiters in the
 * hundreds, so each series has an axis of its own. Both have five steps, so they share gridlines.
 */
export function growthAxes(points: PlatformGrowthPoint[]) {
  return {
    seekers: axisFor(Math.max(0, ...points.map((p) => p.job_seekers))),
    recruiters: axisFor(Math.max(0, ...points.map((p) => p.recruiters)))
  };
}

function counted(count: number, one: string, many: string): string {
  return `${formatCount(count)} ${count === 1 ? one : many}`;
}

/** "Jan: 9,800 job seekers, 120 recruiters": one month of the list read out by screen readers. */
export function describeGrowth(point: PlatformGrowthPoint): string {
  const seekers = counted(point.job_seekers, 'job seeker', 'job seekers');
  const recruiters = counted(point.recruiters, 'recruiter', 'recruiters');
  return `${monthLabel(point.month)}: ${seekers}, ${recruiters}`;
}
