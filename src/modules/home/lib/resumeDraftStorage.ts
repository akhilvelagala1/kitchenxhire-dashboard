import {
  emptyResumeWizardValues,
  emptyWorkEntry,
  type ResumeWizardFormValues,
  type ResumeWizardStepId,
  type WorkExperienceEntry
} from '../schemas/jobSeekerResumeWizard';

const DRAFT_KEY = 'kx-hire-resume-wizard-draft';
const STEP_KEY = 'kx-hire-resume-wizard-step';
const META_KEY = 'kx-hire-resume-meta';

export interface ResumeMeta {
  uploadedFileName?: string;
  uploadedAt?: string;
}

export interface ResumeDraftState {
  step: ResumeWizardStepId;
  values: ResumeWizardFormValues;
  meta: ResumeMeta;
}

/** In-memory only so a refresh or a new mobile number starts a blank builder. */
let memoryDraft: { phone: string; state: ResumeDraftState } | null = null;

function purgeLegacyStorage(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(STEP_KEY);
    localStorage.removeItem(META_KEY);
  } catch {
    // Vitest/jsdom or private mode may omit localStorage.
  }
}

function normalizeDraft(state: ResumeDraftState): ResumeDraftState {
  const step = state.step === 2 || state.step === 3 ? state.step : 1;
  const merged = { ...emptyResumeWizardValues, ...state.values };
  return {
    step,
    values: {
      ...merged,
      languages: Array.isArray(merged.languages) ? merged.languages : [],
      skills: Array.isArray(merged.skills) ? merged.skills : [],
      workHistory: merged.workHistory.map((job) => {
        const legacy = job as WorkExperienceEntry & { company?: string };
        return {
          ...emptyWorkEntry,
          ...job,
          workplaceType: job.workplaceType || legacy.company || '',
          employmentType: job.employmentType || 'Full-time'
        };
      })
    },
    meta: state.meta ?? {}
  };
}

export function readResumeDraft(phone?: string | null): ResumeDraftState | null {
  purgeLegacyStorage();
  if (!memoryDraft) return null;
  if (phone && memoryDraft.phone !== phone) return null;
  return normalizeDraft(memoryDraft.state);
}

export function writeResumeDraft(state: ResumeDraftState, phone = ''): void {
  purgeLegacyStorage();
  memoryDraft = { phone, state: normalizeDraft(state) };
}

export function clearResumeDraft(): void {
  memoryDraft = null;
  purgeLegacyStorage();
}
