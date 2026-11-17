import { describe, expect, it } from 'vitest';
import { DEMO_RECRUITER_APPLICATIONS } from '../content/demoRecruiterApplications';
import {
  computeRecruiterMetrics,
  filterRecruiterApplications,
  paginateRecruiterApplications
} from './recruiterDashboard';

describe('recruiterDashboard', () => {
  it('computes metrics from application rows', () => {
    const metrics = computeRecruiterMetrics(DEMO_RECRUITER_APPLICATIONS, '919876543210');
    expect(metrics.totalApplicants).toBe(86);
    expect(metrics.jobsPosted).toBe(12);
    expect(metrics.selectedHired + metrics.rejected + metrics.underReview).toBe(86);
  });

  it('paginates five records per page on My Applications', () => {
    const filtered = filterRecruiterApplications(DEMO_RECRUITER_APPLICATIONS, {
      search: '',
      jobId: 'all',
      status: 'all',
      dateRange: 'all',
      tab: 'all',
      location: 'all'
    });
    const page = paginateRecruiterApplications(filtered, 1, 5);
    expect(page.slice).toHaveLength(5);
    expect(page.totalPages).toBe(18);
  });

  it('paginates four records per page like the reference', () => {
    const filtered = filterRecruiterApplications(DEMO_RECRUITER_APPLICATIONS, {
      search: '',
      jobId: 'all',
      status: 'all',
      dateRange: 'all'
    });
    const page = paginateRecruiterApplications(filtered, 1, 4);
    expect(page.slice).toHaveLength(4);
    expect(page.totalPages).toBe(22);
    expect(page.rangeStart).toBe(1);
    expect(page.rangeEnd).toBe(4);
  });
});
