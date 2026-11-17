/**
 * One ledger of applications per range, for the dev mock API only (there is no backend yet, so this stands
 * in for kitchenxhire-backend-go like every other admin screen of the mock). The Applications, Hired and
 * Rejected cards all read it, so they list one set of people: the Hired list is exactly the applications
 * whose status is hired and the Rejected list those whose status is rejected, with the same candidate, job
 * and outlet. Nothing is random and nothing reads the clock.
 *
 * Counts are the Overview's. Hired and rejected are its KPI numbers; the other statuses split the two other
 * slices of its donut, shortlisted into shortlisted and interview scheduled, under review into pending
 * review and reviewed, so the statuses add up to the applications card and each one is an exact count.
 *
 * Times: the hires (and the rejections) are spread evenly over the window, newest first, and each
 * application came in before its decision by a lag around the Avg. Time to Hire (rejections after half of
 * it), never from before the window began. So hired_at is never before applied_at and both stay in the
 * window. The lag asked for is raised until the hires of the 30-day and 90-day windows wait the card's
 * number on average; the 7-day window is too short to hold a 6.5-day wait, so its hires wait as long as
 * it lets them (about 2.9 days) and the rows cannot show that card's number.
 */
import { toIstIso, type HireApplicationStatus } from './applicationsMockData.ts';
import {
  DAY,
  MINUTE,
  REJECTION_REASONS,
  bucketOf,
  categoryPicker,
  evenly,
  getVocabulary,
  jobFields,
  pad,
  perRange,
  quasi,
  ranked,
  scatter,
  toMinute,
  windowOf,
  type Candidate,
  type JobFields,
  type ReportsApplicationRow,
  type ReportsHiredRow,
  type ReportsRejectedRow,
  type TimeWindow
} from './reportsDrilldownMockData.ts';
import { reportsOverview, type ReportRange } from './reportsMockData.ts';

/** The newest application of the Applications screen. Ids fall from here; a range with more rows starts higher, so none goes below 1. */
const NEWEST_APPLICATION = 10892;
/** A rejection comes after about half the time a hire takes. */
const REJECTION_LAG_SHARE = 0.5;
/** No application is older, when it is decided, than this share of the way from the window start to that moment. */
const MAX_LAG_SHARE = 0.85;
/** Passes to settle the lag to ask for, and the most it may be raised to, as a multiple of the average time to hire. */
const LAG_PASSES = 4;
const MAX_ASK_SHARE = 2;
/** Of the shortlisted slice, the share with an interview booked; of the under review slice, the share nobody has opened yet. */
const INTERVIEW_SHARE = 0.25;
const UNOPENED_SHARE = 0.45;
/** The weights of the five rejection reasons, then of none recorded: 6 percent. */
const REASON_WEIGHTS = [30, 26, 18, 12, 8, 6];
const REASONS: readonly (string | null)[] = [...REJECTION_REASONS, null];
/** The statuses of the applications that are neither hired nor rejected, in the order of their weights. */
const OPEN_STATUSES: readonly HireApplicationStatus[] = [
  'shortlisted',
  'interview_scheduled',
  'pending_review',
  'reviewed'
];

interface Entry {
  id: string;
  who: Candidate;
  job: JobFields;
  appliedMs: number;
  status: HireApplicationStatus;
}

/** An application that was hired or rejected, and when. */
interface Decision extends Entry {
  decidedMs: number;
  reason: string | null;
}

interface Ledger {
  applications: ReportsApplicationRow[];
  hired: ReportsHiredRow[];
  rejected: ReportsRejectedRow[];
}

/** How long before `decidedMs` the application came in: 0.3 to 1.7 times `meanDays`, never reaching back past the window start. */
function lagMs(record: number, meanDays: number, decidedMs: number, win: TimeWindow): number {
  const wanted = toMinute(meanDays * DAY * (0.3 + 1.4 * quasi(record, 2)));
  const room = Math.floor((MAX_LAG_SHARE * (decidedMs - win.start)) / MINUTE) * MINUTE;
  return Math.min(wanted, room);
}

/**
 * The mean lag to ask for so that, once the window start has cut the long lags short, the hires of
 * `decidedAt` wait `days` on average. A few passes settle it. A window shorter than the average (7 days
 * against 6.5) cannot get there, so the ask is capped and the hires wait as long as the window lets them.
 */
function askedLagDays(days: number, decidedAt: readonly number[], win: TimeWindow): number {
  let asked = days;
  for (let pass = 0; pass < LAG_PASSES; pass++) {
    const total = decidedAt.reduce((sum, at, k) => sum + lagMs(k, asked, at, win), 0);
    asked = Math.min(MAX_ASK_SHARE * days, (asked * days) / (total / decidedAt.length / DAY));
  }
  return asked;
}

function buildLedger(range: ReportRange): Ledger {
  const { kpis, application_status: donut } = reportsOverview(range);
  const win = windowOf(range);
  const categoryOf = categoryPicker(range);
  const { candidateAt } = getVocabulary();
  const days = kpis.avg_time_to_hire_days.value;
  const sliceOf = (status: string) => donut.find((slice) => slice.status === status)?.count ?? 0;

  /** The hired or the rejected applications, with the instants of their decisions, newest first. */
  const decided = (
    status: 'hired' | 'rejected',
    decidedAt: readonly number[],
    first: number,
    meanDays: number
  ): Decision[] =>
    decidedAt.map((decidedMs, k) => {
      const record = first + k;
      return {
        id: '',
        who: candidateAt(record),
        job: jobFields(record, categoryOf(quasi(record, 0))),
        appliedMs: decidedMs - lagMs(record, meanDays, decidedMs, win),
        status,
        decidedMs,
        reason: status === 'rejected' ? REASONS[bucketOf(quasi(record, 1), REASON_WEIGHTS)] : null
      };
    });

  const hiredAt = evenly(kpis.hired.value, win);
  const hired = decided('hired', hiredAt, 0, askedLagDays(days, hiredAt, win));
  const rejectedAt = evenly(kpis.rejected.value, win);
  const rejected = decided('rejected', rejectedAt, hired.length, days * REJECTION_LAG_SHARE);

  const shortlisted = sliceOf('shortlisted');
  const underReview = sliceOf('under_review');
  const interviews = Math.round(shortlisted * INTERVIEW_SHARE);
  const unopened = Math.round(underReview * UNOPENED_SHARE);
  const weights = [shortlisted - interviews, interviews, unopened, underReview - unopened];
  const openCount = shortlisted + underReview;
  const ranks = scatter(openCount);
  const firstOpen = hired.length + rejected.length;
  const open: Entry[] = evenly(openCount, win).map((appliedMs, j) => ({
    id: '',
    who: candidateAt(firstOpen + j),
    job: jobFields(firstOpen + j, categoryOf(quasi(firstOpen + j, 0))),
    appliedMs,
    status: OPEN_STATUSES[bucketOf(ranked(ranks[j], openCount), weights)]
  }));

  // Newest application first; the ids fall with the age, as they do on the Applications screen.
  const all: Entry[] = [...hired, ...rejected, ...open].sort((a, b) => b.appliedMs - a.appliedMs);
  const newest = Math.max(NEWEST_APPLICATION, all.length);
  all.forEach((entry, i) => {
    entry.id = `APP${pad(newest - i)}`;
  });

  return {
    applications: all.map((entry) => ({
      application_id: entry.id,
      candidate_name: entry.who.name,
      job_title: entry.job.title,
      outlet_name: entry.job.outlet,
      applied_at: toIstIso(entry.appliedMs),
      status: entry.status
    })),
    hired: hired.map((entry) => ({
      application_id: entry.id,
      candidate_id: entry.who.id,
      candidate_name: entry.who.name,
      job_title: entry.job.title,
      recruiter_name: entry.job.recruiter,
      outlet_name: entry.job.outlet,
      hired_at: toIstIso(entry.decidedMs)
    })),
    rejected: rejected.map((entry) => ({
      application_id: entry.id,
      candidate_name: entry.who.name,
      job_title: entry.job.title,
      outlet_name: entry.job.outlet,
      rejected_at: toIstIso(entry.decidedMs),
      rejection_reason: entry.reason
    }))
  };
}

const ledgerOf = perRange(buildLedger);

/** Every application received in the window, newest first. */
export const reportsApplicationRows = (range: ReportRange) => ledgerOf(range).applications;

/** The applications hired in the window, newest hire first. */
export const reportsHiredRows = (range: ReportRange) => ledgerOf(range).hired;

/** The applications rejected in the window, newest rejection first. */
export const reportsRejectedRows = (range: ReportRange) => ledgerOf(range).rejected;
