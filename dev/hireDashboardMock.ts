export interface HireDashboardSummary {
  total_jobs: number;
  total_applications: number;
  active_recruiters: number;
  job_seekers: number;
  growth_jobs_pct: number;
  growth_applications_pct: number;
  growth_recruiters_pct: number;
  growth_job_seekers_pct: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface RecentApplicationRow {
  id: string;
  candidate_name: string;
  candidate_initials: string;
  job_title: string;
  location: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'HIRED' | 'REJECTED';
  applied_at: string;
}

export interface OpenJobCategoryRow {
  id: string;
  label: string;
  count: number;
}

export interface AdminSearchHit {
  id: string;
  type: 'job' | 'application' | 'candidate' | 'recruiter' | 'business';
  title: string;
  subtitle: string;
  href: string;
}

const SEARCH_INDEX: AdminSearchHit[] = [
  {
    id: 'job-101',
    type: 'job',
    title: 'Cook / Chef — Hyderabad',
    subtitle: 'Job · KX-J-101',
    href: '/admin/jobs'
  },
  {
    id: 'app-10892',
    type: 'application',
    title: 'APP10892 · Rahul Kumar',
    subtitle: 'Application · Cook / Chef',
    href: '/admin/applications/APP10892'
  },
  {
    id: 'cand-rk',
    type: 'candidate',
    title: 'Ramesh Kumar',
    subtitle: 'Candidate · Hyderabad',
    href: '/admin/job-seekers'
  },
  {
    id: 'rec-spice',
    type: 'recruiter',
    title: 'Spice Route Kitchens',
    subtitle: 'Recruiter · Madhapur',
    href: '/admin/recruiters'
  },
  {
    id: 'biz-cloud',
    type: 'business',
    title: 'Cloud Bowl — Gachibowli',
    subtitle: 'Business / outlet',
    href: '/admin/businesses'
  }
];

export function hireDashboardSummary(): HireDashboardSummary {
  return {
    total_jobs: 1482,
    total_applications: 8672,
    active_recruiters: 312,
    job_seekers: 24860,
    growth_jobs_pct: 12,
    growth_applications_pct: 18,
    growth_recruiters_pct: 7,
    growth_job_seekers_pct: 15
  };
}

export function hireApplicationsTrend(range: string): TrendPoint[] {
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const points: TrendPoint[] = [];
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const progress = (days - i) / days;
    const wave = Math.sin(i / 5) * 180;
    const base = 820 + progress * 980 + wave;
    const count = i === 0 && range === '30d' ? 1842 : Math.max(400, Math.round(base));
    points.push({
      date: d.toISOString().slice(0, 10),
      count
    });
  }
  return points;
}

export function hireRecentApplications(): RecentApplicationRow[] {
  return [
    {
      id: 'APP10892',
      candidate_name: 'Rahul Kumar',
      candidate_initials: 'RK',
      job_title: 'Cook / Chef',
      location: 'Hyderabad',
      status: 'UNDER_REVIEW',
      applied_at: '2026-06-24T04:54:00.000Z'
    },
    {
      id: 'APP10891',
      candidate_name: 'Priya Sharma',
      candidate_initials: 'PS',
      job_title: 'Kitchen Helper',
      location: 'Hyderabad',
      status: 'SHORTLISTED',
      applied_at: '2026-06-24T03:48:00.000Z'
    },
    {
      id: 'APP10890',
      candidate_name: 'Amit Mishra',
      candidate_initials: 'AM',
      job_title: 'Cleaning & Stewarding',
      location: 'Secunderabad',
      status: 'INTERVIEW',
      applied_at: '2026-06-23T12:12:00.000Z'
    }
  ];
}

export function hireOpenJobsByCategory(): OpenJobCategoryRow[] {
  return [
    { id: 'chef', label: 'Cook / Chef', count: 428 },
    { id: 'helper', label: 'Kitchen Helper', count: 276 },
    { id: 'cleaning', label: 'Cleaning & Stewarding', count: 198 },
    { id: 'delivery', label: 'Delivery & Store Support', count: 142 },
    { id: 'other', label: 'Others', count: 86 }
  ];
}

export function hireAdminSearch(query: string): AdminSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.filter(
    (hit) =>
      hit.title.toLowerCase().includes(q) ||
      hit.subtitle.toLowerCase().includes(q) ||
      hit.id.toLowerCase().includes(q)
  );
}
