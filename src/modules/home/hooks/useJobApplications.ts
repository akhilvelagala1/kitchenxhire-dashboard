import { useCallback, useEffect, useState } from 'react';
import { DEMO_JOB_APPLICATIONS } from '../content/demoJobApplications';
import type { FindJobListing } from '../schemas/findJobs';
import { applicationFromListing, type JobApplication } from '../schemas/jobApplication';

const STORAGE_KEY = 'kx-hire-job-applications';
/** Bump when prototype seed count/content must replace an older demo cache. */
const SEED_FLAG_KEY = 'kx-hire-job-applications-seeded-v13';

function readApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isJobApplication);
  } catch {
    return [];
  }
}

function isJobApplication(value: unknown): value is JobApplication {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as JobApplication;
  return (
    typeof row.id === 'string' &&
    typeof row.jobId === 'string' &&
    typeof row.title === 'string' &&
    typeof row.status === 'string'
  );
}

function writeApplications(apps: JobApplication[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // Vitest/jsdom may omit localStorage in some Node builds.
  }
}

function ensureSeedData(): JobApplication[] {
  try {
    if (localStorage.getItem(SEED_FLAG_KEY) === '1') {
      const existing = readApplications();
      if (existing.length > 0) return existing;
    }
    localStorage.setItem(SEED_FLAG_KEY, '1');
  } catch {
    const existing = readApplications();
    return existing.length > 0 ? existing : DEMO_JOB_APPLICATIONS;
  }
  writeApplications(DEMO_JOB_APPLICATIONS);
  return DEMO_JOB_APPLICATIONS;
}

export function useJobApplications() {
  const [applications, setApplications] = useState<JobApplication[]>(() => ensureSeedData());

  useEffect(() => {
    writeApplications(applications);
  }, [applications]);

  const applyFromListing = useCallback((job: FindJobListing) => {
    setApplications((current) => {
      const withoutJob = current.filter((app) => app.jobId !== job.id);
      return [applicationFromListing(job), ...withoutJob];
    });
  }, []);

  const hasApplied = useCallback(
    (jobId: string) => applications.some((app) => app.jobId === jobId),
    [applications]
  );

  return { applications, applyFromListing, hasApplied };
}
