import { z } from 'zod';

/** Letters (any script), spaces, hyphen, apostrophe — rejects empty, 1-char, and number-only names. */
const FULL_NAME_PATTERN = /^[\p{L}][\p{L}\s'-]*$/u;

export const jobSeekerFullNameSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: 'custom', message: 'Please enter your full name' });
      return;
    }
    if (value.length < 2 || !FULL_NAME_PATTERN.test(value)) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid full name' });
    }
  });

/** Minimum profile collected on the Complete Your Profile overlay. */
export const jobSeekerCandidateSchema = z.object({
  fullName: jobSeekerFullNameSchema,
  preferredRole: z.string().trim().min(1, 'Please select a job category'),
  city: z.string().trim().min(1, 'Please select your city or location'),
  area: z.string().trim().optional(),
  workExperience: z.string().trim().optional()
});

export type JobSeekerCandidateProfile = z.infer<typeof jobSeekerCandidateSchema>;

export type JobSeekerOnboardingForm = {
  fullName: string;
  preferredRole: string;
  city: string;
  mobile: string;
  area?: string;
  workExperience?: string;
};

export type JobSeekerOnboardingField = 'fullName' | 'preferredRole' | 'city';

export function candidateFieldFromIssuePath(
  path: PropertyKey | undefined
): JobSeekerOnboardingField | null {
  if (path === 'fullName' || path === 'preferredRole' || path === 'city') return path;
  return null;
}
