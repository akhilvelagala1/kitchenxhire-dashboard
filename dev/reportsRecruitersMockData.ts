/**
 * Numbers for GET /hire/admin/reports/recruiters in the dev mock API: the Recruiter Report tab for the
 * last 7, 30 or 90 days. `total_recruiters` (312) matches reportsOverview()'s own Platform Growth chart
 * for June exactly, and the same count the Users Report tab already shows, so no two tabs disagree about
 * how many recruiters exist. `total_recruiters`, `active` and `inactive` are totals as of today, the
 * same for every window; only `new_recruiters`, `avg_hires_per_recruiter` and every change percentage
 * move with the range. The activity trend, status split, leaderboard and recent list are the same
 * regardless of range, same as Users Report's own growth chart and location list. The types repeat
 * src/modules/hire-admin/schemas/adminReports.ts, because dev/ never imports src/.
 */
import { type ReportRange, reportsOverview } from './reportsMockData.ts';

type RecruiterStatus = 'active' | 'inactive' | 'pending' | 'suspended';

interface Kpi {
  value: number;
  change_pct: number;
}

interface ActivityPoint {
  date: string;
  jobs_posted: number;
  hires: number;
}

interface RankedCount {
  label: string;
  count: number;
}

interface RecentRecruiter {
  id: string;
  name: string;
  outlet: string;
  joined_on: string;
  jobs_posted: number;
  hires: number;
  status: RecruiterStatus;
}

export interface RecruitersReport {
  range: { from: string; to: string };
  kpis: Record<
    'total_recruiters' | 'active' | 'inactive' | 'new_recruiters' | 'avg_hires_per_recruiter',
    Kpi
  >;
  recruiter_activity: ActivityPoint[];
  recruiter_status: { status: RecruiterStatus; count: number }[];
  top_recruiters: RankedCount[];
  recent_recruiters: RecentRecruiter[];
}

/** As of today: 312 recruiters, the same as reportsOverview()'s last Platform Growth point and the
 * Users Report tab's own Recruiters KPI. */
const TOTAL_RECRUITERS = 312;
const ACTIVE = 248;
const INACTIVE = 48;
const SUSPENDED = 10;
const PENDING = 6;

const ACTIVITY: ActivityPoint[] = [
  { date: '2026-05-26', jobs_posted: 211, hires: 67 },
  { date: '2026-05-30', jobs_posted: 370, hires: 200 },
  { date: '2026-06-03', jobs_posted: 390, hires: 352 },
  { date: '2026-06-07', jobs_posted: 432, hires: 333 },
  { date: '2026-06-11', jobs_posted: 552, hires: 419 },
  { date: '2026-06-15', jobs_posted: 489, hires: 385 },
  { date: '2026-06-19', jobs_posted: 601, hires: 462 },
  { date: '2026-06-24', jobs_posted: 812, hires: 590 }
];

/** Shares are out of the activity trend's last Hires sample (590), not out of Total Recruiters. */
const TOP_RECRUITERS: RankedCount[] = [
  { label: 'Rajesh Kumar', count: 96 },
  { label: 'Anita Reddy', count: 78 },
  { label: 'Vikram Singh', count: 64 },
  { label: 'Priya Menon', count: 52 },
  { label: 'Arjun Das', count: 46 }
];

/** The newest five recruiters: the same list regardless of the window, as a real feed would be. */
const RECENT_RECRUITERS: RecentRecruiter[] = [
  {
    id: 'REC-1048',
    name: 'Rahul Menon',
    outlet: 'KitchenX - Banjara Hills',
    joined_on: '2026-06-24T11:24:00+05:30',
    jobs_posted: 12,
    hires: 6,
    status: 'active'
  },
  {
    id: 'REC-1047',
    name: 'Sneha Reddy',
    outlet: 'KitchenX - Madhapur',
    joined_on: '2026-06-24T10:18:00+05:30',
    jobs_posted: 8,
    hires: 4,
    status: 'active'
  },
  {
    id: 'REC-1046',
    name: 'Kiran Das',
    outlet: 'KitchenX - Gachibowli',
    joined_on: '2026-06-23T18:40:00+05:30',
    jobs_posted: 6,
    hires: 2,
    status: 'inactive'
  },
  {
    id: 'REC-1045',
    name: 'Ananya Rao',
    outlet: 'KitchenX - Kondapur',
    joined_on: '2026-06-23T14:05:00+05:30',
    jobs_posted: 4,
    hires: 1,
    status: 'pending'
  },
  {
    id: 'REC-1044',
    name: 'Vikram Singh',
    outlet: 'KitchenX - Hyderabad',
    joined_on: '2026-06-22T09:30:00+05:30',
    jobs_posted: 9,
    hires: 5,
    status: 'suspended'
  }
];

const NEW_RECRUITERS: Record<ReportRange, Kpi> = {
  '7d': { value: 7, change_pct: 16 },
  '30d': { value: 28, change_pct: 18 },
  '90d': { value: 72, change_pct: 22 }
};

const AVG_HIRES: Record<ReportRange, Kpi> = {
  '7d': { value: 2.1, change_pct: 9 },
  '30d': { value: 2.4, change_pct: 14 },
  '90d': { value: 2.8, change_pct: 19 }
};

const STOCK_CHANGE: Record<ReportRange, { total: number; active: number; inactive: number }> = {
  '7d': { total: 4, active: 5, inactive: -3 },
  '30d': { total: 10, active: 12, inactive: -6 },
  '90d': { total: 16, active: 18, inactive: -11 }
};

export function recruitersReport(range: ReportRange): RecruitersReport {
  const change = STOCK_CHANGE[range];
  return {
    range: reportsOverview(range).range,
    kpis: {
      total_recruiters: { value: TOTAL_RECRUITERS, change_pct: change.total },
      active: { value: ACTIVE, change_pct: change.active },
      inactive: { value: INACTIVE, change_pct: change.inactive },
      new_recruiters: NEW_RECRUITERS[range],
      avg_hires_per_recruiter: AVG_HIRES[range]
    },
    recruiter_activity: ACTIVITY,
    recruiter_status: [
      { status: 'active', count: ACTIVE },
      { status: 'inactive', count: INACTIVE },
      { status: 'suspended', count: SUSPENDED },
      { status: 'pending', count: PENDING }
    ],
    top_recruiters: TOP_RECRUITERS,
    recent_recruiters: RECENT_RECRUITERS
  };
}
