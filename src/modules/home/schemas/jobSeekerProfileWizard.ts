import { z } from 'zod';
import {
  PROFILE_CURRENT_ROLE_OPTIONS,
  PROFILE_EXPERIENCE_OPTIONS,
  PROFILE_OTHER_VALUE,
  PROFILE_ROLE_OPTIONS,
  PROFILE_SALARY_OPTIONS,
  PROFILE_SKILLS_MAX,
  PROFILE_SKILL_OPTIONS,
  isPresetProfileOption,
  parsePrimarySkills
} from '../content/profileFormOptions';
import { jobSeekerFullNameSchema } from './jobSeekerOnboarding';

export const PROFILE_WIZARD_STEPS = [
  { id: 1, key: 'basic', label: 'Basic Details' },
  { id: 2, key: 'skills', label: 'Skills & Experience' },
  { id: 3, key: 'education', label: 'Education' },
  { id: 4, key: 'review', label: 'Review & Save' }
] as const;

export type ProfileWizardStepId = (typeof PROFILE_WIZARD_STEPS)[number]['id'];

const EXPERIENCE_VALUES = new Set<string>(PROFILE_EXPERIENCE_OPTIONS.map((opt) => opt.value));

/** Mobile is OTP-verified when the job seeker session phone is present on the form. */
const profileMobileSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    const digits = value.replace(/\D/g, '');
    if (!value || digits.length < 10) {
      ctx.addIssue({ code: 'custom', message: 'Please verify your mobile number' });
    }
  });

/** City: preset or custom Other text (sentinel means Other chosen but empty). */
function citySchema(): z.ZodType<string> {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please select your current city or location'
        });
        return;
      }
      if (value === PROFILE_OTHER_VALUE) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please enter your current city or location'
        });
      }
    });
}

/** Preferred role: preset, or Other text 2–50 chars (trimmed, not spaces-only). */
function preferredRoleSchema(): z.ZodType<string> {
  return z.string().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: 'custom', message: 'Please select your preferred job role' });
      return;
    }
    if (value === PROFILE_OTHER_VALUE) {
      ctx.addIssue({ code: 'custom', message: 'Please enter your preferred job role.' });
      return;
    }
    if (isPresetProfileOption(PROFILE_ROLE_OPTIONS, value)) return;

    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      ctx.addIssue({ code: 'custom', message: 'Please enter your preferred job role.' });
    }
  });
}

/** Expected salary: preset range, or Other digits-only amount greater than zero. */
function expectedSalarySchema(): z.ZodType<string> {
  return z.string().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: 'custom', message: 'Please select your expected salary range' });
      return;
    }
    if (value === PROFILE_OTHER_VALUE) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid expected salary.' });
      return;
    }
    if (isPresetProfileOption(PROFILE_SALARY_OPTIONS, value)) return;

    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed) || Number(trimmed) <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid expected salary.' });
    }
  });
}

function requiredExperience(): z.ZodType<string> {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!value || !EXPERIENCE_VALUES.has(value)) {
        ctx.addIssue({ code: 'custom', message: 'Please select your work experience' });
      }
    });
}

export const basicDetailsSchema = z.object({
  fullName: jobSeekerFullNameSchema,
  mobile: profileMobileSchema,
  city: citySchema(),
  preferredRole: preferredRoleSchema(),
  workExperience: requiredExperience(),
  expectedSalary: expectedSalarySchema()
});

const SKILL_VALUES = new Set<string>(PROFILE_SKILL_OPTIONS.map((opt) => opt.value));

function primarySkillsSchema(): z.ZodType<string> {
  return z.string().superRefine((value, ctx) => {
    const skills = parsePrimarySkills(value);
    if (skills.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Please select at least one skill.' });
      return;
    }
    if (skills.length > PROFILE_SKILLS_MAX) {
      ctx.addIssue({
        code: 'custom',
        message: `Select up to ${PROFILE_SKILLS_MAX} skills.`
      });
      return;
    }
    if (skills.some((skill) => !SKILL_VALUES.has(skill))) {
      ctx.addIssue({ code: 'custom', message: 'Please select at least one skill.' });
    }
  });
}

/** Current / last role: preset list, or Other text (trimmed, not spaces-only). */
function currentRoleTitleSchema(): z.ZodType<string> {
  return z.string().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: 'custom', message: 'Please select or enter your role.' });
      return;
    }
    if (value === PROFILE_OTHER_VALUE) {
      ctx.addIssue({ code: 'custom', message: 'Please select or enter your role.' });
      return;
    }
    if (isPresetProfileOption(PROFILE_CURRENT_ROLE_OPTIONS, value)) return;

    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      ctx.addIssue({ code: 'custom', message: 'Please select or enter your role.' });
    }
  });
}

export const skillsExperienceSchema = z.object({
  primarySkills: primarySkillsSchema(),
  currentRoleTitle: currentRoleTitleSchema(),
  lastEmployer: z.string().trim().max(80, 'Employer name is too long')
});

export const educationSchema = z.object({
  highestQualification: z.string().trim().min(1, 'Select qualification'),
  institution: z.string().trim().optional()
});

export const profileWizardSchema = basicDetailsSchema
  .merge(skillsExperienceSchema)
  .merge(educationSchema);

export type ProfileWizardFormValues = z.infer<typeof profileWizardSchema>;

export type ProfileBasicDetailsField = keyof z.infer<typeof basicDetailsSchema>;

export type ProfileSkillsField = keyof z.infer<typeof skillsExperienceSchema>;

export const PROFILE_BASIC_FIELD_ORDER: ProfileBasicDetailsField[] = [
  'fullName',
  'mobile',
  'city',
  'preferredRole',
  'workExperience',
  'expectedSalary'
];

export const PROFILE_SKILLS_FIELD_ORDER: ProfileSkillsField[] = [
  'primarySkills',
  'currentRoleTitle',
  'lastEmployer'
];

export const emptyProfileWizardValues: ProfileWizardFormValues = {
  fullName: '',
  mobile: '',
  city: '',
  preferredRole: '',
  workExperience: '',
  expectedSalary: '',
  primarySkills: '',
  lastEmployer: '',
  currentRoleTitle: '',
  highestQualification: '',
  institution: ''
};
