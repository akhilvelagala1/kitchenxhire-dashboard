import { REPORT_RANGE_DAYS, type ReportRange } from '../schemas/adminReports';

const DAY_MS = 86_400_000;

function dayAndMonth(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${date.getUTCDate()} ${month}`;
}

/**
 * The dates a window covers, for example "26 May – 24 Jun 2026": `range` counted back from `to`
 * (YYYY-MM-DD, the last day, today included). It is worked out in UTC so the date never shifts with
 * the browser's time zone. The year is written once, unless the window crosses New Year.
 */
export function rangeLabel(range: ReportRange, to: string): string {
  const end = new Date(`${to}T00:00:00Z`);
  const start = new Date(end.getTime() - (REPORT_RANGE_DAYS[range] - 1) * DAY_MS);
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  const from = startYear === endYear ? dayAndMonth(start) : `${dayAndMonth(start)} ${startYear}`;
  return `${from} – ${dayAndMonth(end)} ${endYear}`;
}
