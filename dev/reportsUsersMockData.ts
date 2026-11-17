/**
 * Numbers for GET /hire/admin/reports/users in the dev mock API: the Users Report tab for the last 7,
 * 30 or 90 days. Job Seekers and Recruiters match reportsOverview()'s own Platform Growth chart for
 * June exactly (24,860 and 312), so the two tabs never disagree about how many of each already exist;
 * Businesses and Admins have no Overview figure to match and are new here, same as Jobs Report's and
 * Applications Report's own new fields. `total_users`, `job_seekers`, `businesses` and `recruiters` are
 * totals as of today, the same for every window; only `new_users` and every change percentage move
 * with the range. The types repeat src/modules/hire-admin/schemas/adminReports.ts, because dev/ never
 * imports src/.
 */
import { type ReportRange, reportsOverview } from './reportsMockData.ts';

type UserType = 'job_seeker' | 'business' | 'recruiter' | 'admin';
type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

interface Kpi {
  value: number;
  change_pct: number;
}

interface GrowthPoint {
  month: string;
  users: number;
}

interface RankedCount {
  label: string;
  count: number;
}

interface RecentUser {
  id: string;
  name: string;
  user_type: UserType;
  registered_on: string;
  status: UserStatus;
}

export interface UsersReport {
  range: { from: string; to: string };
  kpis: Record<'total_users' | 'job_seekers' | 'businesses' | 'recruiters' | 'new_users', Kpi>;
  user_growth: GrowthPoint[];
  users_by_type: { type: UserType; count: number }[];
  top_locations: RankedCount[];
  recent_users: RecentUser[];
}

/** As of today: 24,860 job seekers and 312 recruiters, the same as reportsOverview()'s last Platform
 * Growth point. Businesses and admins are new counts this tab alone tracks. */
const JOB_SEEKERS = 24860;
const RECRUITERS = 312;
const BUSINESSES = 640;
const ADMINS = 18;
const TOTAL_USERS = JOB_SEEKERS + RECRUITERS + BUSINESSES + ADMINS;

/** Reuses reportsOverview()'s own monthly job-seeker growth, offset up by the Businesses, Recruiters
 * and Admins this tab adds, so the last point lands exactly on TOTAL_USERS. */
const OFFSET = TOTAL_USERS - JOB_SEEKERS;
const USER_GROWTH: GrowthPoint[] = reportsOverview('30d').platform_growth.map((point) => ({
  month: point.month,
  users: point.job_seekers + OFFSET
}));

const LOCATION_LABELS = ['Hyderabad', 'Madhapur', 'Gachibowli', 'Banjara Hills', 'Kondapur'];
const LOCATION_SHARE = [0.375, 0.148, 0.113, 0.089, 0.074];
const TOP_LOCATIONS: RankedCount[] = LOCATION_LABELS.map((label, i) => ({
  label,
  count: Math.round(TOTAL_USERS * LOCATION_SHARE[i]!)
}));

/** The newest five accounts: the same list regardless of the window, as a real feed would be. */
const RECENT_USERS: RecentUser[] = [
  {
    id: 'USR-9421',
    name: 'Priya Sharma',
    user_type: 'job_seeker',
    registered_on: '2026-06-24T11:24:00+05:30',
    status: 'active'
  },
  {
    id: 'USR-9420',
    name: 'Rahul Menon',
    user_type: 'business',
    registered_on: '2026-06-24T10:18:00+05:30',
    status: 'active'
  },
  {
    id: 'USR-9419',
    name: 'Kiran Das',
    user_type: 'recruiter',
    registered_on: '2026-06-23T18:40:00+05:30',
    status: 'active'
  },
  {
    id: 'USR-9418',
    name: 'Ananya Rao',
    user_type: 'job_seeker',
    registered_on: '2026-06-23T14:05:00+05:30',
    status: 'pending'
  },
  {
    id: 'USR-9417',
    name: 'Vikram Singh',
    user_type: 'admin',
    registered_on: '2026-06-22T09:30:00+05:30',
    status: 'active'
  }
];

const NEW_USERS: Record<ReportRange, Kpi> = {
  '7d': { value: 340, change_pct: 16 },
  '30d': { value: 1450, change_pct: 18 },
  '90d': { value: 3850, change_pct: 24 }
};

const STOCK_CHANGE: Record<
  ReportRange,
  { total: number; job_seekers: number; businesses: number; recruiters: number }
> = {
  '7d': { total: 5, job_seekers: 5, businesses: 3, recruiters: 4 },
  '30d': { total: 19, job_seekers: 20, businesses: 12, recruiters: 16 },
  '90d': { total: 37, job_seekers: 38, businesses: 28, recruiters: 32 }
};

export function usersReport(range: ReportRange): UsersReport {
  const change = STOCK_CHANGE[range];
  return {
    range: reportsOverview(range).range,
    kpis: {
      total_users: { value: TOTAL_USERS, change_pct: change.total },
      job_seekers: { value: JOB_SEEKERS, change_pct: change.job_seekers },
      businesses: { value: BUSINESSES, change_pct: change.businesses },
      recruiters: { value: RECRUITERS, change_pct: change.recruiters },
      new_users: NEW_USERS[range]
    },
    user_growth: USER_GROWTH,
    users_by_type: [
      { type: 'job_seeker', count: JOB_SEEKERS },
      { type: 'business', count: BUSINESSES },
      { type: 'recruiter', count: RECRUITERS },
      { type: 'admin', count: ADMINS }
    ],
    top_locations: TOP_LOCATIONS,
    recent_users: RECENT_USERS
  };
}
