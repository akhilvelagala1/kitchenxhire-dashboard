import { z } from 'zod';
import { jobSeekerFullNameSchema } from './jobSeekerOnboarding';

/** Same letters/spaces/hyphen/apostrophe rule the job-seeker modal uses — one source of truth. */
const fullNameSchema = jobSeekerFullNameSchema;

/** Empty means "not provided"; anything else must look like an address. */
const recruiterEmailSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), {
    message: 'Enter a valid email address.'
  });

/** Basic recruiter profile collected after OTP, before the dashboard opens. */
export const recruiterOnboardingSchema = z.object({
  fullName: fullNameSchema,
  businessName: z.string().trim().min(2, 'Enter your business or restaurant name.'),
  businessType: z.string().trim().min(1, 'Choose a type of business.'),
  recruiterRole: z.string().trim().optional(),
  city: z.string().trim().min(1, 'Choose your city or location.'),
  area: z.string().trim().optional(),
  email: recruiterEmailSchema.optional(),
  photoDataUrl: z.string().optional()
});

export type RecruiterProfile = z.infer<typeof recruiterOnboardingSchema>;

export type RecruiterOnboardingForm = {
  fullName: string;
  mobile: string;
  businessName: string;
  businessType: string;
  recruiterRole: string;
  city: string;
  area: string;
  email: string;
};

export type RecruiterOnboardingField =
  'fullName' | 'businessName' | 'businessType' | 'city' | 'email';

export function recruiterFieldFromIssuePath(
  path: PropertyKey | undefined
): RecruiterOnboardingField | null {
  if (
    path === 'fullName' ||
    path === 'businessName' ||
    path === 'businessType' ||
    path === 'city' ||
    path === 'email'
  ) {
    return path;
  }
  return null;
}
