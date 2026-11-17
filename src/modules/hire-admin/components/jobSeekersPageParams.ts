import type { JobSeekersListParams } from '../api/adminJobSeekersApi';
import { EXPERIENCE_BANDS, JOB_SEEKER_STATUSES, JOB_SEEKER_TABS } from '../schemas/adminJobSeeker';
import { pick, parsePage } from './listParams';

const STATUS_FILTERS = ['all', ...JOB_SEEKER_STATUSES] as const;
const EXPERIENCE_FILTERS = ['all', ...EXPERIENCE_BANDS.map((b) => b.value)] as const;
const JOINED = ['all', '7d', '30d', '90d'] as const;
const SORT_KEYS = [
  'last_active_at',
  'joined_at',
  'name',
  'job_seeker_id',
  'applications_count',
  'profile_completion'
] as const;

/** Ten rows matches the Job Seekers list redesign; URL may still carry 5, 20 or 50. */
const JOB_SEEKER_PAGE_SIZES = [5, 10, 20, 50] as const;
const DEFAULT_JOB_SEEKERS_PAGE_SIZE = 10;

function parseJobSeekersPageSize(raw: string | null): number {
  const size = Number(raw);
  return (JOB_SEEKER_PAGE_SIZES as readonly number[]).includes(size)
    ? size
    : DEFAULT_JOB_SEEKERS_PAGE_SIZE;
}

/** Everything the Job Seekers page keeps in the URL, with a safe default for each value. */
export function parseJobSeekersSearchParams(searchParams: URLSearchParams) {
  return {
    tab: pick(searchParams.get('tab'), JOB_SEEKER_TABS, 'all'),
    status: pick(searchParams.get('status'), STATUS_FILTERS, 'all'),
    experience: pick(searchParams.get('experience'), EXPERIENCE_FILTERS, 'all'),
    city: searchParams.get('city') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    joined: pick(searchParams.get('joined'), JOINED, 'all'),
    page: parsePage(searchParams.get('page')),
    page_size: parseJobSeekersPageSize(searchParams.get('page_size')),
    sort: pick(searchParams.get('sort'), SORT_KEYS, 'last_active_at'),
    order: (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
  };
}

export type JobSeekersPageParams = ReturnType<typeof parseJobSeekersSearchParams>;

/** The request the list, the export and the bulk bar share: `all` filters are left out. */
export function toJobSeekersListQuery(p: JobSeekersPageParams): JobSeekersListParams {
  return {
    page: p.page,
    page_size: p.page_size,
    search: p.search,
    sort: p.sort,
    order: p.order,
    tab: p.tab !== 'all' ? p.tab : undefined,
    status: p.status !== 'all' ? p.status : undefined,
    experience: p.experience !== 'all' ? p.experience : undefined,
    city: p.city,
    joined: p.joined !== 'all' ? p.joined : undefined
  };
}
