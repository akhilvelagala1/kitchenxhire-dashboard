import { describe, expect, it } from 'vitest';
import { emptyResumeWizardValues } from '../schemas/jobSeekerResumeWizard';
import {
  firstIncompleteResumeStep,
  isResumePersonalComplete,
  isResumeReadyForPreview
} from './resumeCompletion';

describe('resumeCompletion', () => {
  it('requires personal fields before preview', () => {
    expect(isResumePersonalComplete(emptyResumeWizardValues)).toBe(false);
    expect(isResumeReadyForPreview(emptyResumeWizardValues)).toBe(false);
    expect(firstIncompleteResumeStep(emptyResumeWizardValues)).toBe(1);
  });
});
