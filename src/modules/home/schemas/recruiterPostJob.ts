import { z } from 'zod';
import {
  POST_JOB_CATEGORY_OPTIONS,
  POST_JOB_DESCRIPTION_MAX,
  POST_JOB_DESCRIPTION_MIN,
  POST_JOB_EMPLOYMENT_TYPES,
  POST_JOB_EXPERIENCE,
  POST_JOB_GENDER,
  POST_JOB_LOCATION_MAX,
  POST_JOB_QUALIFICATION,
  POST_JOB_SALARY_MAX,
  POST_JOB_SHIFTS,
  POST_JOB_TITLE_MAX
} from '../content/recruiterPostJobFormOptions';

function oneOf(options: readonly { value: string }[], message: string) {
  return z
    .string()
    .trim()
    .refine((value) => options.some((option) => option.value === value), message);
}

export const recruiterPostJobSchema = z
  .object({
    jobTitle: z
      .string()
      .trim()
      .min(2, 'Enter a job title.')
      .max(POST_JOB_TITLE_MAX, `Job title must be ${POST_JOB_TITLE_MAX} characters or fewer.`),
    jobCategory: oneOf(POST_JOB_CATEGORY_OPTIONS, 'Choose a job category.'),
    openings: z
      .number()
      .int()
      .min(1, 'Openings must be at least 1.')
      .max(99, 'Openings must be 99 or fewer.'),
    employmentType: oneOf(POST_JOB_EMPLOYMENT_TYPES, 'Choose an employment type.'),
    workShift: oneOf(POST_JOB_SHIFTS, 'Choose a work shift.'),
    monthlySalary: z
      .string()
      .trim()
      .min(1, 'Enter the monthly salary.')
      .regex(/^\d+$/, 'Enter the salary in whole rupees (digits only).')
      .refine((value) => Number(value) > 0, 'Enter a valid amount greater than 0.')
      .refine((value) => Number(value) <= POST_JOB_SALARY_MAX, 'Salary must be ₹99,99,999 or less.')
      .transform(Number),
    preferredGender: oneOf(POST_JOB_GENDER, 'Choose a preferred gender.'),
    ageMin: z.number().int().min(18).max(60),
    ageMax: z.number().int().min(18).max(60),
    qualification: oneOf(POST_JOB_QUALIFICATION, 'Choose a qualification.'),
    experience: oneOf(POST_JOB_EXPERIENCE, 'Choose an experience level.'),
    jobDescription: z
      .string()
      .trim()
      .min(POST_JOB_DESCRIPTION_MIN, 'Job description is required (minimum 30 characters).')
      .max(POST_JOB_DESCRIPTION_MAX, 'Job description must be 1,000 characters or fewer.'),
    workLocation: z
      .string()
      .trim()
      .min(3, 'Enter the work location.')
      .max(
        POST_JOB_LOCATION_MAX,
        `Work location must be ${POST_JOB_LOCATION_MAX} characters or fewer.`
      )
  })
  .refine((data) => data.ageMax >= data.ageMin, {
    message: 'Maximum age must be at least the minimum age.',
    path: ['ageMax']
  });

export type RecruiterPostJobPayload = z.infer<typeof recruiterPostJobSchema>;
