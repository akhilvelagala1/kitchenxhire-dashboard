import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_RECRUITER_JOBS } from '../content/demoRecruiterJobs';
import type { RecruiterInboundApplication } from '../schemas/recruiterApplication';
import type { RecruiterPostJobPayload } from '../schemas/recruiterPostJob';
import {
  appendRecruiterPostedJob,
  findRecruiterJobMeta,
  listRecruiterJobsWithStats,
  type RecruiterJobStatus,
  type RecruiterJobWithStats
} from './recruiterPostedJobsStore';

const accountId = '919876543210';

function sampleApplication(jobId: string): RecruiterInboundApplication {
  return {
    id: `app-${jobId}`,
    candidateName: 'Demo Candidate',
    initials: 'DC',
    avatarHue: 120,
    jobId,
    jobTitle: 'Demo Job',
    appliedAt: '2026-01-01T00:00:00.000Z',
    status: 'new'
  };
}

const samplePayload: RecruiterPostJobPayload = {
  jobTitle: 'Line Cook',
  jobCategory: 'Kitchen',
  openings: 3,
  employmentType: 'full-time',
  workShift: 'day',
  monthlySalary: 15000,
  preferredGender: 'any',
  ageMin: 18,
  ageMax: 45,
  qualification: 'any',
  experience: '1-2 years',
  jobDescription:
    'Prepare and cook dishes to order, maintain kitchen hygiene and assist the head chef.',
  workLocation: 'Hyderabad'
};

describe('listRecruiterJobsWithStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns all demo seed jobs with their seeded category/openings/postedAt/status', () => {
    const applications: RecruiterInboundApplication[] = [
      sampleApplication(DEMO_RECRUITER_JOBS[0].id)
    ];
    const result = listRecruiterJobsWithStats(accountId, applications);

    expect(result).toHaveLength(DEMO_RECRUITER_JOBS.length);

    DEMO_RECRUITER_JOBS.forEach((demoJob) => {
      const row = result.find((job) => job.id === demoJob.id);
      expect(row).toBeDefined();
      expect(row?.category).toBe(demoJob.category);
      expect(row?.openings).toBe(demoJob.openings);
      expect(row?.postedAt).toBe(demoJob.postedAt);
      expect(row?.status).toBe(demoJob.status);
    });
  });

  it('gives specific demo jobs their expected mock category/openings/status (spot check)', () => {
    const result = listRecruiterJobsWithStats(accountId, []);

    const waiterJob = result.find((job) => job.id === 'rec-job-3');
    expect(waiterJob?.category).toBe('Service');
    expect(waiterJob?.openings).toBe(3);
    expect(waiterJob?.status).toBe('Pending');

    const stewardingJob = result.find((job) => job.id === 'rec-job-5');
    expect(stewardingJob?.status).toBe('Closed');

    const cashierJob = result.find((job) => job.id === 'rec-job-11');
    expect(cashierJob?.status).toBe('Closed');
  });

  it('computes applicantCount by counting applications matching each job id', () => {
    const targetJob = DEMO_RECRUITER_JOBS[1];
    const applications: RecruiterInboundApplication[] = [
      sampleApplication(targetJob.id),
      sampleApplication(targetJob.id),
      sampleApplication(DEMO_RECRUITER_JOBS[2].id)
    ];

    const result = listRecruiterJobsWithStats(accountId, applications);

    const targetRow = result.find((job) => job.id === targetJob.id);
    expect(targetRow?.applicantCount).toBe(2);

    const otherRow = result.find((job) => job.id === DEMO_RECRUITER_JOBS[2].id);
    expect(otherRow?.applicantCount).toBe(1);
  });

  it('gives a job with zero matching applications an applicantCount of 0, not undefined', () => {
    const result = listRecruiterJobsWithStats(accountId, []);

    result.forEach((job) => {
      expect(job.applicantCount).toBe(0);
    });
  });

  it('includes a newly posted job with its payload-derived fields and an Active status', () => {
    const posted = appendRecruiterPostedJob(accountId, samplePayload);

    const result = listRecruiterJobsWithStats(accountId, []);
    const postedRow = result.find((job) => job.id === posted.id);

    expect(postedRow).toBeDefined();
    expect(postedRow?.category).toBe(samplePayload.jobCategory);
    expect(postedRow?.openings).toBe(samplePayload.openings);
    expect(postedRow?.postedAt).toBeDefined();
    expect(postedRow?.status).toBe('Active');
  });
});

describe('findRecruiterJobMeta', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns category only for a demo seed job, since demo jobs have no employmentType/workShift', () => {
    const meta = findRecruiterJobMeta(accountId, DEMO_RECRUITER_JOBS[0].id);
    expect(meta).toEqual({ category: DEMO_RECRUITER_JOBS[0].category });
  });

  it('returns category, employmentType, and workShift for a recruiter-posted job', () => {
    const posted = appendRecruiterPostedJob(accountId, samplePayload);

    const meta = findRecruiterJobMeta(accountId, posted.id);

    expect(meta).toEqual({
      category: samplePayload.jobCategory,
      employmentType: samplePayload.employmentType,
      workShift: samplePayload.workShift
    });
  });

  it('returns undefined when the job id matches neither demo nor posted jobs', () => {
    const meta = findRecruiterJobMeta(accountId, 'rec-job-does-not-exist');
    expect(meta).toBeUndefined();
  });
});

describe('RecruiterJobStatus', () => {
  it('accepts Active, Pending, and Closed as valid status values (compile-time check)', () => {
    const statuses: RecruiterJobStatus[] = ['Active', 'Pending', 'Closed'];
    const sampleRows: Pick<RecruiterJobWithStats, 'status'>[] = statuses.map((status) => ({
      status
    }));

    expect(sampleRows.map((row) => row.status)).toEqual(['Active', 'Pending', 'Closed']);
  });
});
