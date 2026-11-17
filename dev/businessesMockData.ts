/**
 * In-memory mock business store for the dev mock API (/hire/admin/businesses/*).
 * Not used in production builds.
 *
 * The world is fixed at 24 Jun 2024, India time (+05:30). The picture shows 642 businesses
 * (586 active, 36 inactive; the other 20 are Under Review or Suspended and appear in All only),
 * 1,428 outlets of which 1,312 belong to active businesses, and 24 warehouses.
 * The types match src/modules/hire-admin/schemas/adminBusiness.ts field for field.
 */

export const BUSINESS_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  under_review: 'Under Review',
  suspended: 'Suspended'
} as const;

export type BusinessStatus = keyof typeof BUSINESS_STATUS_LABELS;

export type BusinessVerification = 'verified' | 'pending' | 'unverified';

export const BUSINESS_KINDS = ['Restaurant', 'Cloud Kitchen', 'Food Court', 'Warehouse'] as const;

export type BusinessKind = (typeof BUSINESS_KINDS)[number];

export interface HireAdminBusiness {
  business_id: string;
  business_name: string;
  business_type: BusinessKind;
  area: string;
  city: string;
  owner_name: string;
  phone: string;
  email: string;
  outlets: number;
  status: BusinessStatus;
  verification: BusinessVerification;
  joined_at: string;
}

/** What the add and edit dialogs send. */
export interface BusinessInput {
  business_name: string;
  business_type: BusinessKind;
  area: string;
  city: string;
  owner_name: string;
  phone: string;
  email: string;
}

const MINUTE = 60_000;
const IST_OFFSET_MS = 330 * MINUTE;

/** The mock "now": the evening of 24 Jun 2024, India time. New businesses join then. */
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

/** `kind` repeated `counts[kind]` times for every entry, shuffled. */
function spread<T extends string>(counts: Record<T, number>, rand: () => number): T[] {
  const all = (Object.keys(counts) as T[]).flatMap((kind) => Array<T>(counts[kind]).fill(kind));
  return shuffle(all, rand);
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
const WAREHOUSE_AREAS = list('Patancheru,Medchal,Shamshabad,Balanagar,Bahadurpally,Cherlapally');
const FIRST_NAMES = list(
  'Aarav,Aditya,Akhil,Ananya,Anjali,Arjun,Bhavya,Charan,Deepika,Dinesh,Divya,Farhan,Gautam,Harini,Imran,Isha,Jayanth,Kavya,Kiran,Lakshmi,Manoj,Meena,Mohit,Nandini,Naveen,Nikhil,Pavan,Pooja,Pranav,Rajesh,Ramesh,Ravi,Rekha,Rohan,Sahana,Sandeep,Sanjana,Shreya,Sneha,Srinivas,Sunil,Swathi,Tarun,Uma,Varun,Vijay,Vinay,Yash,Zoya'
);
const LAST_NAMES = list(
  'Reddy,Naidu,Rao,Sharma,Verma,Singh,Kumar,Patel,Gupta,Mishra,Das,Jain,Nair,Iyer,Menon,Khan,Ahmed,Shah,Joshi,Desai,Pillai,Babu,Murthy,Yadav,Chowdary,Goud,Prasad,Raju,Varma,Siddiqui,Agarwal,Bhatt,Kulkarni,Shetty,Hegde,Gowda,Mehta,Chopra'
);
const NAME_STARTS = list(
  'Royal,Golden,Green,Silver,Saffron,Masala,Tandoor,Biryani,Dosa,Idli,Curry,Chilli,Pepper,Ginger,Mango,Lotus,Spicy,Tasty,Fresh,Hungry,Flame,Zaika,Annapurna,Swad,Rasoi,Dhaba,Nawab,Charminar,Paradise,Sagar,Udupi,Andhra,Kerala,Punjabi,Chettinad,Coastal,Urban,Metro,Smoky,Copper,Velvet,Maple,Cedar,Ocean,Sunrise,Moonlight,Lucky,Grand,Little,Happy'
);
const NAME_ENDS: Record<BusinessKind, string[]> = {
  Restaurant: list('Restaurant,Grill,Biryani House,Cafe,Family Restaurant,Eatery,Diner,Bowl'),
  'Cloud Kitchen': list('Cloud Kitchen,Kitchen,Eats,Bites,Box,Delivery Kitchen,Foods'),
  'Food Court': list('Food Court,Food Plaza,Food Street,Food Hub,Eat Street'),
  Warehouse: list('Warehouse,Cold Storage,Supplies,Provisions,Distribution Centre,Stockyard')
};

/** Newest rows from the reference: name|type|area|owner|phone|outlets|status|verification|joined. */
const FIXED_ROWS = [
  'Spice Bowl Restaurant|Restaurant|Rajiv Nagar|Ramesh Kumar|9876543210|12|active|verified|06-24 10:24',
  'Urban Bites|Cloud Kitchen|Banjara Hills|Priya Sharma|9876554321|8|active|verified|06-22 09:18',
  'The Food Court|Food Court|Kukatpally|Arjun Reddy|9123456789|5|active|pending|06-20 16:52',
  'FreshStock Warehouse|Warehouse|Patancheru|Sangeetha Devi|9012345678|1|inactive|unverified|06-18 11:03',
  'Meal Hub|Restaurant|Gachibowli|Venkatesh Rao|9345678901|6|active|verified|06-16 09:20',
  'Tasty Point|Restaurant|Madhapur|Suresh Goud|8099123456|4|inactive|pending|06-15 10:00',
  'Cloud Curry|Cloud Kitchen|Kondapur|Neha Jain|9666123456|3|active|verified|06-14 09:45',
  'Plaza Eats|Food Court|Ameerpet|Karthik Reddy|9555123456|7|suspended|unverified|06-13 14:20',
  'Green Bowl|Restaurant|Jubilee Hills|Megha Singh|9444123456|2|under_review|pending|06-12 11:30',
  'Fresh Fork Kitchen|Cloud Kitchen|Hitech City|Deepak Verma|9333123456|5|active|verified|06-11 08:15'
];

const TOTAL = 642;
const TARGET = {
  active: 586,
  inactive: 36,
  under_review: 12,
  suspended: 8,
  outlets: 1428,
  activeOutlets: 1312,
  warehouses: 24
};
const KIND_TOTALS: Record<BusinessKind, number> = {
  Restaurant: 320,
  'Cloud Kitchen': 190,
  'Food Court': 108,
  Warehouse: TARGET.warehouses
};
const MAX_OUTLETS = 25;

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');
const emailFor = (owner: string, name: string) =>
  `${owner.toLowerCase().replace(/\s+/g, '.')}@${slug(name)}.example.com`;

function fitOutlets(rows: HireAdminBusiness[], target: number, rand: () => number) {
  const free = rows.filter((r) => r.business_type !== 'Warehouse');
  let diff = target - rows.reduce((sum, r) => sum + r.outlets, 0);
  for (let guard = 0; diff !== 0 && guard < 200_000; guard++) {
    const row = pick(free, rand);
    if (diff > 0 && row.outlets < MAX_OUTLETS) {
      row.outlets += 1;
      diff -= 1;
    } else if (diff < 0 && row.outlets > 1) {
      row.outlets -= 1;
      diff += 1;
    }
  }
}

function verificationFor(status: BusinessStatus, rand: () => number): BusinessVerification {
  if (status === 'under_review') return pick(['pending', 'pending', 'unverified'], rand);
  if (status === 'suspended') return pick(['unverified', 'pending'], rand);
  if (status === 'inactive') return pick(['unverified', 'pending', 'verified'], rand);
  return pick(['verified', 'verified', 'verified', 'pending', 'unverified'], rand);
}

function buildBusinesses(): HireAdminBusiness[] {
  const rand = mulberry32(20240624);
  const fixed = FIXED_ROWS.map((line) => line.split('|'));
  const restCount = TOTAL - fixed.length;
  const fixedCount = <T extends string>(values: T[], value: T) =>
    values.filter((v) => v === value).length;
  const fixedKinds = fixed.map((f) => f[1] as BusinessKind);
  const fixedStatuses = fixed.map((f) => f[6] as BusinessStatus);

  const kinds = spread(
    Object.fromEntries(
      BUSINESS_KINDS.map((k) => [k, KIND_TOTALS[k] - fixedCount(fixedKinds, k)])
    ) as Record<BusinessKind, number>,
    rand
  );
  const statuses = spread(
    {
      active: TARGET.active - fixedCount(fixedStatuses, 'active'),
      inactive: TARGET.inactive - fixedCount(fixedStatuses, 'inactive'),
      under_review: TARGET.under_review - fixedCount(fixedStatuses, 'under_review'),
      suspended: TARGET.suspended - fixedCount(fixedStatuses, 'suspended')
    } satisfies Record<BusinessStatus, number>,
    rand
  );

  const from = istMs('05-26 00:00');
  const to = istMs('06-11 08:15');
  const joined = Array.from(
    { length: restCount },
    () => from + Math.floor((rand() * (to - from)) / MINUTE) * MINUTE
  ).sort((a, b) => a - b);

  const names = new Set(fixed.map((f) => f[0]!));
  const rest: HireAdminBusiness[] = [];
  for (let i = 0; i < restCount; i++) {
    const kind = kinds[i]!;
    const status = statuses[i]!;
    const city = kind === 'Warehouse' ? 'Hyderabad' : pick(CITY_WEIGHTS, rand);
    const area = kind === 'Warehouse' ? pick(WAREHOUSE_AREAS, rand) : pick(AREAS[city]!, rand);
    let name = `${pick(NAME_STARTS, rand)} ${pick(NAME_ENDS[kind], rand)}`;
    if (names.has(name)) name = `${name} ${area}`;
    for (let n = 2; names.has(name); n++) name = `${name} ${n}`;
    names.add(name);
    const owner = `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`;
    const phone = `${pick([6, 7, 8, 9], rand)}${pad(Math.floor(rand() * 1e9), 9)}`;
    rest.push({
      business_id: `BUS${pad(i + 1, 4)}`,
      business_name: name,
      business_type: kind,
      area,
      city,
      owner_name: owner,
      phone,
      email: emailFor(owner, name),
      outlets: kind === 'Warehouse' ? 1 : pick([1, 1, 2, 2, 2, 3, 3, 4], rand),
      status,
      verification: verificationFor(status, rand),
      joined_at: toIstIso(joined[i]!)
    });
  }

  const fixedRows = fixed.map((f, i): HireAdminBusiness => {
    const [name, type, area, owner, phone, outlets, status, verification, at] = f as [
      string,
      BusinessKind,
      string,
      string,
      string,
      string,
      BusinessStatus,
      BusinessVerification,
      string
    ];
    return {
      business_id: `BUS${pad(TOTAL - i, 4)}`,
      business_name: name,
      business_type: type,
      area,
      city: 'Hyderabad',
      owner_name: owner,
      phone,
      email: emailFor(owner, name),
      outlets: Number(outlets),
      status,
      verification,
      joined_at: toIstIso(istMs(at))
    };
  });

  const outletsOf = (rows: HireAdminBusiness[]) => rows.reduce((sum, r) => sum + r.outlets, 0);
  const isActive = (r: HireAdminBusiness) => r.status === 'active';
  const fixedActive = fixedRows.filter(isActive);
  const fixedOther = fixedRows.filter((r) => !isActive(r));
  fitOutlets(rest.filter(isActive), TARGET.activeOutlets - outletsOf(fixedActive), rand);
  fitOutlets(
    rest.filter((r) => !isActive(r)),
    TARGET.outlets - TARGET.activeOutlets - outletsOf(fixedOther),
    rand
  );

  return [...rest, ...fixedRows.reverse()];
}

let store: HireAdminBusiness[] | undefined;
const indexById = new Map<string, number>();

function reindex(rows: readonly HireAdminBusiness[]) {
  indexById.clear();
  rows.forEach((row, i) => indexById.set(row.business_id, i));
}

export function getBusinessesStore(): HireAdminBusiness[] {
  if (!store) {
    store = buildBusinesses();
    reindex(store);
  }
  return store;
}

export function findBusiness(businessId: string): HireAdminBusiness | undefined {
  const rows = getBusinessesStore();
  const i = indexById.get(businessId);
  return i === undefined ? undefined : rows[i];
}

export function updateBusiness(
  businessId: string,
  patch: Partial<BusinessInput> & { status?: BusinessStatus; verification?: BusinessVerification }
): HireAdminBusiness | undefined {
  const row = findBusiness(businessId);
  if (!row) return undefined;
  const next = { ...row, ...patch };
  getBusinessesStore()[indexById.get(businessId)!] = next;
  return next;
}

/** A new business: under review, pending verification, no outlets, joined now. */
export function createBusiness(input: BusinessInput): HireAdminBusiness {
  const rows = getBusinessesStore();
  const highest = rows.reduce((max, r) => Math.max(max, Number(r.business_id.slice(3))), 0);
  const row: HireAdminBusiness = {
    business_id: `BUS${pad(highest + 1, 4)}`,
    ...input,
    outlets: 0,
    status: 'under_review',
    verification: 'pending',
    joined_at: toIstIso(MOCK_NOW_MS)
  };
  rows.push(row);
  reindex(rows);
  return row;
}
