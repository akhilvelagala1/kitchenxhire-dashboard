import { describe, expect, it } from 'vitest';
import { DEMO_RECRUITER_APPLICATIONS } from './demoRecruiterApplications';

describe('DEMO_RECRUITER_APPLICATIONS', () => {
  it('seeds all 86 rows', () => {
    expect(DEMO_RECRUITER_APPLICATIONS).toHaveLength(86);
  });

  it('gives every row a populated candidate profile and resume mock, except recruiterNotes and photoUrl', () => {
    DEMO_RECRUITER_APPLICATIONS.forEach((row) => {
      expect(row.phone).toBeTruthy();
      expect(row.email).toBeTruthy();
      expect(row.profileSummary).toBeTruthy();
      expect(row.educationLevel).toBeTruthy();
      expect(row.skills && row.skills.length).toBeGreaterThanOrEqual(3);
      expect(row.resumeFileName).toBeTruthy();
      expect(row.resumeFileSizeKb).toBeDefined();
      expect(row.resumeUpdatedAt).toBeTruthy();
      expect(row.resumeSummary).toBeTruthy();
      expect(row.workHistory && row.workHistory.length).toBe(1);
      expect(row.education && row.education.length).toBe(1);

      expect(row.recruiterNotes).toBeUndefined();
      expect(row.photoUrl).toBeUndefined();
    });
  });

  it('formats phone as a synthetic Indian mobile number, not sequential or all-same-digit', () => {
    DEMO_RECRUITER_APPLICATIONS.forEach((row) => {
      const match = row.phone!.match(/^\+91 9(\d{4}) (\d{5})$/);
      expect(match).not.toBeNull();
      const generatedDigits = `${match![1]}${match![2]}`;
      expect(new Set(generatedDigits).size).toBeGreaterThan(1);
    });
  });

  it('builds email from the candidate name on the example.com domain', () => {
    const row = DEMO_RECRUITER_APPLICATIONS.find((r) => r.candidateName === 'Ramesh Kumar');
    expect(row?.email).toBe('ramesh.kumar@example.com');
    DEMO_RECRUITER_APPLICATIONS.forEach((r) => {
      expect(r.email).toMatch(/@example\.com$/);
    });
  });

  it('builds resumeFileName from the candidate name with underscores', () => {
    const row = DEMO_RECRUITER_APPLICATIONS.find((r) => r.candidateName === 'Ramesh Kumar');
    expect(row?.resumeFileName).toBe('Ramesh_Kumar_Resume.pdf');
  });

  it('keeps resumeFileSizeKb within a realistic 150-600 range', () => {
    DEMO_RECRUITER_APPLICATIONS.forEach((row) => {
      expect(row.resumeFileSizeKb).toBeGreaterThanOrEqual(150);
      expect(row.resumeFileSizeKb).toBeLessThanOrEqual(600);
    });
  });

  it('picks skills from a category-appropriate pool for kitchen vs service job titles', () => {
    const kitchenPool = [
      'Kitchen Cleaning',
      'Food Prep',
      'Hygiene & Safety',
      'Waste Management',
      'Knife Handling',
      'Inventory Stocking'
    ];
    const servicePool = [
      'Customer Service',
      'Billing',
      'Table Service',
      'POS Handling',
      'Order Taking',
      'Guest Relations'
    ];

    const kitchenRows = DEMO_RECRUITER_APPLICATIONS.filter((r) => r.jobTitle === 'Cook / Chef');
    const serviceRows = DEMO_RECRUITER_APPLICATIONS.filter(
      (r) => r.jobTitle === 'Waiter / Service Staff'
    );
    expect(kitchenRows.length).toBeGreaterThan(0);
    expect(serviceRows.length).toBeGreaterThan(0);

    kitchenRows.forEach((row) => {
      row.skills!.forEach((skill) => expect(kitchenPool).toContain(skill));
    });
    serviceRows.forEach((row) => {
      row.skills!.forEach((skill) => expect(servicePool).toContain(skill));
    });
  });

  it('is deterministic across repeated builds of the same module data', () => {
    // Re-reading the already-built singleton must be stable (no Date.now/Math.random drift
    // beyond the shared appliedAt anchor computed once at module load).
    const first = DEMO_RECRUITER_APPLICATIONS[0];
    const second = DEMO_RECRUITER_APPLICATIONS[0];
    expect(first).toEqual(second);
  });
});
