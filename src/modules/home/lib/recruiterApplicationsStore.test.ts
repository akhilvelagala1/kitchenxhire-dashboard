import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_RECRUITER_APPLICATIONS } from '../content/demoRecruiterApplications';
import {
  readRecruiterApplications,
  updateRecruiterApplicationNotes
} from './recruiterApplicationsStore';

const accountId = '919876543210';

describe('updateRecruiterApplicationNotes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists recruiter notes for the matching application and reads them back', () => {
    const target = DEMO_RECRUITER_APPLICATIONS[0]!;

    updateRecruiterApplicationNotes(accountId, target.id, 'Strong candidate, schedule interview.');

    const rows = readRecruiterApplications(accountId);
    const updated = rows.find((row) => row.id === target.id);
    expect(updated?.recruiterNotes).toBe('Strong candidate, schedule interview.');
  });

  it('leaves every other application untouched', () => {
    const target = DEMO_RECRUITER_APPLICATIONS[0]!;
    const other = DEMO_RECRUITER_APPLICATIONS[1]!;

    updateRecruiterApplicationNotes(accountId, target.id, 'Note for first candidate.');

    const rows = readRecruiterApplications(accountId);
    const untouched = rows.find((row) => row.id === other.id);
    expect(untouched?.recruiterNotes).toBeUndefined();
  });

  it('overwrites a previously saved note for the same application', () => {
    const target = DEMO_RECRUITER_APPLICATIONS[0]!;

    updateRecruiterApplicationNotes(accountId, target.id, 'First note.');
    updateRecruiterApplicationNotes(accountId, target.id, 'Revised note.');

    const rows = readRecruiterApplications(accountId);
    const updated = rows.find((row) => row.id === target.id);
    expect(updated?.recruiterNotes).toBe('Revised note.');
  });

  it('is a no-op when the application id does not exist', () => {
    const before = readRecruiterApplications(accountId);

    updateRecruiterApplicationNotes(accountId, 'does-not-exist', 'Orphan note.');

    const after = readRecruiterApplications(accountId);
    expect(after).toEqual(before);
  });
});
