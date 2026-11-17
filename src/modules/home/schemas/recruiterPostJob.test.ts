import { describe, expect, it } from 'vitest';
import {
  POST_JOB_CATEGORY_OPTIONS,
  POST_JOB_DESCRIPTION_MAX,
  POST_JOB_DESCRIPTION_MIN,
  POST_JOB_LOCATION_MAX,
  POST_JOB_TITLE_MAX
} from '../content/recruiterPostJobFormOptions';
import { recruiterPostJobSchema } from './recruiterPostJob';

const validPayload = {
  jobTitle: 'Sous Chef',
  jobCategory: POST_JOB_CATEGORY_OPTIONS[0]?.value ?? 'Cook / Chef',
  openings: 1,
  employmentType: 'full_time',
  workShift: 'day',
  monthlySalary: '45000',
  preferredGender: 'any',
  ageMin: 18,
  ageMax: 40,
  qualification: 'not_required',
  experience: 'none',
  jobDescription: 'Prepare daily meals and manage the kitchen team.',
  workLocation: 'Hitech City, Hyderabad'
};

function parseSuccess(payload: Record<string, unknown>) {
  const result = recruiterPostJobSchema.safeParse(payload);
  if (!result.success) throw new Error(JSON.stringify(result.error.issues));
  return result.data;
}

function parseFailure(payload: Record<string, unknown>) {
  const result = recruiterPostJobSchema.safeParse(payload);
  if (result.success) throw new Error('Expected validation to fail');
  return result.error.issues;
}

describe('recruiterPostJobSchema', () => {
  it('trims the title, description and location', () => {
    const data = parseSuccess({
      ...validPayload,
      jobTitle: '  Sous Chef  ',
      jobDescription: `  ${'a'.repeat(POST_JOB_DESCRIPTION_MIN)}  `,
      workLocation: '  Hitech City  '
    });

    expect(data.jobTitle).toBe('Sous Chef');
    expect(data.jobDescription).toHaveLength(POST_JOB_DESCRIPTION_MIN);
    expect(data.workLocation).toBe('Hitech City');
  });

  it('rejects a whitespace-only title', () => {
    expect(parseFailure({ ...validPayload, jobTitle: '   ' })[0]?.path).toEqual(['jobTitle']);
  });

  it('rejects a whitespace-only location', () => {
    expect(parseFailure({ ...validPayload, workLocation: '   ' })[0]?.path).toEqual([
      'workLocation'
    ]);
  });

  it('rejects a whitespace-only job description', () => {
    expect(parseFailure({ ...validPayload, jobDescription: '   ' })[0]?.path).toEqual([
      'jobDescription'
    ]);
  });

  it('accepts a title at the maximum length and rejects one character more', () => {
    expect(
      parseSuccess({ ...validPayload, jobTitle: 'a'.repeat(POST_JOB_TITLE_MAX) }).jobTitle
    ).toHaveLength(POST_JOB_TITLE_MAX);
    expect(
      parseFailure({ ...validPayload, jobTitle: 'a'.repeat(POST_JOB_TITLE_MAX + 1) })[0]?.path
    ).toEqual(['jobTitle']);
  });

  it('accepts a location at the maximum length and rejects one character more', () => {
    expect(
      parseSuccess({ ...validPayload, workLocation: 'a'.repeat(POST_JOB_LOCATION_MAX) })
        .workLocation
    ).toHaveLength(POST_JOB_LOCATION_MAX);
    expect(
      parseFailure({ ...validPayload, workLocation: 'a'.repeat(POST_JOB_LOCATION_MAX + 1) })[0]
        ?.path
    ).toEqual(['workLocation']);
  });

  it('requires at least 30 description characters and caps the description at 1,000', () => {
    expect(parseFailure({ ...validPayload, jobDescription: 'a'.repeat(29) })[0]?.message).toBe(
      'Job description is required (minimum 30 characters).'
    );
    expect(
      parseSuccess({ ...validPayload, jobDescription: 'a'.repeat(30) }).jobDescription
    ).toHaveLength(30);
    expect(
      parseFailure({
        ...validPayload,
        jobDescription: 'a'.repeat(POST_JOB_DESCRIPTION_MAX + 1)
      })[0]?.path
    ).toEqual(['jobDescription']);
  });

  it('rejects a salary of zero, a negative number or non-digits', () => {
    expect(parseFailure({ ...validPayload, monthlySalary: '0' })[0]?.message).toBe(
      'Enter a valid amount greater than 0.'
    );
    expect(parseFailure({ ...validPayload, monthlySalary: '-1' })[0]?.message).toBe(
      'Enter the salary in whole rupees (digits only).'
    );
    expect(parseFailure({ ...validPayload, monthlySalary: 'abc' })[0]?.message).toBe(
      'Enter the salary in whole rupees (digits only).'
    );
  });

  it('stores a valid salary as a number and caps it at ₹99,99,999', () => {
    expect(parseSuccess({ ...validPayload, monthlySalary: ' 45000 ' }).monthlySalary).toBe(45000);
    expect(parseSuccess({ ...validPayload, monthlySalary: '9999999' }).monthlySalary).toBe(9999999);
    expect(parseFailure({ ...validPayload, monthlySalary: '10000000' })[0]?.message).toBe(
      'Salary must be ₹99,99,999 or less.'
    );
  });

  it('rejects openings below 1, above 99 or fractional', () => {
    expect(parseFailure({ ...validPayload, openings: 0 })[0]?.path).toEqual(['openings']);
    expect(parseFailure({ ...validPayload, openings: 100 })[0]?.path).toEqual(['openings']);
    expect(parseFailure({ ...validPayload, openings: 1.5 })[0]?.path).toEqual(['openings']);
    expect(parseSuccess({ ...validPayload, openings: 1 }).openings).toBe(1);
    expect(parseSuccess({ ...validPayload, openings: 99 }).openings).toBe(99);
  });

  it('rejects ages below 18 or above 60', () => {
    expect(parseFailure({ ...validPayload, ageMin: 17 })[0]?.path).toEqual(['ageMin']);
    expect(parseFailure({ ...validPayload, ageMax: 61 })[0]?.path).toEqual(['ageMax']);
  });

  it('rejects a maximum age below the minimum age', () => {
    expect(parseFailure({ ...validPayload, ageMin: 40, ageMax: 30 })[0]).toMatchObject({
      path: ['ageMax'],
      message: 'Maximum age must be at least the minimum age.'
    });
  });

  it('rejects category, employment, shift, qualification and experience values outside the options', () => {
    expect(parseFailure({ ...validPayload, jobCategory: 'Not a category' })[0]?.path).toEqual([
      'jobCategory'
    ]);
    expect(parseFailure({ ...validPayload, employmentType: 'intern' })[0]?.path).toEqual([
      'employmentType'
    ]);
    expect(parseFailure({ ...validPayload, workShift: 'weekend' })[0]?.path).toEqual(['workShift']);
    expect(parseFailure({ ...validPayload, qualification: 'phd' })[0]?.path).toEqual([
      'qualification'
    ]);
    expect(parseFailure({ ...validPayload, experience: '10 years' })[0]?.path).toEqual([
      'experience'
    ]);
  });

  it('parses the job description and no longer includes a sample resume', () => {
    const data = parseSuccess(validPayload);
    expect(data.jobDescription).toBe(validPayload.jobDescription);
    expect('sampleResume' in data).toBe(false);
  });
});
