import type {
  ProfileBasicDetailsField,
  ProfileSkillsField
} from '../schemas/jobSeekerProfileWizard';
import {
  PROFILE_BASIC_FIELD_ORDER,
  PROFILE_SKILLS_FIELD_ORDER
} from '../schemas/jobSeekerProfileWizard';

/** Focus the first invalid Basic Details control after a failed Save & Continue. */
export function focusFirstProfileBasicInvalid(fields: ProfileBasicDetailsField[]) {
  for (const field of PROFILE_BASIC_FIELD_ORDER) {
    if (!fields.includes(field)) continue;
    if (field === 'fullName' || field === 'mobile') {
      document.getElementById(field)?.focus();
      return;
    }
    // Other / manual mode uses a text input with id === field name.
    const manualInput = document.getElementById(field);
    if (manualInput instanceof HTMLInputElement) {
      manualInput.focus();
      return;
    }
    const trigger = document.querySelector<HTMLElement>(
      `button[id^="${field}-"][aria-haspopup="listbox"]`
    );
    trigger?.focus();
    return;
  }
}

/** Focus the first invalid Skills & Experience control after a failed Save & Continue. */
export function focusFirstProfileSkillsInvalid(fields: ProfileSkillsField[]) {
  for (const field of PROFILE_SKILLS_FIELD_ORDER) {
    if (!fields.includes(field)) continue;
    if (field === 'primarySkills') {
      document.getElementById('primarySkills')?.focus();
      return;
    }
    if (field === 'lastEmployer') {
      document.getElementById('lastEmployer')?.focus();
      return;
    }
    const manualInput = document.getElementById('currentRoleTitle');
    if (manualInput instanceof HTMLInputElement) {
      manualInput.focus();
      return;
    }
    const trigger = document.querySelector<HTMLElement>(
      `button[id^="currentRoleTitle-"][aria-haspopup="listbox"]`
    );
    trigger?.focus();
    return;
  }
}
