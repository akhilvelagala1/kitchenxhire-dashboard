import type { JobSeekerSessionState } from './jobSeekerSession';
import {
  emptyResumeWizardValues,
  emptyWorkEntry,
  type ResumeWizardFormValues
} from '../schemas/jobSeekerResumeWizard';

export function buildResumeWizardDefaults(
  session: JobSeekerSessionState | null
): ResumeWizardFormValues {
  const mobile = session?.phone ?? '+91 98765 43210';
  const fullName = session?.profile.displayName ?? '';

  return {
    ...emptyResumeWizardValues,
    fullName,
    mobile,
    city: 'Hyderabad, Telangana',
    workHistory: [{ ...emptyWorkEntry }]
  };
}
