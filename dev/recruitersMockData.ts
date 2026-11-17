/**
 * In-memory mock recruiter store for the dev mock API (/hire/admin/recruiters/*).
 * Not used in production builds.
 *
 * The world is fixed at 24 Jun 2024, India time (+05:30), so the screen matches the reference picture on
 * any day. Nothing here reads the clock or Math.random(): a seeded generator makes every start identical.
 * The list, the summary and the export all read this one store, so they always agree. The trend chart is
 * the one exception: it is independent analytics (see recruitersAnalytics.ts).
 * The types match src/modules/hire-admin/schemas/adminRecruiter.ts field for field.
 */

export const RECRUITER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended'
} as const;

export type RecruiterStatus = keyof typeof RECRUITER_STATUS_LABELS;

export const RECRUITER_STATUSES = Object.keys(RECRUITER_STATUS_LABELS) as RecruiterStatus[];

export const RECRUITER_VERIFICATION_LABELS = {
  verified: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected'
} as const;

export type RecruiterVerification = keyof typeof RECRUITER_VERIFICATION_LABELS;

export const RECRUITER_VERIFICATIONS = Object.keys(
  RECRUITER_VERIFICATION_LABELS
) as RecruiterVerification[];

export const BUSINESS_TYPES = ['Restaurant', 'Cloud Kitchen', 'Food Court'] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export interface HireAdminRecruiter {
  recruiter_id: string;
  business_name: string;
  business_type: BusinessType;
  area: string;
  city: string;
  owner_name: string;
  phone: string;
  email: string;
  outlets: number;
  open_jobs: number;
  applications: number;
  status: RecruiterStatus;
  verification: RecruiterVerification;
  joined_at: string;
  last_login_at: string | null;
}

export interface RecruiterInput {
  business_name: string;
  business_type: BusinessType;
  area: string;
  city: string;
  owner_name: string;
  phone: string;
  email: string;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const IST_OFFSET_MS = 330 * MINUTE;

/** The mock "now": the evening of 24 Jun 2024, India time. New recruiters join then. */
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

/** Splits `total` over the weights in whole numbers that add up to exactly `total` (largest remainder). */
function allocate(total: number, weights: readonly number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (total * w) / sum);
  const parts = exact.map(Math.floor);
  const left = total - parts.reduce((a, b) => a + b, 0);
  const order = exact
    .map((value, i) => ({ i, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);
  for (let k = 0; k < left; k++) parts[order[k]!.i]! += 1;
  return parts;
}

/** Neighbourhoods per city. Hyderabad comes up most often. */
const AREAS: Record<string, string[]> = {
  Hyderabad: list(
    'Rajiv Nagar,Banjara Hills,Kukatpally,Madhapur,Gachibowli,Jubilee Hills,Begumpet,Ameerpet,Kondapur,Hitech City,Miyapur,Dilsukhnagar,Uppal,LB Nagar,Mehdipatnam,Tolichowki,Nizampet,Somajiguda'
  ),
  Secunderabad: list('Paradise Circle,Trimulgherry,Bowenpally,Marredpally,Alwal'),
  Warangal: list('Hanamkonda,Kazipet,Subedari'),
  Vijayawada: list('Benz Circle,Governorpet,Labbipet'),
  Visakhapatnam: list('Dwaraka Nagar,MVP Colony,Gajuwaka'),
  Bengaluru: list('Koramangala,Indiranagar,HSR Layout,Whitefield')
};
const CITY_WEIGHTS = list(
  'Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Hyderabad,Secunderabad,Secunderabad,Warangal,Vijayawada,Visakhapatnam,Bengaluru'
);
const FIRST_NAMES = list(
  'Aarav,Aditya,Akhil,Ananya,Anjali,Arjun,Bhavya,Charan,Deepika,Dinesh,Divya,Farhan,Gautam,Harini,Imran,Isha,Jayanth,Kavya,Kiran,Lakshmi,Manoj,Meena,Mohit,Nandini,Naveen,Nikhil,Pavan,Pooja,Pranav,Rajesh,Ramesh,Ravi,Rekha,Rohan,Sahana,Sandeep,Sanjana,Shreya,Sneha,Srinivas,Sunil,Swathi,Tarun,Uma,Varun,Vijay,Vinay,Yash,Zoya'
);
const LAST_NAMES = list(
  'Reddy,Naidu,Rao,Sharma,Verma,Singh,Kumar,Patel,Gupta,Mishra,Das,Jain,Nair,Iyer,Menon,Khan,Ahmed,Shah,Joshi,Desai,Pillai,Babu,Murthy,Yadav,Chowdary,Goud,Prasad,Raju,Varma,Siddiqui,Agarwal,Bhatt,Kulkarni,Shetty,Hegde,Gowda,Mehta,Chopra'
);
const NAME_STARTS = list(
  'Royal,Golden,Green,Silver,Saffron,Masala,Tandoor,Biryani,Dosa,Idli,Curry,Chilli,Pepper,Ginger,Mango,Lotus,Spicy,Tasty,Fresh,Hungry,Flame,Zaika,Annapurna,Swad,Rasoi,Dhaba,Nawab,Charminar,Paradise,Sagar,Udupi,Andhra,Kerala,Punjabi,Chettinad,Coastal,Urban,Metro,Smoky,Copper,Velvet,Maple,Cedar,Ocean,Sunrise,Moonlight,Lucky,Grand,Little,Happy'
);
const NAME_ENDS: Record<BusinessType, string[]> = {
  Restaurant: list(
    'Restaurant,Grill,Biryani House,Kitchen & Bar,Cafe,Family Restaurant,Eatery,Diner'
  ),
  'Cloud Kitchen': list('Cloud Kitchen,Kitchen,Eats,Bites,Box,Delivery Kitchen,Foods'),
  'Food Court': list('Food Court,Food Plaza,Food Street,Food Hub,Eat Street')
};

/**
 * Newest rows for the redesign table: name|type|area|city|owner|phone|email|outlets|jobs|apps|
 * status|verification|joined|lastLogin.
 */
const FIXED_ROWS = [
  'Spice Bowl Restaurant|Restaurant|Rajiv Nagar|Hyderabad|Rajesh Kumar|9848012345|rajesh.kumar@spicebowl.example.com|12|48|24|active|verified|06-24 09:00|06-24 10:24',
  'Urban Bites|Cloud Kitchen|Banjara Hills|Hyderabad|Priya Nair|9701123456|priya.nair@urbanbites.example.com|8|36|18|active|verified|06-22 08:00|06-22 09:18',
  'The Food Court|Food Court|Kukatpally|Hyderabad|Amit Verma|9966778899|amit.verma@thefoodcourt.example.com|5|28|12|active|pending|06-20 12:00|06-20 16:52',
  'Tasty Point|Restaurant|Madhapur|Hyderabad|Suresh Goud|8099123456|suresh.goud@tastypoint.example.com|6|20|10|inactive|verified|06-18 10:00|06-18 11:03',
  'Meal Hub|Cloud Kitchen|Gachibowli|Hyderabad|Neha Kulkarni|7416543210|neha.kulkarni@mealhub.example.com|4|16|8|pending|pending|06-16 08:30|06-16 09:20',
  'Cloud Kitchen One|Cloud Kitchen|Hitech City|Hyderabad|Ravi Sharma|9000123456|ravi.sharma@cloudone.example.com|3|14|6|active|verified|06-15 11:00|06-15 14:40',
  'Royal Dine|Restaurant|Jubilee Hills|Hyderabad|Anita Rao|9888123456|anita.rao@royaldine.example.com|7|22|11|suspended|rejected|06-14 09:10|06-14 10:05',
  'Quick Bite Hub|Food Court|Ameerpet|Hyderabad|Vikram Singh|9777123456|vikram.singh@quickbite.example.com|2|10|4|active|pending|06-13 15:00|06-13 17:22',
  'Fresh Fork|Restaurant|Kondapur|Hyderabad|Megha Jain|9666123456|megha.jain@freshfork.example.com|5|18|9|inactive|rejected|06-12 08:20|06-12 09:45',
  'Urban Plates|Cloud Kitchen|Madhapur|Hyderabad|Arjun Mehta|9555123456|arjun.mehta@urbanplates.example.com|4|15|7|active|verified|06-11 10:00|06-11 12:30'
];

type Fixed = [
  string,
  BusinessType,
  string,
  string,
  string,
  string,
  string,
  [number, number, number],
  RecruiterStatus,
  RecruiterVerification,
  string,
  string
];

const FIXED: Fixed[] = FIXED_ROWS.map((line) => {
  const c = line.split('|');
  const stats: [number, number, number] = [Number(c[7]), Number(c[8]), Number(c[9])];
  return [
    c[0]!,
    c[1] as BusinessType,
    c[2]!,
    c[3]!,
    c[4]!,
    c[5]!,
    c[6]!,
    stats,
    c[10] as RecruiterStatus,
    c[11] as RecruiterVerification,
    c[12]!,
    c[13]!
  ];
});

const TOTAL = 312;
const FIRST_NUMBER = 10892;
/** Status quotas over all rows, the fixed rows included. */
const STATUS_QUOTAS: Record<RecruiterStatus, number> = {
  active: 286,
  inactive: 12,
  pending: 8,
  suspended: 6
};
const BUSINESS_QUOTAS: Record<BusinessType, number> = {
  Restaurant: 140,
  'Cloud Kitchen': 109,
  'Food Court': 63
};
const TOTAL_OUTLETS = 642;
const TOTAL_OPEN_JOBS = 1428;
/** How strongly a status pulls open jobs. */
const JOB_WEIGHT: Record<RecruiterStatus, number> = {
  active: 1,
  inactive: 0.25,
  pending: 0.1,
  suspended: 0
};
const VERIFICATIONS: RecruiterVerification[] = ['verified', 'pending', 'rejected'];

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '');

function fillQuota<T extends string>(
  quotas: Record<T, number>,
  fixed: readonly T[],
  rand: () => number
) {
  const left = (Object.keys(quotas) as T[]).flatMap((key) =>
    Array<T>(quotas[key] - fixed.filter((f) => f === key).length).fill(key)
  );
  return shuffle(left, rand);
}

export function buildRecruiters(): HireAdminRecruiter[] {
  const rand = mulberry32(20240624);
  const count = TOTAL - FIXED.length;
  const statuses = fillQuota(
    STATUS_QUOTAS,
    FIXED.map((f) => f[8]),
    rand
  );
  const types = fillQuota(
    BUSINESS_QUOTAS,
    FIXED.map((f) => f[1]),
    rand
  );
  const extraOutlets = allocate(
    TOTAL_OUTLETS - FIXED.reduce((sum, f) => sum + f[7][0], 0) - count,
    Array.from({ length: count }, () => 0.1 + rand() ** 2 * 3)
  );
  const outlets = extraOutlets.map((extra) => 1 + extra);
  const openJobs = allocate(
    TOTAL_OPEN_JOBS - FIXED.reduce((sum, f) => sum + f[7][1], 0),
    outlets.map((n, i) => n * (0.4 + rand()) * JOB_WEIGHT[statuses[i]!])
  );

  const used = new Set(FIXED.map((f) => f[0]));
  const uniqueName = (type: BusinessType) => {
    for (let attempt = 0; attempt < 40; attempt++) {
      const name = `${pick(NAME_STARTS, rand)} ${pick(NAME_ENDS[type], rand)}`;
      if (!used.has(name)) return (used.add(name), name);
    }
    const name = `${pick(NAME_STARTS, rand)} ${pick(NAME_ENDS[type], rand)} ${used.size}`;
    return (used.add(name), name);
  };

  const rows: HireAdminRecruiter[] = FIXED.map(
    (
      [name, type, area, city, owner, phone, email, [o, j, a], status, verification, joined, login],
      i
    ) => ({
      recruiter_id: `REC${pad(FIRST_NUMBER - i, 5)}`,
      business_name: name,
      business_type: type,
      area,
      city,
      owner_name: owner,
      phone,
      email,
      outlets: o,
      open_jobs: j,
      applications: a,
      status,
      verification,
      joined_at: toIstIso(istMs(joined)),
      last_login_at: toIstIso(istMs(login))
    })
  );

  let joinedMs = istMs(FIXED[FIXED.length - 1]![10]);
  for (let k = 0; k < count; k++) {
    joinedMs -= 12 * HOUR + Math.floor(rand() * (24 * 60 + 1)) * MINUTE;
    const type = types[k]!;
    const status = statuses[k]!;
    const city = pick(CITY_WEIGHTS, rand);
    const first = pick(FIRST_NAMES, rand);
    const last = pick(LAST_NAMES, rand);
    const name = uniqueName(type);
    const jobs = openJobs[k]!;
    const loginGap = Math.floor(rand() * 48) * HOUR;
    rows.push({
      recruiter_id: `REC${pad(FIRST_NUMBER - rows.length, 5)}`,
      business_name: name,
      business_type: type,
      area: pick(AREAS[city]!, rand),
      city,
      owner_name: `${first} ${last}`,
      phone: `${6 + Math.floor(rand() * 4)}${pad(Math.floor(rand() * 1e9), 9)}`,
      email: `${first}.${last}@${slug(name)}.example.com`.toLowerCase(),
      outlets: outlets[k]!,
      open_jobs: jobs,
      applications:
        status === 'pending' || status === 'suspended'
          ? 0
          : Math.round(jobs * (0.35 + rand() * 0.3)),
      status,
      verification: VERIFICATIONS[Math.floor(rand() * VERIFICATIONS.length)]!,
      joined_at: toIstIso(joinedMs),
      last_login_at: status === 'pending' ? null : toIstIso(joinedMs + loginGap)
    });
  }
  return rows;
}

let store: HireAdminRecruiter[] | undefined;
const indexById = new Map<string, number>();

export function getRecruitersStore(): HireAdminRecruiter[] {
  if (!store) {
    store = buildRecruiters();
    store.forEach((row, i) => indexById.set(row.recruiter_id, i));
  }
  return store;
}

export function findRecruiter(recruiterId: string): HireAdminRecruiter | undefined {
  const rows = getRecruitersStore();
  const i = indexById.get(recruiterId);
  return i === undefined ? undefined : rows[i];
}

export function updateRecruiter(
  recruiterId: string,
  patch: Partial<RecruiterInput> & {
    status?: RecruiterStatus;
    verification?: RecruiterVerification;
  }
): HireAdminRecruiter | undefined {
  const row = findRecruiter(recruiterId);
  if (!row) return undefined;
  const next = { ...row, ...patch };
  getRecruitersStore()[indexById.get(recruiterId)!] = next;
  return next;
}

/** A new recruiter: id one above the highest, pending until approved, no outlets or jobs yet. */
export function addRecruiter(input: RecruiterInput): HireAdminRecruiter {
  const rows = getRecruitersStore();
  const highest = rows.reduce((max, r) => Math.max(max, Number(r.recruiter_id.slice(3))), 0);
  const row: HireAdminRecruiter = {
    recruiter_id: `REC${pad(highest + 1, 5)}`,
    ...input,
    outlets: 0,
    open_jobs: 0,
    applications: 0,
    status: 'pending',
    verification: 'pending',
    joined_at: toIstIso(MOCK_NOW_MS),
    last_login_at: null
  };
  indexById.set(row.recruiter_id, rows.push(row) - 1);
  return row;
}
