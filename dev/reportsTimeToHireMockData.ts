/**
 * Numbers for GET /hire/admin/reports/overview/time-to-hire in the dev mock API: how the Avg. Time to Hire
 * card is made up, for the last 7, 30 or 90 days. There is no backend yet, so this stands in for
 * kitchenxhire-backend-go like every other admin screen of the mock. It has its own builder, worked out from
 * the Overview (reportsOverview) and not from the rows of the lists, so it reads the same whatever those
 * rows do: the average and its change are the card's own numbers, and the hires counted are the Hired
 * card's, which is also the total of the Hired list.
 *
 * The trend has the dates of the Hiring Trend. Each point is a running average, over the hires from the
 * start of the window to the end of that day, so it is null until the first hire and the last point is the
 * average. Its values are made up: they run from the average of the previous window (what the change is
 * measured against) to this one. By category are the five named categories of the reference picture, the
 * days of its 30-day window scaled to the average of the window asked for so the picture holds, with the
 * hires of each in the proportion of its jobs, most hires first. There is no Others row, and the hires
 * are not made to add up to the hires counted. The types repeat
 * src/modules/hire-admin/schemas/adminReportsDrilldown.ts, because dev/ never imports src/.
 */
import { reportsOverview, type ReportRange } from './reportsMockData.ts';

interface TimeToHireTrendPoint {
  date: string;
  average_days: number | null;
}

interface TimeToHireCategory {
  label: string;
  average_days: number;
  hires: number;
}

interface ReportsTimeToHire {
  range: { from: string; to: string };
  average_days: number | null;
  change_pct: number | null;
  hires_counted: number;
  trend: TimeToHireTrendPoint[];
  by_category: TimeToHireCategory[];
}

/** Days to hire by category in the reference picture (its 30-day window). */
const REFERENCE_DAYS: readonly (readonly [string, number])[] = [
  ['Cook / Chef', 5.2],
  ['Kitchen Helper', 6.1],
  ['Cleaning & Stewarding', 7.4],
  ['Delivery & Store Support', 8.1],
  ['Bakery Assistant', 9]
];

/** Small ups and downs added to the trend line, fading out towards its end. */
const WOBBLE = [0.35, -0.25, 0.3, -0.35, 0.2, -0.3, 0.25];

const oneDecimal = (value: number) => Math.round(value * 10) / 10;

function trendOf(range: ReportRange): TimeToHireTrendPoint[] {
  const { hiring_trend: samples, kpis } = reportsOverview(range);
  const { value: average, change_pct: change } = kpis.avg_time_to_hire_days;
  const divisor = 1 + change / 100;
  const before = divisor > 0 ? average / divisor : average;
  const last = samples.length - 1;
  let hiredSoFar = 0;
  return samples.map((sample, i): TimeToHireTrendPoint => {
    hiredSoFar += sample.hires;
    if (hiredSoFar === 0) return { date: sample.date, average_days: null };
    const progress = last === 0 ? 1 : i / last;
    const line = before + (average - before) * progress;
    const wobble = WOBBLE[i % WOBBLE.length] * (1 - progress);
    return { date: sample.date, average_days: i === last ? average : oneDecimal(line + wobble) };
  });
}

function byCategoryOf(range: ReportRange): TimeToHireCategory[] {
  const { kpis, top_categories: top } = reportsOverview(range);
  const scale =
    kpis.avg_time_to_hire_days.value / reportsOverview('30d').kpis.avg_time_to_hire_days.value;
  return REFERENCE_DAYS.map(([label, days]) => {
    const jobs = top.find((row) => row.label === label)?.count ?? 0;
    return {
      label,
      average_days: oneDecimal(days * scale),
      hires: Math.round((kpis.hired.value * jobs) / kpis.jobs_posted.value)
    };
  }).sort((a, b) => b.hires - a.hires);
}

export function reportsTimeToHire(range: ReportRange): ReportsTimeToHire {
  const { range: window, kpis } = reportsOverview(range);
  const { value: average, change_pct: change } = kpis.avg_time_to_hire_days;
  const counted = kpis.hired.value;
  return {
    range: window,
    average_days: counted === 0 ? null : average,
    change_pct: counted === 0 ? null : change,
    hires_counted: counted,
    trend: trendOf(range),
    by_category: byCategoryOf(range)
  };
}
