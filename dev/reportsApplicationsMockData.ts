/**
 * Numbers for GET /hire/admin/reports/applications in the dev mock API: the Applications Report tab
 * for the last 7, 30 or 90 days. Hired, Rejected, the status donut, the trend and the locations are
 * derived from reportsOverview() so the two tabs always agree on the same window; only the Shortlisted
 * and Under Review change percentages and the applications-per-category split are new here, since
 * Overview never needed them. The types repeat src/modules/hire-admin/schemas/adminReports.ts, because
 * dev/ never imports src/.
 */
import { type ReportRange, reportsOverview } from './reportsMockData.ts';

type ApplicationStatus =
  'pending_review' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'hired' | 'rejected';

interface Kpi {
  value: number;
  change_pct: number;
}

interface TrendPoint {
  date: string;
  applications: number;
}

interface RankedCount {
  label: string;
  count: number;
}

interface RecentApplication {
  id: string;
  candidate_name: string;
  job_title: string;
  applied_on: string;
  status: ApplicationStatus;
}

export interface ApplicationsReport {
  range: { from: string; to: string };
  kpis: Record<'total_applications' | 'shortlisted' | 'under_review' | 'hired' | 'rejected', Kpi>;
  applications_trend: TrendPoint[];
  application_status: {
    status: 'hired' | 'shortlisted' | 'under_review' | 'rejected';
    count: number;
  }[];
  top_categories: RankedCount[];
  top_locations: RankedCount[];
  recent_applications: RecentApplication[];
}

/** Applications received per job category: a different split from jobs-posted-by-category, since some
 * categories draw far more applicants per opening than others. Proportioned the same way across windows. */
const CATEGORY_SHARE: Record<string, number> = {
  'Cook / Chef': 0.2791,
  'Kitchen Helper': 0.1822,
  'Cleaning & Stewarding': 0.1344,
  'Delivery & Store Support': 0.1093,
  'Bakery Assistant': 0.0704,
  Others: 0.2246
};

function categoriesFor(totalApplications: number): RankedCount[] {
  return Object.entries(CATEGORY_SHARE).map(([label, share]) => ({
    label,
    count: Math.round(totalApplications * share)
  }));
}

/** The newest five applications: the same list regardless of the window, as a real feed would be. */
const RECENT_APPLICATIONS: RecentApplication[] = [
  {
    id: 'APP-9421',
    candidate_name: 'Priya Sharma',
    job_title: 'Cook / Chef',
    applied_on: '2026-06-24T11:24:00+05:30',
    status: 'shortlisted'
  },
  {
    id: 'APP-9420',
    candidate_name: 'Rahul Menon',
    job_title: 'Kitchen Helper',
    applied_on: '2026-06-24T10:18:00+05:30',
    status: 'pending_review'
  },
  {
    id: 'APP-9419',
    candidate_name: 'Kiran Das',
    job_title: 'Delivery & Store Support',
    applied_on: '2026-06-23T18:40:00+05:30',
    status: 'rejected'
  },
  {
    id: 'APP-9418',
    candidate_name: 'Ananya Rao',
    job_title: 'Cleaning & Stewarding',
    applied_on: '2026-06-23T14:05:00+05:30',
    status: 'reviewed'
  },
  {
    id: 'APP-9417',
    candidate_name: 'Vikram Singh',
    job_title: 'Bakery Assistant',
    applied_on: '2026-06-22T09:30:00+05:30',
    status: 'hired'
  }
];

/** Shortlisted and Under Review have no change percentage in Overview; these are new for this tab. */
const CHANGE_PCT: Record<ReportRange, { shortlisted: number; under_review: number }> = {
  '7d': { shortlisted: 16, under_review: 9 },
  '30d': { shortlisted: 20, under_review: 12 },
  '90d': { shortlisted: 24, under_review: 15 }
};

export function applicationsReport(range: ReportRange): ApplicationsReport {
  const overview = reportsOverview(range);
  const shortlisted = overview.application_status.find((row) => row.status === 'shortlisted')!;
  const underReview = overview.application_status.find((row) => row.status === 'under_review')!;
  const changePct = CHANGE_PCT[range];

  return {
    range: overview.range,
    kpis: {
      total_applications: overview.kpis.applications,
      shortlisted: { value: shortlisted.count, change_pct: changePct.shortlisted },
      under_review: { value: underReview.count, change_pct: changePct.under_review },
      hired: overview.kpis.hired,
      rejected: overview.kpis.rejected
    },
    applications_trend: overview.hiring_trend.map((point) => ({
      date: point.date,
      applications: point.applications
    })),
    application_status: overview.application_status,
    top_categories: categoriesFor(overview.kpis.applications.value),
    top_locations: overview.top_locations,
    recent_applications: RECENT_APPLICATIONS
  };
}
