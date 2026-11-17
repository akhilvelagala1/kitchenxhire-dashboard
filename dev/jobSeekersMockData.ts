/**
 * In-memory mock job seeker store for the dev mock API (/hire/admin/job-seekers/*).
 * Not used in production builds.
 *
 * The world is fixed at 24 Jun 2024, India time (+05:30), so the screen matches the reference picture on
 * any day. Nothing here reads the clock or Math.random(): a seeded generator makes every start identical.
 * The list, the summary and the export all read this one store, so they always agree. The trend chart is
 * the one exception: it is independent analytics (see jobSeekersAnalytics.ts).
 * The types match src/modules/hire-admin/schemas/adminJobSeeker.ts field for field.
 */

export const JOB_SEEKER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  under_review: 'Under Review',
  suspended: 'Suspended'
} as const;

export type JobSeekerStatus = keyof typeof JOB_SEEKER_STATUS_LABELS;

export interface HireAdminJobSeeker {
  job_seeker_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  preferred_job_title: string;
  experience_years: number;
  profile_completion: number;
  applications_count: number;
  interviews_count: number;
  shortlisted_count: number;
  hired_count: number;
  status: JobSeekerStatus;
  joined_at: string;
  last_active_at: string | null;
}

/** What the add and edit forms send. */
export interface JobSeekerInput {
  name: string;
  email: string;
  phone: string;
  city: string;
  preferred_job_title: string;
  experience_years: number;
}

const MINUTE = 60_000;
const IST_OFFSET_MS = 330 * MINUTE;

/** The mock "now": the evening of 24 Jun 2024, India time. Recorded audit events start after it. */
export const MOCK_NOW_MS = Date.parse('2024-06-24T18:00:00+05:30');

/** An instant as an ISO string in India time, for example 2024-06-24T10:24:00+05:30. */
export function toIstIso(ms: number): string {
  return `${new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 19)}+05:30`;
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');
const list = (csv: string) => csv.split(',');
const istMs = (monthDayTime: string) => Date.parse(`2024-${monthDayTime}:00+05:30`);

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(items: readonly T[], rand: () => number): T =>
  items[Math.floor(rand() * items.length)]!;

function shuffle<T>(items: T[], rand: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

/** Hyderabad comes up most often. */
const CITIES = list(
  'Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Secunderabad,Secunderabad,Warangal,Vijayawada,Visakhapatnam,Bengaluru,Chennai'
);
const CITY_STATE: Record<string, string> = {
  Hyderabad: 'TS',
  Secunderabad: 'TS',
  Warangal: 'TS',
  Vijayawada: 'AP',
  Visakhapatnam: 'AP',
  Bengaluru: 'KA',
  Chennai: 'TN',
  'Banjara Hills': 'TS',
  Madhapur: 'TS',
  Gachibowli: 'TS',
  Kukatpally: 'TS',
  'Jubilee Hills': 'TS',
  Begumpet: 'TS',
  'LB Nagar': 'TS',
  Uppal: 'TS'
};
const TITLES = list(
  'Cook / Chef,Kitchen Helper,Cleaning & Stewarding,Delivery Executive,Restaurant Manager,Line Cook,Waiter / Server,Dishwasher,Pastry Chef,Barista,Cashier,Store Keeper,Sous Chef'
);
const FIRST_NAMES = list(
  'Aarav,Aditya,Akhil,Ananya,Anjali,Bhavya,Charan,Deepika,Dinesh,Divya,Farhan,Gautam,Harini,Imran,Isha,Jayanth,Kavya,Kiran,Lakshmi,Manoj,Meena,Mohit,Nandini,Naveen,Nikhil,Pavan,Pooja,Pranav,Rajesh,Ravi,Rekha,Rohan,Sahana,Sandeep,Sanjana,Shreya,Sneha,Srinivas,Sunil,Swathi,Tarun,Uma,Varun,Vijay,Vinay,Yash,Zoya'
);
const LAST_NAMES = list(
  'Reddy,Naidu,Rao,Sharma,Verma,Singh,Kumar,Patel,Gupta,Mishra,Das,Jain,Nair,Iyer,Menon,Khan,Ahmed,Shah,Joshi,Desai,Pillai,Babu,Murthy,Yadav,Chowdary,Goud,Prasad,Raju,Varma,Siddiqui,Agarwal,Bhatt,Kulkarni,Shetty,Hegde,Gowda,Mehta,Chopra'
);
/** Whole years of experience, 0 to 12, most people between 1 and 5. */
const EXPERIENCE = [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 12];

/**
 * The ten newest rows from the Job Seekers reference picture.
 * name, phone, city, title, years, completion, apps, interviews, shortlisted, hired, status, lastActive
 */
type Fixed = [
  string,
  string,
  string,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  string,
  string
];

const FIXED: Fixed[] = [
  [
    'Ramesh Kumar',
    '9876543210',
    'Hyderabad',
    'Cook / Chef',
    3,
    92,
    12,
    4,
    3,
    1,
    'active',
    '06-24 10:24'
  ],
  [
    'Priya Sharma',
    '9876543211',
    'Banjara Hills',
    'Kitchen Helper',
    1,
    88,
    8,
    3,
    2,
    0,
    'active',
    '06-22 09:18'
  ],
  [
    'Arjun Reddy',
    '9876543212',
    'Secunderabad',
    'Cleaning & Stewarding',
    2,
    76,
    6,
    2,
    1,
    0,
    'active',
    '06-20 09:18'
  ],
  [
    'Sangeetha Devi',
    '9876543213',
    'Madhapur',
    'Delivery Executive',
    1,
    64,
    5,
    1,
    0,
    0,
    'inactive',
    '06-18 11:03'
  ],
  [
    'Venkatesh Rao',
    '9876543214',
    'Gachibowli',
    'Restaurant Manager',
    5,
    95,
    4,
    2,
    1,
    1,
    'active',
    '06-16 09:20'
  ],
  [
    'Neha Jain',
    '9876543215',
    'Kukatpally',
    'Line Cook',
    2,
    70,
    4,
    1,
    1,
    0,
    'active',
    '06-15 17:47'
  ],
  [
    'Karthik Reddy',
    '9876543216',
    'Jubilee Hills',
    'Waiter / Server',
    3,
    82,
    3,
    1,
    1,
    0,
    'active',
    '06-14 14:30'
  ],
  [
    'Megha Singh',
    '9876543217',
    'Begumpet',
    'Barista',
    1,
    58,
    3,
    0,
    0,
    0,
    'under_review',
    '06-13 11:12'
  ],
  ['Deepak Verma', '9876543218', 'LB Nagar', 'Cashier', 4, 90, 2, 1, 1, 0, 'active', '06-12 18:37'],
  [
    'Lakshmi Priya',
    '9876543219',
    'Uppal',
    'Pastry Chef',
    2,
    68,
    2,
    0,
    0,
    0,
    'suspended',
    '06-11 10:46'
  ]
];

/** Totals over all rows: they are exact, and the fixed rows are counted in them. */
const TOTAL = 12846;
const NON_ACTIVE = 1864;
const UNDER_REVIEW = 240;
const SUSPENDED = 164;
const INACTIVE_ONLY = NON_ACTIVE - UNDER_REVIEW - SUSPENDED;
const SUM_APPLICATIONS = 28642;
const WITH_SHORTLISTED = 4286;
const WITH_HIRED = 1842;
const MAX_APPLICATIONS = 12;
const FIRST_NUMBER = TOTAL;

/** Application counts (1 to 12) for the generated rows that add up to exactly `target`. */
function applicationCounts(n: number, target: number, rand: () => number): number[] {
  const counts = Array.from({ length: n }, () =>
    Math.min(MAX_APPLICATIONS, 1 + Math.floor(rand() ** 2.2 * 7))
  );
  let diff = target - counts.reduce((a, b) => a + b, 0);
  const step = 7919;
  for (let i = 0; diff !== 0; i = (i + step) % n) {
    const next = counts[i]! + Math.sign(diff);
    if (next < 1 || next > MAX_APPLICATIONS) continue;
    counts[i] = next;
    diff -= Math.sign(diff);
  }
  return counts;
}

type Tier = 'none' | 'shortlisted' | 'hired';

function emailFor(name: string, idNum: number): string {
  const slug = name.toLowerCase().replace(/\s+/g, '.');
  return idNum > FIRST_NUMBER - FIXED.length ? `${slug}@email.com` : `${slug}${idNum}@example.com`;
}

export function buildJobSeekers(): HireAdminJobSeeker[] {
  const rand = mulberry32(20240624);
  const fixedTotals = (k: number) =>
    FIXED.reduce((total, f) => total + ((f[k] as number) > 0 ? 1 : 0), 0);
  const rest = TOTAL - FIXED.length;
  const fixedNonActive = FIXED.filter((f) => f[10] !== 'active').length;
  const inactiveLeft = INACTIVE_ONLY - FIXED.filter((f) => f[10] === 'inactive').length;
  const underReviewLeft = UNDER_REVIEW - FIXED.filter((f) => f[10] === 'under_review').length;
  const suspendedLeft = SUSPENDED - FIXED.filter((f) => f[10] === 'suspended').length;
  const activeLeft = rest - (NON_ACTIVE - fixedNonActive);
  const statuses = shuffle(
    [
      ...Array<JobSeekerStatus>(inactiveLeft).fill('inactive'),
      ...Array<JobSeekerStatus>(underReviewLeft).fill('under_review'),
      ...Array<JobSeekerStatus>(suspendedLeft).fill('suspended'),
      ...Array<JobSeekerStatus>(activeLeft).fill('active')
    ],
    rand
  );
  const hiredLeft = WITH_HIRED - fixedTotals(9);
  const shortlistedOnly = WITH_SHORTLISTED - fixedTotals(8) - hiredLeft;
  const tiers = shuffle(
    [
      ...Array<Tier>(hiredLeft).fill('hired'),
      ...Array<Tier>(shortlistedOnly).fill('shortlisted'),
      ...Array<Tier>(rest - hiredLeft - shortlistedOnly).fill('none')
    ],
    rand
  );
  const applications = applicationCounts(
    rest,
    SUM_APPLICATIONS - FIXED.reduce((total, f) => total + f[6], 0),
    rand
  );

  const rows: HireAdminJobSeeker[] = FIXED.map((f, i) => {
    const idNum = FIRST_NUMBER - i;
    const lastActiveMs = istMs(f[11]);
    return {
      job_seeker_id: `JS${pad(idNum, 5)}`,
      name: f[0],
      email: emailFor(f[0], idNum),
      phone: f[1],
      city: f[2],
      state: CITY_STATE[f[2]] ?? 'TS',
      preferred_job_title: f[3],
      experience_years: f[4],
      profile_completion: f[5],
      applications_count: f[6],
      interviews_count: f[7],
      shortlisted_count: f[8],
      hired_count: f[9],
      status: f[10] as JobSeekerStatus,
      joined_at: toIstIso(lastActiveMs - 2 * 24 * 60 * MINUTE),
      last_active_at: toIstIso(lastActiveMs)
    };
  });

  let activeMs = istMs(FIXED[FIXED.length - 1]![11]);
  for (let i = rows.length; i < TOTAL; i++) {
    const k = i - FIXED.length;
    activeMs -= (10 + Math.floor(rand() * 81)) * MINUTE;
    const first = pick(FIRST_NAMES, rand);
    const last = pick(LAST_NAMES, rand);
    const count = applications[k]!;
    const tier = tiers[k]!;
    const shortlisted = tier === 'none' ? 0 : 1 + Math.floor(rand() * Math.min(count, 3));
    const hired = tier === 'hired' ? 1 + Math.floor(rand() * Math.min(shortlisted, 2)) : 0;
    const interviews =
      count === 0 ? 0 : Math.min(count, Math.floor(rand() * Math.min(shortlisted + 1, 4)));
    const status = statuses[k]!;
    const city = pick(CITIES, rand);
    const completion =
      status === 'under_review'
        ? 40 + Math.floor(rand() * 30)
        : status === 'suspended'
          ? 50 + Math.floor(rand() * 40)
          : 55 + Math.floor(rand() * 45);
    rows.push({
      job_seeker_id: `JS${pad(FIRST_NUMBER - i, 5)}`,
      name: `${first} ${last}`,
      email: emailFor(`${first} ${last}`, FIRST_NUMBER - i),
      phone: `${6 + Math.floor(rand() * 4)}${pad(Math.floor(rand() * 1e9), 9)}`,
      city,
      state: CITY_STATE[city] ?? 'TS',
      preferred_job_title: pick(TITLES, rand),
      experience_years: pick(EXPERIENCE, rand),
      profile_completion: completion,
      applications_count: count,
      interviews_count: interviews,
      shortlisted_count: shortlisted,
      hired_count: hired,
      status,
      joined_at: toIstIso(activeMs - (1 + Math.floor(rand() * 14)) * 24 * 60 * MINUTE),
      last_active_at: toIstIso(activeMs)
    });
  }
  return rows;
}

let store: HireAdminJobSeeker[] | undefined;
const indexById = new Map<string, number>();

function reindex(rows: readonly HireAdminJobSeeker[]) {
  indexById.clear();
  rows.forEach((row, i) => indexById.set(row.job_seeker_id, i));
}

export function getJobSeekersStore(): HireAdminJobSeeker[] {
  if (!store) {
    store = buildJobSeekers();
    reindex(store);
  }
  return store;
}

export function findJobSeeker(jobSeekerId: string): HireAdminJobSeeker | undefined {
  const rows = getJobSeekersStore();
  const i = indexById.get(jobSeekerId);
  return i === undefined ? undefined : rows[i];
}

export function updateJobSeeker(
  jobSeekerId: string,
  patch: Partial<JobSeekerInput> & { status?: JobSeekerStatus }
): HireAdminJobSeeker | undefined {
  const row = findJobSeeker(jobSeekerId);
  if (!row) return undefined;
  const next = { ...row, ...patch };
  getJobSeekersStore()[indexById.get(jobSeekerId)!] = next;
  return next;
}

/** A new job seeker: active, joined now (the mock clock), the next id after the highest one. */
export function createJobSeeker(input: JobSeekerInput): HireAdminJobSeeker {
  const rows = getJobSeekersStore();
  const highest = rows.reduce((max, r) => Math.max(max, Number(r.job_seeker_id.slice(2))), 0);
  const row: HireAdminJobSeeker = {
    job_seeker_id: `JS${pad(highest + 1, 5)}`,
    ...input,
    state: CITY_STATE[input.city] ?? 'TS',
    profile_completion: 20,
    applications_count: 0,
    interviews_count: 0,
    shortlisted_count: 0,
    hired_count: 0,
    status: 'active',
    joined_at: toIstIso(MOCK_NOW_MS),
    last_active_at: toIstIso(MOCK_NOW_MS)
  };
  rows.unshift(row);
  reindex(rows);
  return row;
}
