import type { RecruitersListParams } from '../api/adminRecruitersApi';
import {
  BUSINESS_TYPES,
  RECRUITER_STATUSES,
  RECRUITER_TABS,
  RECRUITER_VERIFICATION_LABELS,
  type RecruiterVerification
} from '../schemas/adminRecruiter';
import { pick, parsePage } from './listParams';

const STATUS_FILTERS = ['all', ...RECRUITER_STATUSES] as const;
const TYPE_FILTERS = ['all', ...BUSINESS_TYPES] as const;
const VERIFICATIONS = ['all', ...Object.keys(RECRUITER_VERIFICATION_LABELS)] as const;
const JOINED = ['all', '7d', '30d', '90d'] as const;
const SORT_KEYS = [
  'last_login_at',
  'joined_at',
  'business_name',
  'recruiter_id',
  'owner_name'
] as const;

/** Ten rows matches the Recruiter Management list redesign; URL may still carry 5, 20 or 50. */
const RECRUITER_PAGE_SIZES = [5, 10, 20, 50] as const;
const DEFAULT_RECRUITERS_PAGE_SIZE = 10;

function parseRecruitersPageSize(raw: string | null): number {
  const size = Number(raw);
  return (RECRUITER_PAGE_SIZES as readonly number[]).includes(size)
    ? size
    : DEFAULT_RECRUITERS_PAGE_SIZE;
}

/** Everything the Recruiters page keeps in the URL, with a safe default for each value. */
export function parseRecruitersSearchParams(searchParams: URLSearchParams) {
  return {
    tab: pick(searchParams.get('tab'), RECRUITER_TABS, 'all'),
    status: pick(searchParams.get('status'), STATUS_FILTERS, 'all'),
    business_type: pick(searchParams.get('business_type'), TYPE_FILTERS, 'all'),
    verification: pick(searchParams.get('verification'), VERIFICATIONS, 'all'),
    city: searchParams.get('city') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    joined: pick(searchParams.get('joined'), JOINED, 'all'),
    page: parsePage(searchParams.get('page')),
    page_size: parseRecruitersPageSize(searchParams.get('page_size')),
    sort: pick(searchParams.get('sort'), SORT_KEYS, 'last_login_at'),
    order: (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
  };
}

export type RecruitersPageParams = ReturnType<typeof parseRecruitersSearchParams>;

/** The request the list, the export and the bulk bar share: `all` filters are left out. */
export function toRecruitersListQuery(p: RecruitersPageParams): RecruitersListParams {
  return {
    page: p.page,
    page_size: p.page_size,
    search: p.search,
    sort: p.sort,
    order: p.order,
    tab: p.tab !== 'all' ? p.tab : undefined,
    status: p.status !== 'all' ? p.status : undefined,
    business_type: p.business_type !== 'all' ? p.business_type : undefined,
    verification: p.verification !== 'all' ? (p.verification as RecruiterVerification) : undefined,
    city: p.city,
    joined: p.joined !== 'all' ? p.joined : undefined
  };
}
