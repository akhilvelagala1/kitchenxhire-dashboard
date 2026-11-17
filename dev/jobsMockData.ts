/**
 * In-memory mock job store for dev mock API (/hire/admin/jobs/*).
 * Not used in production builds.
 *
 * The seed is built to hit the reference screen's totals exactly (see TOTALS), and every endpoint
 * (list, summary, categories, trend) is computed from this one store, so they always agree.
 */

export type HireJobStatus = 'active' | 'under_review' | 'paused' | 'closed' | 'draft';

export interface HireAdminJob {
  job_id: string;
  title: string;
  recruiter_id: string;
  recruiter_name: string;
  business_name: string;
  category: 'Kitchen' | 'Operations' | 'Logistics' | 'Management';
  /** Display row for "Jobs by Category" (Cook / Chef, etc.) */
  job_category_label: string;
  location: string;
  applications_count: number;
  recruited_count: number;
  status: HireJobStatus;
  posted_at: string;
}

export const CATEGORY_LABELS = [
  'Cook / Chef',
  'Kitchen Helper',
  'Cleaning & Stewarding',
  'Delivery & Store Support',
  'Restaurant Manager',
  'Others'
] as const;

/** Jobs per label, in CATEGORY_LABELS order. */
const LABEL_COUNTS = [128, 96, 72, 54, 32, 46] as const;

/** Totals for the mock store. Active is whatever is left after the other statuses. */
const TOTALS = {
  jobs: 428,
  closed: 52,
  underReview: 48,
  paused: 32,
  draft: 18,
  applications: 8672,
  recruited: 642,
  recruiters: 312
} as const;

const RECRUITER_NAMES = [
  'Rahul Verma',
  'Anita Rao',
  'Vikram Singh',
  'Neha Patel',
  'Arjun Mehta',
  'Suman Reddy',
  'Megha Jain',
  'Ravi Kumar'
] as const;

const JOB_CATEGORY: Record<(typeof CATEGORY_LABELS)[number], HireAdminJob['category']> = {
  'Cook / Chef': 'Kitchen',
  'Kitchen Helper': 'Kitchen',
  'Cleaning & Stewarding': 'Operations',
  'Delivery & Store Support': 'Logistics',
  'Restaurant Manager': 'Management',
  Others: 'Operations'
};

const TITLES: Record<string, string[]> = {
  'Cook / Chef': ['Cook / Chef', 'Sous Chef', 'Line Cook'],
  'Kitchen Helper': ['Kitchen Helper', 'Commis'],
  'Cleaning & Stewarding': ['Cleaning & Stewarding', 'Steward'],
  'Delivery & Store Support': ['Delivery & Store Support', 'Store Assistant'],
  'Restaurant Manager': ['Restaurant Manager', 'Outlet Manager'],
  Others: ['General Staff', 'Trainee']
};

const BUSINESSES = [
  'Spice Bowl Restaurant',
  'Urban Bites',
  'The Food Court',
  'Tasty Point',
  'Meal Hub',
  'Cloud Kitchen One',
  'Urban Plates',
  'Royal Dine',
  'Quick Bite Hub',
  'Fresh Fork'
];

const LOCATIONS = ['Hyderabad', 'Secunderabad', 'Bangalore', 'Chennai'];

/** The newest jobs, as on the reference screen: they sit on page 1 of the default sort. */
interface Sample extends Omit<HireAdminJob, 'posted_at'> {
  minutesAgo: number;
}

const SAMPLES: Sample[] = [
  {
    job_id: 'JOB10293',
    title: 'Cook / Chef',
    recruiter_id: 'REC001',
    recruiter_name: 'Rahul Verma',
    business_name: 'Spice Bowl Restaurant',
    category: 'Kitchen',
    job_category_label: 'Cook / Chef',
    location: 'Hyderabad',
    applications_count: 286,
    recruited_count: 28,
    status: 'active',
    minutesAgo: 15
  },
  {
    job_id: 'JOB10292',
    title: 'Kitchen Helper',
    recruiter_id: 'REC002',
    recruiter_name: 'Anita Rao',
    business_name: 'Urban Bites',
    category: 'Kitchen',
    job_category_label: 'Kitchen Helper',
    location: 'Hyderabad',
    applications_count: 198,
    recruited_count: 18,
    status: 'active',
    minutesAgo: 52
  },
  {
    job_id: 'JOB10291',
    title: 'Cleaning & Stewarding',
    recruiter_id: 'REC003',
    recruiter_name: 'Vikram Singh',
    business_name: 'The Food Court',
    category: 'Operations',
    job_category_label: 'Cleaning & Stewarding',
    location: 'Secunderabad',
    applications_count: 142,
    recruited_count: 12,
    status: 'active',
    minutesAgo: 105
  },
  {
    job_id: 'JOB10290',
    title: 'Delivery & Store Support',
    recruiter_id: 'REC004',
    recruiter_name: 'Neha Patel',
    business_name: 'Tasty Point',
    category: 'Logistics',
    job_category_label: 'Delivery & Store Support',
    location: 'Hyderabad',
    applications_count: 118,
    recruited_count: 10,
    status: 'under_review',
    minutesAgo: 170
  },
  {
    job_id: 'JOB10289',
    title: 'Restaurant Manager',
    recruiter_id: 'REC005',
    recruiter_name: 'Arjun Mehta',
    business_name: 'Meal Hub',
    category: 'Management',
    job_category_label: 'Restaurant Manager',
    location: 'Hyderabad',
    applications_count: 96,
    recruited_count: 8,
    status: 'paused',
    minutesAgo: 245
  }
];

/** Generated jobs are spread over yesterday back to this many days ago, so all fall in the 30-day window. */
const DAYS_BACK = 29;

let jobsStore: HireAdminJob[] = [];
let storeInitialized = false;

/** Splits `total` into whole numbers proportional to `weights`, summing to exactly `total`. */
function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sum);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  const byRemainder = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (const { i } of byRemainder) {
    if (left <= 0) break;
    out[i] = (out[i] ?? 0) + 1;
    left -= 1;
  }
  return out;
}

function daysAgoIso(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * How many days ago each generated job was posted, oldest first. Volume drifts upward towards
 * today and dips on a weekly beat, so the running total is a natural curve rather than a ramp.
 */
function postingDays(count: number): number[] {
  const days = Array.from({ length: DAYS_BACK }, (_, i) => DAYS_BACK - i);
  const weights = days.map(
    (k) => 1 + 0.45 * Math.cos((2 * Math.PI * (k + 2)) / 7) + 0.5 * (1 - k / DAYS_BACK)
  );
  const perDay = allocate(count, weights);
  return days.flatMap((k, i) => Array<number>(perDay[i] ?? 0).fill(k));
}

const samplesWith = <K extends 'status' | 'job_category_label'>(key: K, value: Sample[K]) =>
  SAMPLES.filter((s) => s[key] === value).length;

/** Jobs still to generate per status, once the sample jobs are counted. */
const GENERATED_STATUS_ENDS = (() => {
  const closed = TOTALS.closed - samplesWith('status', 'closed');
  const paused = TOTALS.paused - samplesWith('status', 'paused');
  const underReview = TOTALS.underReview - samplesWith('status', 'under_review');
  const draft = TOTALS.draft - samplesWith('status', 'draft');
  const active = TOTALS.jobs - SAMPLES.length - closed - paused - underReview - draft;
  return {
    active,
    underReview: active + underReview,
    paused: active + underReview + paused,
    closed: active + underReview + paused + closed
  };
})();

/** A rank in 0..count-1 picks a status, so each status gets exactly its share. */
function statusForRank(rank: number): HireJobStatus {
  if (rank < GENERATED_STATUS_ENDS.active) return 'active';
  if (rank < GENERATED_STATUS_ENDS.underReview) return 'under_review';
  if (rank < GENERATED_STATUS_ENDS.paused) return 'paused';
  if (rank < GENERATED_STATUS_ENDS.closed) return 'closed';
  return 'draft';
}

/** Same idea for the six category labels, net of the sample jobs. */
function labelForRank(rank: number): (typeof CATEGORY_LABELS)[number] {
  let upTo = 0;
  for (const [i, label] of CATEGORY_LABELS.entries()) {
    upTo += LABEL_COUNTS[i]! - samplesWith('job_category_label', label);
    if (rank < upTo) return label;
  }
  return 'Others';
}

function seedJobsStore(): HireAdminJob[] {
  const now = Date.now();
  const samples: HireAdminJob[] = SAMPLES.map(({ minutesAgo, ...job }) => ({
    ...job,
    posted_at: new Date(now - minutesAgo * 60_000).toISOString()
  }));

  const count = TOTALS.jobs - samples.length;
  const days = postingDays(count);
  const applications = allocate(
    TOTALS.applications - samples.reduce((a, j) => a + j.applications_count, 0),
    Array.from({ length: count }, (_, n) => 3 + ((n * 17) % 31))
  );
  const recruited = allocate(
    TOTALS.recruited - samples.reduce((a, j) => a + j.recruited_count, 0),
    Array.from({ length: count }, (_, n) => 0.5 + ((n * 7) % 5))
  );
  const generatedRecruiters = TOTALS.recruiters - new Set(samples.map((j) => j.recruiter_id)).size;
  // 37 and 53 share no factor with 423, so each walks every rank 0..422 exactly once.
  const generated: HireAdminJob[] = Array.from({ length: count }, (_, n) => {
    const label = labelForRank((n * 53) % count);
    const titles = TITLES[label] ?? ['Staff'];
    const daysAgo = days[n] ?? 1;
    const recruiterIndex = n % Math.max(1, generatedRecruiters);
    return {
      job_id: '',
      title: titles[n % titles.length]!,
      recruiter_id: `REC${100 + recruiterIndex}`,
      recruiter_name: RECRUITER_NAMES[recruiterIndex % RECRUITER_NAMES.length]!,
      business_name: BUSINESSES[n % BUSINESSES.length]!,
      category: JOB_CATEGORY[label],
      job_category_label: label,
      location: LOCATIONS[n % LOCATIONS.length]!,
      applications_count: applications[n] ?? 0,
      recruited_count: recruited[n] ?? 0,
      status: statusForRank((n * 37) % count),
      posted_at: daysAgoIso(daysAgo, 8 + ((n * 7 + daysAgo) % 11), (n * 13 + daysAgo * 7) % 60)
    };
  });

  // Newest first, with ids that fall as the jobs get older, below the sample ids.
  generated.sort((a, b) => b.posted_at.localeCompare(a.posted_at));
  generated.forEach((job, i) => {
    job.job_id = `JOB${String(10288 - i).padStart(5, '0')}`;
  });

  jobsStore = [...samples, ...generated];
  storeInitialized = true;
  return jobsStore;
}

export function getJobsStore(): HireAdminJob[] {
  if (!storeInitialized) seedJobsStore();
  return jobsStore;
}

export function setJobsStore(next: HireAdminJob[]) {
  jobsStore = next;
  storeInitialized = true;
}

void seedJobsStore();
