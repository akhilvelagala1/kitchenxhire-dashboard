import type { BusinessesListParams } from '../api/adminBusinessesApi';
import {
  BUSINESS_KINDS,
  BUSINESS_STATUSES,
  BUSINESS_TABS,
  type BusinessVerification
} from '../schemas/adminBusiness';
import { pick, parsePage } from './listParams';

const VERIFICATIONS = ['all', 'verified', 'pending', 'unverified'] as const;
const STATUS_FILTERS = ['all', ...BUSINESS_STATUSES] as const;
const KIND_FILTERS = ['all', ...BUSINESS_KINDS] as const;
const JOINED = ['all', '7d', '30d', '90d'] as const;
const SORT_KEYS = ['joined_at', 'business_name', 'business_id'] as const;

/** Ten rows matches the Businesses list redesign; URL may still carry 5, 20 or 50. */
const BUSINESS_PAGE_SIZES = [5, 10, 20, 50] as const;
const DEFAULT_BUSINESSES_PAGE_SIZE = 10;

function parseBusinessesPageSize(raw: string | null): number {
  const size = Number(raw);
  return (BUSINESS_PAGE_SIZES as readonly number[]).includes(size)
    ? size
    : DEFAULT_BUSINESSES_PAGE_SIZE;
}

/** Everything the Businesses page keeps in the URL, with a safe default for each value. */
export function parseBusinessesSearchParams(searchParams: URLSearchParams) {
  return {
    tab: pick(searchParams.get('tab'), BUSINESS_TABS, 'all'),
    status: pick(searchParams.get('status'), STATUS_FILTERS, 'all'),
    business_type: pick(searchParams.get('business_type'), KIND_FILTERS, 'all'),
    verification: pick(searchParams.get('verification'), VERIFICATIONS, 'all'),
    city: searchParams.get('city') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    joined: pick(searchParams.get('joined'), JOINED, 'all'),
    page: parsePage(searchParams.get('page')),
    page_size: parseBusinessesPageSize(searchParams.get('page_size')),
    sort: pick(searchParams.get('sort'), SORT_KEYS, 'joined_at'),
    order: (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
  };
}

export type BusinessesPageParams = ReturnType<typeof parseBusinessesSearchParams>;

/** The request the list, the export and the bulk bar share: `all` filters are left out. */
export function toBusinessesListQuery(p: BusinessesPageParams): BusinessesListParams {
  return {
    page: p.page,
    page_size: p.page_size,
    search: p.search,
    sort: p.sort,
    order: p.order,
    tab: p.tab !== 'all' ? p.tab : undefined,
    status: p.status !== 'all' ? p.status : undefined,
    business_type: p.business_type !== 'all' ? p.business_type : undefined,
    verification: p.verification !== 'all' ? (p.verification as BusinessVerification) : undefined,
    city: p.city,
    joined: p.joined !== 'all' ? p.joined : undefined
  };
}
