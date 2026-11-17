import {
  educationSkillsStepSchema,
  personalDetailsSchema,
  workExperienceStepSchema,
  type ResumeWizardFormValues,
  type ResumeWizardStepId
} from '../schemas/jobSeekerResumeWizard';

export function isResumePersonalComplete(values: ResumeWizardFormValues): boolean {
  return personalDetailsSchema.safeParse(values).success;
}

export function isResumeEducationComplete(values: ResumeWizardFormValues): boolean {
  return educationSkillsStepSchema.safeParse(values).success;
}

export function isResumeWorkComplete(values: ResumeWizardFormValues): boolean {
  return workExperienceStepSchema.safeParse(values).success;
}

export function isResumeReadyForPreview(values: ResumeWizardFormValues): boolean {
  return firstIncompleteResumeStep(values) === null;
}

/** First wizard step that is still missing required fields, or null when ready. */
export function firstIncompleteResumeStep(
  values: ResumeWizardFormValues
): ResumeWizardStepId | null {
  if (!isResumePersonalComplete(values)) return 1;
  if (!isResumeEducationComplete(values)) return 2;
  if (!isResumeWorkComplete(values)) return 3;
  return null;
}
