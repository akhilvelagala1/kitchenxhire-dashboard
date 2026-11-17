/**
 * Dashboard numbers for the Jobs page, all computed from the same slice of jobs the list shows.
 * That is the contract the real API must keep (docs/API_CONTRACT_EXPECTATIONS.md): for one period
 * and no other filter, summary total = list total = sum of categories = last trend point.
 */
import { CATEGORY_LABELS, type HireAdminJob } from './jobsMockData.ts';

export interface RangeBounds {
  from: Date;
  to: Date;
}

/** Month-over-month change needs a previous period the mock does not keep, so these stay fixed. */
const GROWTH = {
  growth_jobs_pct: 12,
  growth_applications_pct: 18,
  growth_recruiters_pct: 7,
  growth_recruited_pct: 14,
  growth_closed_pct: 5
};

export function jobsSummary(slice: HireAdminJob[]) {
  const count = (status: HireAdminJob['status']) => slice.filter((j) => j.status === status).length;
  return {
    total_jobs: slice.length,
    total_applications: slice.reduce((sum, j) => sum + j.applications_count, 0),
    total_recruiters: new Set(slice.map((j) => j.recruiter_id)).size,
    total_recruited: slice.reduce((sum, j) => sum + j.recruited_count, 0),
    closed_jobs: count('closed'),
    active_jobs: count('active'),
    under_review_jobs: count('under_review'),
    paused_jobs: count('paused'),
    draft_jobs: count('draft'),
    ...GROWTH
  };
}

export function jobsByCategory(slice: HireAdminJob[]) {
  return CATEGORY_LABELS.map((label) => ({
    label,
    count: slice.filter((j) => j.job_category_label === label).length
  }));
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day as YYYY-MM-DD. (toISOString would shift it to UTC.) */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const MAX_POINTS = 400;

/**
 * Running total of jobs posted, one point per local day from `bounds.from` to `bounds.to`.
 * The last point is therefore the number of jobs in the period.
 */
export function jobsTrend(slice: HireAdminJob[], bounds: RangeBounds) {
  const perDay = new Map<string, number>();
  for (const job of slice) {
    const key = dayKey(new Date(job.posted_at));
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }
  const points: { date: string; count: number }[] = [];
  const end = new Date(bounds.to.getFullYear(), bounds.to.getMonth(), bounds.to.getDate());
  let running = 0;
  for (
    let day = new Date(bounds.from.getFullYear(), bounds.from.getMonth(), bounds.from.getDate());
    day <= end && points.length < MAX_POINTS;
    day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
  ) {
    const key = dayKey(day);
    running += perDay.get(key) ?? 0;
    points.push({ date: key, count: running });
  }
  return points;
}
