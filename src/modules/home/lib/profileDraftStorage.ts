import {
  emptyProfileWizardValues,
  type ProfileWizardFormValues,
  type ProfileWizardStepId
} from '../schemas/jobSeekerProfileWizard';

const DRAFT_KEY = 'kx-hire-profile-wizard-draft';
const STEP_KEY = 'kx-hire-profile-wizard-step';

export interface ProfileDraftState {
  step: ProfileWizardStepId;
  values: ProfileWizardFormValues;
  /** True after the user finishes Save Profile on Review. */
  completed?: boolean;
}

/** In-memory only so a refresh or a new mobile number starts a blank profile. */
let memoryDraft: { phone: string; state: ProfileDraftState } | null = null;

function purgeLegacyStorage(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(STEP_KEY);
  } catch {
    // Vitest/jsdom or private mode may omit localStorage.
  }
}

function normalizeDraft(state: ProfileDraftState): ProfileDraftState {
  const step =
    state.step === 1 || state.step === 2 || state.step === 3 || state.step === 4 ? state.step : 1;
  return {
    step,
    values: { ...emptyProfileWizardValues, ...state.values },
    completed: state.completed === true
  };
}

export function readProfileDraft(phone?: string | null): ProfileDraftState | null {
  purgeLegacyStorage();
  if (!memoryDraft) return null;
  if (phone && memoryDraft.phone !== phone) return null;
  return normalizeDraft(memoryDraft.state);
}

export function writeProfileDraft(state: ProfileDraftState, phone = ''): void {
  purgeLegacyStorage();
  memoryDraft = { phone, state: normalizeDraft(state) };
}

export function clearProfileDraft(): void {
  memoryDraft = null;
  purgeLegacyStorage();
}
