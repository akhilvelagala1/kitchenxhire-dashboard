/**
 * In-memory mock application store for the dev mock API (/hire/admin/applications/*).
 * Not used in production builds.
 *
 * The world is fixed at 24 Jun 2026, India time (+05:30), so the screen matches the reference picture on
 * any day. Nothing here reads the clock or Math.random(): a seeded generator makes every start identical.
 * The list, the summary and the export all read this one store, so they always agree. The trend chart is
 * the one exception: it is independent analytics (see applicationsAnalytics.ts).
 * The types match src/modules/hire-admin/schemas/adminApplication.ts field for field.
 */

import { getJobsStore } from './jobsMockData.ts';

export const APPLICATION_STATUS_LABELS = {
  pending_review: 'Pending Review',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  hired: 'Hired',
  rejected: 'Rejected'
} as const;

export type HireApplicationStatus = keyof typeof APPLICATION_STATUS_LABELS;

export const HIRE_APPLICATION_STATUSES = Object.keys(
  APPLICATION_STATUS_LABELS
) as HireApplicationStatus[];

/** A tab counts every application that reached that stage; `rejected` stands apart, `all` is everyone. */
export const TAB_STATUSES = {
  all: HIRE_APPLICATION_STATUSES,
  reviewed: ['reviewed', 'shortlisted', 'interview_scheduled', 'hired'],
  shortlisted: ['shortlisted', 'interview_scheduled', 'hired'],
  interview_scheduled: ['interview_scheduled', 'hired'],
  hired: ['hired'],
  rejected: ['rejected']
} satisfies Record<string, readonly HireApplicationStatus[]>;

export type ApplicationTab = keyof typeof TAB_STATUSES;

export const APPLICATION_TABS = Object.keys(TAB_STATUSES) as ApplicationTab[];

type ApplicationJobType = 'Full-time' | 'Part-time';

export interface HireAdminApplication {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_location: string;
  job_id: string;
  job_title: string;
  job_type: ApplicationJobType;
  recruiter_id: string;
  recruiter_name: string;
  outlet_name: string;
  location: string;
  applied_at: string;
  status: HireApplicationStatus;
  interview_at: string | null;
  resume_file_name: string | null;
}

/** A job the applications point at, with the recruiter and outlet that posted it. */
interface ApplicationJob {
  job_id: string;
  title: string;
  job_type: ApplicationJobType;
  recruiter_id: string;
  recruiter_name: string;
  outlet_name: string;
  location: string;
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const IST_OFFSET_MS = 330 * MINUTE;

/** The mock "now": the evening of 24 Jun 2026, India time. Recorded audit events start after it. */
export const MOCK_NOW_MS = Date.parse('2026-06-24T18:00:00+05:30');

/** An instant as an ISO string in India time, for example 2026-06-24T10:24:00+05:30. */
export function toIstIso(ms: number): string {
  return `${new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 19)}+05:30`;
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');
const list = (csv: string) => csv.split(',');
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

/** City and state; Hyderabad comes up most often. */
const PLACES = list(
  'Hyderabad TS,Hyderabad TS,Hyderabad TS,Hyderabad TS,Hyderabad TS,Secunderabad TS,Secunderabad TS,Warangal TS,Vijayawada AP,Visakhapatnam AP,Bengaluru KA'
);
const FIRST_NAMES = list(
  'Aarav,Aditya,Akhil,Ananya,Anjali,Arjun,Bhavya,Charan,Deepika,Dinesh,Divya,Farhan,Gautam,Harini,Imran,Isha,Jayanth,Kavya,Kiran,Lakshmi,Manoj,Meena,Mohit,Nandini,Naveen,Nikhil,Pavan,Pooja,Pranav,Rajesh,Ramesh,Ravi,Rekha,Rohan,Sahana,Sandeep,Sanjana,Shreya,Sneha,Srinivas,Sunil,Swathi,Tarun,Uma,Varun,Vijay,Vinay,Yash,Zoya'
);
const LAST_NAMES = list(
  'Reddy,Naidu,Rao,Sharma,Verma,Singh,Kumar,Patel,Gupta,Mishra,Das,Jain,Nair,Iyer,Menon,Khan,Ahmed,Shah,Joshi,Desai,Pillai,Babu,Murthy,Yadav,Chowdary,Goud,Prasad,Raju,Varma,Siddiqui,Agarwal,Bhatt,Kulkarni,Shetty,Hegde,Gowda,Mehta,Chopra'
);
/** The five recruiters on the reference rows (REC001 to REC005). Every other recruiter gets a fixed made-up name. */
const REFERENCE_RECRUITERS = list('Rahul Verma,Anita Rao,Vikram Singh,Neha Patel,Arjun Mehta');
const PART_TIME_TITLES = list('Cleaning & Stewarding,Dishwasher,Barista,Waiter / Server');

function recruiterName(recruiterId: string): string {
  const n = Number(recruiterId.replace(/\D/g, ''));
  return (
    REFERENCE_RECRUITERS[n - 1] ??
    `${FIRST_NAMES[(n * 7) % FIRST_NAMES.length]!} ${LAST_NAMES[(n * 11) % LAST_NAMES.length]!}`
  );
}

let jobPool: readonly ApplicationJob[] | undefined;

/**
 * The jobs of the Jobs dashboard, so a job has the same title, outlet and city on both screens. The
 * first five are the jobs on the reference rows.
 */
export function getApplicationJobs(): readonly ApplicationJob[] {
  jobPool ??= getJobsStore().map((job) => ({
    job_id: job.job_id,
    title: job.title,
    job_type: PART_TIME_TITLES.includes(job.title) ? 'Part-time' : 'Full-time',
    recruiter_id: job.recruiter_id,
    recruiter_name: job.recruiter_name || recruiterName(job.recruiter_id),
    outlet_name: job.business_name,
    location: job.location
  }));
  return jobPool;
}

/**
 * One entry per application after the five reference rows: a job appears as often as the Jobs
 * dashboard counts applications for it, in a fixed random order. If the Jobs mock has changed so the
 * counts no longer add up to the rows left, the rest is spread over the jobs.
 */
function jobSlots(counts: number[], rand: () => number): number[] {
  const slots = counts.flatMap((count, i) =>
    Array<number>(Math.max(0, count - (i < FIXED_ROWS ? 1 : 0))).fill(i)
  );
  const need = TOTAL - FIXED_ROWS;
  while (slots.length < need) slots.push(Math.floor(rand() * counts.length));
  return shuffle(slots, rand).slice(0, need);
}

type Candidate = Pick<
  HireAdminApplication,
  'candidate_id' | 'candidate_name' | 'candidate_email' | 'candidate_phone' | 'candidate_location'
>;

const CANDIDATE_POOL = 6500;

/** One candidate per number, always the same person, so a candidate who applies twice looks the same. */
function candidate(n: number): Candidate {
  const rand = mulberry32(n * 7919 + 13);
  const first = pick(FIRST_NAMES, rand);
  const last = pick(LAST_NAMES, rand);
  const phone = `${6 + Math.floor(rand() * 4)}${pad(Math.floor(rand() * 1e9), 9)}`;
  return {
    candidate_id: `CAN${pad(n, 5)}`,
    candidate_name: `${first} ${last}`,
    candidate_email: `${first}.${last}${n}@example.com`.toLowerCase(),
    candidate_phone: phone,
    candidate_location: pick(PLACES, rand).replace(' ', ', ')
  };
}

/** The five newest rows, read off the reference picture: name, phone, place, status, applied, interview. */
type Fixed = [string, string, string, HireApplicationStatus, string, string | null];

const FIXED: Fixed[] = [
  ['Rahul Kumar', '9848012345', 'Hyderabad, TS', 'reviewed', '06-24 10:24', null],
  ['Priya Sharma', '9701123456', 'Hyderabad, TS', 'shortlisted', '06-24 09:18', null],
  [
    'Amit Mishra',
    '9966778899',
    'Secunderabad, TS',
    'interview_scheduled',
    '06-23 17:42',
    '06-26 11:00'
  ],
  ['Suresh Das', '8099123456', 'Hyderabad, TS', 'hired', '06-22 11:03', '06-23 14:30'],
  ['Neha Jain', '7416543210', 'Hyderabad, TS', 'pending_review', '06-20 16:22', null]
];

/** Current-status quotas over all rows, in HIRE_APPLICATION_STATUSES order. They sum to TOTAL. */
const QUOTAS = [1674, 4682, 818, 214, 428, 856];
const TOTAL = 8672;
const FIXED_ROWS = FIXED.length;
const FIRST_NUMBER = 10892;

const wantsInterview = (status: HireApplicationStatus) =>
  status === 'interview_scheduled' || status === 'hired';

function makeRow(
  index: number,
  who: Candidate,
  job: ApplicationJob,
  status: HireApplicationStatus,
  appliedMs: number,
  interviewMs: number | null,
  hasResume: boolean
): HireAdminApplication {
  return {
    application_id: `APP${pad(FIRST_NUMBER - index, 5)}`,
    ...who,
    job_id: job.job_id,
    job_title: job.title,
    job_type: job.job_type,
    recruiter_id: job.recruiter_id,
    recruiter_name: job.recruiter_name,
    outlet_name: job.outlet_name,
    location: job.location,
    applied_at: toIstIso(appliedMs),
    status,
    interview_at: interviewMs === null ? null : toIstIso(interviewMs),
    resume_file_name: hasResume ? `${who.candidate_name.replaceAll(' ', '_')}_Resume.pdf` : null
  };
}

/** 10:00 to 16:30 India time, one to six days after the application. */
function interviewAfter(appliedMs: number, rand: () => number): number {
  const dayStart = Math.floor((appliedMs + IST_OFFSET_MS) / DAY) * DAY - IST_OFFSET_MS;
  const days = 1 + Math.floor(rand() * 6);
  const hours = 10 + Math.floor(rand() * 7);
  return dayStart + days * DAY + hours * 60 * MINUTE + (rand() < 0.5 ? 0 : 30 * MINUTE);
}

export function buildApplications(): HireAdminApplication[] {
  const rand = mulberry32(20260624);
  const jobs = getApplicationJobs();
  const slots = jobSlots(
    getJobsStore().map((job) => job.applications_count),
    rand
  );
  const statuses = shuffle(
    HIRE_APPLICATION_STATUSES.flatMap((status, i) => {
      const left = QUOTAS[i]! - FIXED.filter((f) => f[3] === status).length;
      return Array<HireApplicationStatus>(left).fill(status);
    }),
    rand
  );
  const rows = FIXED.map(([name, phone, place, status, applied, interview], i) => {
    const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
    const who = { candidate_id: `CAN${pad(CANDIDATE_POOL + 1 + i, 5)}`, candidate_name: name };
    const rest = { candidate_email: email, candidate_phone: phone, candidate_location: place };
    const interviewMs = interview ? istMs(interview) : null;
    return makeRow(i, { ...who, ...rest }, jobs[i]!, status, istMs(applied), interviewMs, true);
  });

  let appliedMs = istMs(FIXED[FIXED.length - 1]![4]);
  for (let i = rows.length; i < TOTAL; i++) {
    appliedMs -= (25 + Math.floor(rand() * 86)) * MINUTE;
    const status = statuses[i - FIXED.length]!;
    const job = jobs[slots[i - FIXED.length]!]!;
    const who = candidate(1 + Math.floor(rand() * CANDIDATE_POOL));
    const interviewMs = wantsInterview(status) ? interviewAfter(appliedMs, rand) : null;
    rows.push(makeRow(i, who, job, status, appliedMs, interviewMs, rand() < 0.85));
  }
  return rows;
}

let store: HireAdminApplication[] | undefined;
const indexById = new Map<string, number>();

export function getApplicationsStore(): HireAdminApplication[] {
  if (!store) {
    store = buildApplications();
    store.forEach((row, i) => indexById.set(row.application_id, i));
  }
  return store;
}

export function findApplication(applicationId: string): HireAdminApplication | undefined {
  const rows = getApplicationsStore();
  const i = indexById.get(applicationId);
  return i === undefined ? undefined : rows[i];
}

/** Leaving Interview Scheduled or Hired clears the interview time; entering them keeps what is set. */
export function updateApplication(
  applicationId: string,
  patch: { status?: HireApplicationStatus; interview_at?: string }
): HireAdminApplication | undefined {
  const row = findApplication(applicationId);
  if (!row) return undefined;
  const status = patch.status ?? row.status;
  const next = {
    ...row,
    status,
    interview_at: wantsInterview(status) ? (patch.interview_at ?? row.interview_at) : null
  };
  getApplicationsStore()[indexById.get(applicationId)!] = next;
  return next;
}
