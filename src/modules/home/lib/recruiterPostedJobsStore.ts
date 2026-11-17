import { DEMO_RECRUITER_JOBS } from '../content/demoRecruiterJobs';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import type { RecruiterPostJobPayload } from '../schemas/recruiterPostJob';
import { recruiterScopedStorageKey } from './recruiterAccount';

const POSTED_JOBS_KEY_BASE = 'kx-hire-recruiter-posted-jobs-v1';

export interface RecruiterPostedJob {
  id: string;
  title: string;
  postedAt: string;
  payload: RecruiterPostJobPayload;
}

function storageKey(accountId: string) {
  return recruiterScopedStorageKey(POSTED_JOBS_KEY_BASE, accountId);
}

function readPosted(accountId: string): RecruiterPostedJob[] {
  try {
    const raw = localStorage.getItem(storageKey(accountId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecruiterPostedJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePosted(accountId: string, jobs: RecruiterPostedJob[]): boolean {
  try {
    localStorage.setItem(storageKey(accountId), JSON.stringify(jobs));
    return true;
  } catch {
    // private mode / quota
    return false;
  }
}

/** Demo seed jobs plus recruiter-created postings (prototype). */
export function listRecruiterJobs(accountId: string): { id: string; title: string }[] {
  const posted = readPosted(accountId).map((j) => ({ id: j.id, title: j.title }));
  const demo = DEMO_RECRUITER_JOBS.map((j) => ({ id: j.id, title: j.title }));
  return [...demo, ...posted];
}

export function countRecruiterJobsPosted(accountId: string): number {
  return listRecruiterJobs(accountId).length;
}

export type RecruiterJobStatus = 'Active' | 'Pending' | 'Closed';

export interface RecruiterJobWithStats {
  id: string;
  title: string;
  category?: string;
  openings?: number;
  applicantCount: number;
  postedAt?: string;
  status: RecruiterJobStatus;
}

/**
 * Demo seed jobs plus recruiter-created postings (prototype), each paired
 * with its applicant count grouped from the caller-supplied applications.
 */
export function listRecruiterJobsWithStats(
  accountId: string,
  applications: RecruiterInboundApplication[]
): RecruiterJobWithStats[] {
  const applicantCountFor = (jobId: string) =>
    applications.filter((row) => row.jobId === jobId).length;

  const demo: RecruiterJobWithStats[] = DEMO_RECRUITER_JOBS.map((job) => ({
    id: job.id,
    title: job.title,
    category: job.category,
    openings: job.openings,
    applicantCount: applicantCountFor(job.id),
    postedAt: job.postedAt,
    status: job.status
  }));

  const posted: RecruiterJobWithStats[] = readPosted(accountId).map((job) => ({
    id: job.id,
    title: job.title,
    category: job.payload.jobCategory,
    openings: job.payload.openings,
    applicantCount: applicantCountFor(job.id),
    postedAt: job.postedAt,
    // No job-status/lifecycle field exists anywhere in this prototype's data
    // model yet, so every job shows Active until that's introduced.
    status: 'Active'
  }));

  return [...demo, ...posted];
}

export interface RecruiterJobMeta {
  category?: string;
  employmentType?: string;
  workShift?: string;
}

/** Looks up category/employmentType/workShift for a job id, demo seed jobs first. */
export function findRecruiterJobMeta(
  accountId: string,
  jobId: string
): RecruiterJobMeta | undefined {
  const demoJob = DEMO_RECRUITER_JOBS.find((job) => job.id === jobId);
  if (demoJob) {
    return { category: demoJob.category };
  }

  const postedJob = readPosted(accountId).find((job) => job.id === jobId);
  if (postedJob) {
    return {
      category: postedJob.payload.jobCategory,
      employmentType: postedJob.payload.employmentType,
      workShift: postedJob.payload.workShift
    };
  }

  return undefined;
}

function savePostedJob(
  accountId: string,
  payload: RecruiterPostJobPayload
): { job: RecruiterPostedJob; saved: boolean } {
  const job: RecruiterPostedJob = {
    id: `rec-job-posted-${Date.now()}`,
    title: payload.jobTitle,
    postedAt: new Date().toISOString(),
    payload
  };
  const saved = writePosted(accountId, [...readPosted(accountId), job]);
  return { job, saved };
}

export function appendRecruiterPostedJob(
  accountId: string,
  payload: RecruiterPostJobPayload
): RecruiterPostedJob {
  return savePostedJob(accountId, payload).job;
}

/** Save a posting and report whether it actually reached localStorage. */
export function tryAppendRecruiterPostedJob(
  accountId: string,
  payload: RecruiterPostJobPayload
): boolean {
  return savePostedJob(accountId, payload).saved;
}
