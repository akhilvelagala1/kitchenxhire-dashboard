import { z } from 'zod';

export const RESUME_WIZARD_STEPS = [
  { id: 1, key: 'personal', label: 'Personal Details' },
  { id: 2, key: 'education', label: 'Education & Skills' },
  { id: 3, key: 'work', label: 'Work Experience' }
] as const;

export type ResumeWizardStepId = (typeof RESUME_WIZARD_STEPS)[number]['id'];

const workExperienceEntrySchema = z.object({
  jobTitle: z.string().trim().min(1, 'Job title is required'),
  workplaceType: z.string().trim().min(1, 'Type of restaurant is required'),
  employmentType: z.string().trim().min(1, 'Select employment type'),
  yearsOfExperience: z.string().trim().min(1, 'Select years of experience'),
  startDate: z.string().trim().min(1, 'Start date is required'),
  description: z.string().optional()
});

export const personalDetailsSchema = z.object({
  photoDataUrl: z.string().optional(),
  fullName: z.string().trim().min(2, 'Enter your full name'),
  mobile: z.string().trim().min(10, 'Mobile number is required'),
  city: z.string().trim().min(1, 'Select your city'),
  dateOfBirth: z.string().trim().min(1, 'Date of birth is required'),
  gender: z.string().trim().min(1, 'Select gender')
});

export const workExperienceStepSchema = z.object({
  workHistory: z.array(workExperienceEntrySchema).min(1, 'Add at least one job')
});

export const educationSkillsStepSchema = z.object({
  qualification: z.string().trim().min(1, 'Select your qualification'),
  languages: z.array(z.string().trim().min(1)).min(1, 'Select at least one language'),
  skills: z.array(z.string().trim().min(1)).min(1, 'Select your skills')
});

export type ResumeWizardFormValues = z.infer<typeof personalDetailsSchema> &
  z.infer<typeof workExperienceStepSchema> &
  z.infer<typeof educationSkillsStepSchema> & {
    professionalSummary?: string;
  };
export type WorkExperienceEntry = z.infer<typeof workExperienceEntrySchema>;

export const emptyWorkEntry: WorkExperienceEntry = {
  jobTitle: '',
  workplaceType: '',
  employmentType: 'Full-time',
  yearsOfExperience: '',
  startDate: '',
  description: ''
};

export const emptyResumeWizardValues: ResumeWizardFormValues = {
  photoDataUrl: '',
  fullName: '',
  mobile: '',
  city: '',
  dateOfBirth: '',
  gender: '',
  qualification: '',
  languages: [],
  skills: [],
  professionalSummary: '',
  workHistory: [{ ...emptyWorkEntry }]
};
