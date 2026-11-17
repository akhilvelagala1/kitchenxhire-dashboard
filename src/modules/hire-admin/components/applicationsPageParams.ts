import type { ApplicationsListParams } from '../api/adminApplicationsApi';
import { APPLICATION_TABS, HIRE_APPLICATION_STATUSES } from '../schemas/adminApplication';

/** Ten rows matches the Applications list redesign; URL may still carry 5, 20 or 50. */
const APPLICATION_PAGE_SIZES = [5, 10, 20, 50] as const;
const DEFAULT_APPLICATIONS_PAGE_SIZE = 10;

const STATUS_FILTERS = ['all', ...HIRE_APPLICATION_STATUSES] as const;
const SORT_KEYS = ['applied_at', 'application_id', 'candidate_name'] as const;

function pick<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(raw as T) ? (raw as T) : fallback;
}

/** Everything the Applications page keeps in the URL, with a safe default for each value. */
export function parseApplicationsSearchParams(searchParams: URLSearchParams) {
  const size = Number(searchParams.get('page_size'));
  const page = Math.floor(Number(searchParams.get('page') ?? 1));
  return {
    tab: pick(searchParams.get('tab'), APPLICATION_TABS, 'all'),
    status: pick(searchParams.get('status'), STATUS_FILTERS, 'all'),
    job_id: searchParams.get('job_id') ?? undefined,
    /** Only for the filter box, so a reload still shows the name; never sent to the server. */
    job_label: searchParams.get('job_label') ?? undefined,
    recruiter_id: searchParams.get('recruiter_id') ?? undefined,
    recruiter_label: searchParams.get('recruiter_label') ?? undefined,
    location: searchParams.get('location') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    page_size: (APPLICATION_PAGE_SIZES as readonly number[]).includes(size)
      ? size
      : DEFAULT_APPLICATIONS_PAGE_SIZE,
    sort: pick(searchParams.get('sort'), SORT_KEYS, 'applied_at'),
    order: (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
  };
}

export type ApplicationsPageParams = ReturnType<typeof parseApplicationsSearchParams>;

/** The request the list, the export and the bulk bar share: `all` filters are left out. */
export function toApplicationsListQuery(p: ApplicationsPageParams): ApplicationsListParams {
  return {
    page: p.page,
    page_size: p.page_size,
    search: p.search,
    sort: p.sort,
    order: p.order,
    from: p.from,
    to: p.to,
    tab: p.tab !== 'all' ? p.tab : undefined,
    status: p.status !== 'all' ? p.status : undefined,
    job_id: p.job_id,
    recruiter_id: p.recruiter_id,
    location: p.location
  };
}
