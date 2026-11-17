import type { UsersListParams } from '../api/adminUsersApi';
import {
  USER_DEPARTMENTS,
  USER_ROLES,
  USER_STATUSES,
  USER_TABS,
  type UserDepartment,
  type UserRole
} from '../schemas/adminUser';
import { pick, parsePage } from './listParams';

const STATUS_FILTERS = ['all', ...USER_STATUSES] as const;
const LOGIN_FILTERS = ['all', '7d', '30d', '90d'] as const;
const SORT_KEYS = ['user_id', 'name', 'last_login_at'] as const;

/** Ten rows matches the User Management list redesign; URL may still carry 5, 20 or 50. */
const USER_PAGE_SIZES = [5, 10, 20, 50] as const;
const DEFAULT_USERS_PAGE_SIZE = 10;

/** The picture opens on "Last 30 Days", so a URL without `login` means 30 days. */
export const DEFAULT_LOGIN_FILTER = '30d';

function parseUsersPageSize(raw: string | null): number {
  const size = Number(raw);
  return (USER_PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_USERS_PAGE_SIZE;
}

function oneOf<T extends string>(raw: string | null, allowed: readonly T[]): T | undefined {
  return allowed.includes(raw as T) ? (raw as T) : undefined;
}

/** Everything the Users page keeps in the URL, with a safe default for each value. */
export function parseUsersSearchParams(searchParams: URLSearchParams) {
  return {
    tab: pick(searchParams.get('tab'), USER_TABS, 'all'),
    status: pick(searchParams.get('status'), STATUS_FILTERS, 'all'),
    role: oneOf<UserRole>(searchParams.get('role'), USER_ROLES),
    department: oneOf<UserDepartment>(searchParams.get('department'), USER_DEPARTMENTS),
    search: searchParams.get('search') ?? undefined,
    login: pick(searchParams.get('login'), LOGIN_FILTERS, DEFAULT_LOGIN_FILTER),
    page: parsePage(searchParams.get('page')),
    page_size: parseUsersPageSize(searchParams.get('page_size')),
    sort: pick(searchParams.get('sort'), SORT_KEYS, 'last_login_at'),
    order: (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
  };
}

export type UsersPageParams = ReturnType<typeof parseUsersSearchParams>;

/** The request the list, the export and the bulk bar share: `all` filters are left out. */
export function toUsersListQuery(p: UsersPageParams): UsersListParams {
  return {
    page: p.page,
    page_size: p.page_size,
    search: p.search,
    sort: p.sort,
    order: p.order,
    tab: p.tab !== 'all' ? p.tab : undefined,
    status: p.status !== 'all' ? p.status : undefined,
    role: p.role,
    department: p.department,
    active: p.login !== 'all' ? p.login : undefined
  };
}
