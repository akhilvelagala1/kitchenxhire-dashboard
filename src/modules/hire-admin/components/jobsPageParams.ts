import type { JobsDateRangePreset } from '../schemas/adminJob';

export const RANGE_OPTIONS: { value: JobsDateRangePreset; label: string }[] = [
  { value: '1d', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' }
];

export function parseJobsSearchParams(searchParams: URLSearchParams) {
  const range = (searchParams.get('range') ?? '30d') as JobsDateRangePreset;
  return {
    range,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    page: Math.max(1, Number(searchParams.get('page') ?? 1)),
    /** Ten rows matches the Jobs list redesign; URL may still carry another allowed size. */
    page_size: (() => {
      const size = Number(searchParams.get('page_size') ?? 10);
      return [5, 10, 20, 50].includes(size) ? size : 10;
    })(),
    search: searchParams.get('search') ?? undefined,
    job_status: searchParams.get('job_status') ?? 'all',
    job_category: searchParams.get('job_category') ?? 'all',
    location: searchParams.get('location') ?? 'all',
    recruiter_name: searchParams.get('recruiter_name') ?? 'all',
    job_title_label: searchParams.get('job_title_label') ?? undefined,
    recruited: searchParams.get('recruited') === '1',
    sort: searchParams.get('sort') ?? 'posted_at',
    order: (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    kpi: searchParams.get('kpi') as string | null
  };
}
