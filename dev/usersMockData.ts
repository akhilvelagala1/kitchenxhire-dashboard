/**
 * In-memory mock staff user store for the dev mock API (/hire/admin/users/*).
 * Not used in production builds.
 *
 * The world is fixed at 10 Nov 2026, India time (+05:30), so the screen matches the reference picture on
 * any day. Nothing here reads the clock or Math.random(): a seeded generator makes every start identical.
 * The list, the summary and the export all read this one store, so they always agree. The trend chart is
 * the one exception: it is independent analytics (see usersAnalytics.ts).
 * The types match src/modules/hire-admin/schemas/adminUser.ts field for field. The role names are
 * demo labels from the reference picture, not a role catalogue.
 */

export const USER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  suspended: 'Suspended'
} as const;

export type UserStatus = keyof typeof USER_STATUS_LABELS;

export const USER_ROLES = [
  'Super Admin',
  'HR Manager',
  'HR Executive',
  'Support',
  'Analyst'
] as const;
type UserRole = (typeof USER_ROLES)[number];

export const USER_DEPARTMENTS = [
  'Platform Ops',
  'Hiring',
  'Customer Support',
  'Operations'
] as const;
type UserDepartment = (typeof USER_DEPARTMENTS)[number];

export const USER_ACCESS_SCOPES = [
  'All modules',
  'Jobs & Applications',
  'Applications only',
  'Read-only',
  'Reports only'
] as const;
type UserAccessScope = (typeof USER_ACCESS_SCOPES)[number];

export interface HireAdminUser {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
  access_scope: UserAccessScope;
  last_login_at: string | null;
  status: UserStatus;
  created_at: string;
}

/** What the add and edit dialogs send. */
export interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
  access_scope: UserAccessScope;
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const IST_OFFSET_MS = 330 * MINUTE;

/** The mock "now": the morning of 10 Nov 2026, India time. */
export const MOCK_NOW_MS = Date.parse('2026-11-10T11:00:00+05:30');

/** An instant as an ISO string in India time, for example 2026-11-10T09:42:00+05:30. */
export function toIstIso(ms: number): string {
  return `${new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 19)}+05:30`;
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');
const istMs = (monthDayTime: string) => Date.parse(`2026-${monthDayTime}:00+05:30`);

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

const FIRST_NAMES = (
  'Aarav,Aditya,Akhil,Anjali,Bhavya,Charan,Deepika,Dinesh,Divya,Farhan,Gautam,Harini,Imran,Isha,' +
  'Jayanth,Kavya,Lakshmi,Manoj,Meena,Mohit,Nandini,Naveen,Nikhil,Pavan,Pooja,Pranav,Rajesh,Ravi,' +
  'Rekha,Rohan,Sahana,Sandeep,Sanjana,Shreya,Sneha,Srinivas,Sunil,Swathi,Tarun,Uma,Varun,Vijay,' +
  'Vinay,Yash,Zoya'
).split(',');
const LAST_NAMES = (
  'Reddy,Naidu,Rao,Sharma,Verma,Singh,Kumar,Patel,Gupta,Mishra,Das,Jain,Nair,Iyer,Menon,Khan,' +
  'Ahmed,Shah,Joshi,Desai,Pillai,Babu,Murthy,Yadav,Chowdary,Goud,Prasad,Raju,Varma,Siddiqui,' +
  'Agarwal,Bhatt,Kulkarni,Shetty,Hegde,Gowda,Mehta,Chopra'
).split(',');

/** Each demo role comes with a department and the access it is given. */
const ROLE_DEFAULTS: Record<UserRole, { department: UserDepartment; scope: UserAccessScope }> = {
  'Super Admin': { department: 'Platform Ops', scope: 'All modules' },
  'HR Manager': { department: 'Hiring', scope: 'Jobs & Applications' },
  'HR Executive': { department: 'Hiring', scope: 'Applications only' },
  Support: { department: 'Customer Support', scope: 'Read-only' },
  Analyst: { department: 'Operations', scope: 'Reports only' }
};

const TOTAL = 128;
const COUNTS: Record<UserStatus, number> = {
  active: 112,
  inactive: 8,
  pending: 5,
  suspended: 3
};
const ROLE_COUNTS: Record<UserRole, number> = {
  'Super Admin': 8,
  'HR Manager': 23,
  'HR Executive': 39,
  Support: 31,
  Analyst: 27
};

/** The five first rows, read off the reference picture: name, role, status, last login (null: invite sent). */
type Fixed = [string, UserRole, UserStatus, string | null];

const FIXED: Fixed[] = [
  ['Ananya Rao', 'Super Admin', 'active', '11-10 09:42'],
  ['Rahul Menon', 'HR Manager', 'active', '11-10 08:15'],
  ['Priya Sharma', 'HR Executive', 'active', '11-09 17:30'],
  ['Kiran Das', 'Support', 'inactive', '11-08 14:10'],
  ['Meera Nair', 'Analyst', 'pending', null]
];

function tally<T extends string>(rows: readonly T[]): Map<T, number> {
  const out = new Map<T, number>();
  rows.forEach((row) => out.set(row, (out.get(row) ?? 0) + 1));
  return out;
}

/** `kind` repeated `count` times for every entry, shuffled. */
function spread<T extends string>(
  counts: Record<T, number>,
  already: readonly T[],
  rand: () => number
): T[] {
  const used = tally(already);
  const list = (Object.keys(counts) as T[]).flatMap((kind) =>
    Array<T>(counts[kind] - (used.get(kind) ?? 0)).fill(kind)
  );
  return shuffle(list, rand);
}

function buildUsers(): HireAdminUser[] {
  const rand = mulberry32(20261110);
  const statuses = spread(
    COUNTS,
    FIXED.map((f) => f[2]),
    rand
  );
  const roles = spread(
    ROLE_COUNTS,
    FIXED.map((f) => f[1]),
    rand
  );
  const emails = new Set<string>();

  const toRow = (
    index: number,
    name: string,
    role: UserRole,
    status: UserStatus,
    lastLoginMs: number | null
  ): HireAdminUser => {
    // The picture shows the five first rows with just a first name in the address.
    const base = (
      index < FIXED.length ? name.split(' ')[0]! : name.replace(' ', '.')
    ).toLowerCase();
    const email = emails.has(base) ? `${base}${index + 1}` : base;
    emails.add(email);
    const defaults = ROLE_DEFAULTS[role];
    const createdMs =
      lastLoginMs === null
        ? MOCK_NOW_MS - (1 + Math.floor(rand() * 13)) * DAY
        : lastLoginMs - (1 + Math.floor(rand() * 300)) * DAY;
    return {
      user_id: `UST${1001 + index}`,
      name,
      email: `${email}@kitchenx.in`,
      role,
      department: defaults.department,
      access_scope: defaults.scope,
      last_login_at: lastLoginMs === null ? null : toIstIso(lastLoginMs),
      status,
      created_at: toIstIso(createdMs)
    };
  };

  const rows = FIXED.map((f, i) => toRow(i, f[0], f[1], f[2], f[3] === null ? null : istMs(f[3])));
  for (let i = rows.length; i < TOTAL; i++) {
    const k = i - FIXED.length;
    const status = statuses[k]!;
    // Everyone was seen (or invited) inside the last 29 days, so the picture's default
    // "Last 30 Days" filter lists all 128.
    const lastLoginMs =
      status === 'pending' ? null : MOCK_NOW_MS - Math.floor(rand() * 29 * 24 * 60) * MINUTE;
    rows.push(
      toRow(
        i,
        `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`,
        roles[k]!,
        status,
        lastLoginMs
      )
    );
  }
  return rows;
}

let store: HireAdminUser[] | undefined;
const indexById = new Map<string, number>();

function reindex(rows: readonly HireAdminUser[]) {
  indexById.clear();
  rows.forEach((row, i) => indexById.set(row.user_id, i));
}

export function getUsersStore(): HireAdminUser[] {
  if (!store) {
    store = buildUsers();
    reindex(store);
  }
  return store;
}

export function findUser(userId: string): HireAdminUser | undefined {
  const rows = getUsersStore();
  const i = indexById.get(userId);
  return i === undefined ? undefined : rows[i];
}

export function updateUser(
  userId: string,
  patch: Partial<UserInput> & { status?: UserStatus }
): HireAdminUser | undefined {
  const row = findUser(userId);
  if (!row) return undefined;
  const next = { ...row, ...patch };
  getUsersStore()[indexById.get(userId)!] = next;
  return next;
}

/** A new user: pending (invite sent), created now (the mock clock), the next id after the highest one. */
export function createUser(input: UserInput): HireAdminUser {
  const rows = getUsersStore();
  const highest = rows.reduce((max, r) => Math.max(max, Number(r.user_id.slice(3))), 0);
  const row: HireAdminUser = {
    user_id: `UST${pad(highest + 1, 4)}`,
    ...input,
    last_login_at: null,
    status: 'pending',
    created_at: toIstIso(MOCK_NOW_MS)
  };
  rows.push(row);
  reindex(rows);
  return row;
}
