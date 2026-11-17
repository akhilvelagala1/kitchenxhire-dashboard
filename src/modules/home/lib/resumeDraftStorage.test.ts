import { afterEach, describe, expect, it } from 'vitest';
import { emptyResumeWizardValues } from '../schemas/jobSeekerResumeWizard';
import { clearResumeDraft, readResumeDraft, writeResumeDraft } from './resumeDraftStorage';

const leftoverKey = 'kx-hire-resume-wizard-draft';

afterEach(() => {
  clearResumeDraft();
  try {
    localStorage?.clear();
  } catch {
    // Node 26 jsdom may omit localStorage.
  }
});

describe('resumeDraftStorage', () => {
  it('clears leftover localStorage drafts and does not persist across phones', () => {
    try {
      localStorage?.setItem(leftoverKey, JSON.stringify({ fullName: 'Old leftover' }));
    } catch {
      // Node 26 jsdom may omit localStorage.
    }

    writeResumeDraft(
      {
        step: 3,
        values: { ...emptyResumeWizardValues, fullName: 'First Number' },
        meta: {}
      },
      '+91 90000 00001'
    );

    try {
      expect(localStorage?.getItem(leftoverKey) ?? null).toBeNull();
    } catch {
      // Node 26 jsdom may omit localStorage.
    }
    expect(readResumeDraft('+91 90000 00001')?.values.fullName).toBe('First Number');
    expect(readResumeDraft('+91 90000 00002')).toBeNull();
  });

  it('forgets the in-memory draft after clear, like a browser refresh', () => {
    writeResumeDraft(
      {
        step: 2,
        values: { ...emptyResumeWizardValues, fullName: 'Temp' },
        meta: {}
      },
      '+91 90000 00001'
    );
    clearResumeDraft();
    expect(readResumeDraft('+91 90000 00001')).toBeNull();
  });
});
