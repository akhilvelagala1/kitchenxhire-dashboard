import { DEMO_JOB_APPLICATIONS } from '../content/demoJobApplications';
import {
  countApplicationsByStatus,
  filterApplicationsByStatus,
  totalApplicationPages
} from './jobApplications';

describe('jobApplications helpers', () => {
  it('counts statuses from application rows', () => {
    const counts = countApplicationsByStatus(DEMO_JOB_APPLICATIONS);
    expect(DEMO_JOB_APPLICATIONS.length).toBe(13);
    expect(counts['under-review']).toBe(6);
    expect(counts.shortlisted).toBe(2);
    expect(counts.interview).toBe(1);
    expect(counts.selected).toBe(1);
    expect(counts.closed).toBe(3);
  });

  it('filters by status for pill tabs', () => {
    const shortlisted = filterApplicationsByStatus(DEMO_JOB_APPLICATIONS, 'shortlisted');
    expect(shortlisted).toHaveLength(2);
    expect(shortlisted.every((row) => row.status === 'shortlisted')).toBe(true);
  });

  it('paginates six applications per page', () => {
    expect(totalApplicationPages(13, 6)).toBe(3);
  });
});
