import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  JOB_CATEGORY_OPTIONS,
  JOB_POST_DEFAULTS,
  JOB_TEXT_LIMIT,
  jobPostSchemaFor,
  jobPostToday,
  toJobPostBody,
  type JobPostFormValues,
  type JobPostMode
} from './adminJobPost';

const VALID: JobPostFormValues = {
  title: 'Sous Chef',
  job_category: 'Cook / Chef',
  department: 'Kitchen',
  openings: '3',
  city: 'Hyderabad',
  work_location: 'On-site',
  address: 'Banjara Hills, Road No. 12',
  employment_type: 'Full-time',
  salary_min: '18000',
  salary_max: '25000',
  work_shift: 'Day Shift (9:00 AM – 6:00 PM)',
  experience_required: '2 – 4 Years',
  description: 'Run the hot line during dinner service.',
  responsibilities: 'Prepare mise en place and plate dishes.',
  requirements: 'Two years in a restaurant kitchen.',
  skills: ['Grilling', 'Food safety'],
  application_deadline: '2999-12-31',
  visibility: 'public'
};

/** First message per field, or an empty object when the form is valid. */
function errorsOf(values: JobPostFormValues, mode: JobPostMode): Record<string, string> {
  const result = jobPostSchemaFor(mode).safeParse(values);
  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      errors[field] ??= issue.message;
    }
  }
  return errors;
}

describe('jobPostSchemaFor publish', () => {
  it('rejects an empty form with one error for each required field', () => {
    const errors = errorsOf(JOB_POST_DEFAULTS, 'publish');
    expect(Object.keys(errors).sort()).toEqual(
      [
        'title',
        'job_category',
        'department',
        'openings',
        'city',
        'work_location',
        'employment_type',
        'salary_min',
        'salary_max',
        'work_shift',
        'experience_required',
        'description',
        'responsibilities',
        'requirements',
        'application_deadline',
        'visibility'
      ].sort()
    );
    expect(errors.job_category).toBe('Select the job category');
  });

  it('accepts a fully valid form', () => {
    expect(errorsOf(VALID, 'publish')).toEqual({});
  });

  it('accepts an empty address and no skills', () => {
    expect(errorsOf({ ...VALID, address: '', skills: [] }, 'publish')).toEqual({});
  });

  it('rejects a select value that is not one of the options', () => {
    expect(errorsOf({ ...VALID, city: 'Atlantis' }, 'publish').city).toBe('Select the city');
  });

  it('puts the salary range error on the maximum', () => {
    const errors = errorsOf({ ...VALID, salary_min: '30000', salary_max: '20000' }, 'publish');
    expect(errors).toEqual({ salary_max: 'Maximum salary must be at least the minimum' });
  });

  it('still reports the salary range error when another field is also wrong', () => {
    const errors = errorsOf(
      { ...VALID, title: '', salary_min: '30000', salary_max: '20000' },
      'publish'
    );
    expect(errors.salary_max).toBe('Maximum salary must be at least the minimum');
    expect(errors.title).toBeDefined();
  });

  it('accepts equal minimum and maximum salaries', () => {
    expect(errorsOf({ ...VALID, salary_min: '20000', salary_max: '20000' }, 'publish')).toEqual({});
  });

  it('rejects openings that are not a whole number from 1 to 999', () => {
    for (const openings of ['0', '1000', '2.5', 'abc', '-1']) {
      expect(errorsOf({ ...VALID, openings }, 'publish').openings).toBeDefined();
    }
    expect(errorsOf({ ...VALID, openings: '999' }, 'publish')).toEqual({});
  });

  it('rejects a negative or fractional salary', () => {
    expect(errorsOf({ ...VALID, salary_min: '-1' }, 'publish').salary_min).toBe(
      'Salary cannot be negative'
    );
    expect(errorsOf({ ...VALID, salary_max: '25000.5' }, 'publish').salary_max).toBeDefined();
  });

  it('rejects a deadline before today', () => {
    const errors = errorsOf({ ...VALID, application_deadline: '2000-01-01' }, 'publish');
    expect(errors.application_deadline).toBe('Deadline cannot be in the past');
  });

  it('accepts a deadline of today', () => {
    const values = { ...VALID, application_deadline: jobPostToday() };
    expect(errorsOf(values, 'publish')).toEqual({});
  });

  it('rejects a deadline that is not a real date', () => {
    const errors = errorsOf({ ...VALID, application_deadline: '2999-02-30' }, 'publish');
    expect(errors.application_deadline).toBe('Enter a valid date');
  });

  it('rejects texts under 10 characters', () => {
    const errors = errorsOf({ ...VALID, description: 'Too short', requirements: '   ' }, 'publish');
    expect(errors.description).toBeDefined();
    expect(errors.requirements).toBeDefined();
    expect(errors.responsibilities).toBeUndefined();
  });

  it('rejects more than 20 skills and an address over 200 characters', () => {
    const skills = Array.from({ length: 21 }, (_, i) => `Skill ${i}`);
    expect(errorsOf({ ...VALID, skills }, 'publish').skills).toBe('Add at most 20 skills');
    expect(errorsOf({ ...VALID, address: 'a'.repeat(201) }, 'publish').address).toBeDefined();
  });

  it('only offers category labels that exist on the Jobs page', () => {
    expect(JOB_CATEGORY_OPTIONS.map((o) => o.value)).toEqual([
      'Cook / Chef',
      'Kitchen Helper',
      'Cleaning & Stewarding',
      'Delivery & Store Support',
      'Restaurant Manager',
      'Others'
    ]);
  });
});

describe('jobPostSchemaFor draft', () => {
  it('accepts a form with only a title', () => {
    expect(errorsOf({ ...JOB_POST_DEFAULTS, title: 'Dishwasher' }, 'draft')).toEqual({});
  });

  it('rejects an empty or one-letter title', () => {
    expect(errorsOf(JOB_POST_DEFAULTS, 'draft')).toEqual({
      title: 'Enter the job title (at least 2 characters)'
    });
    expect(errorsOf({ ...JOB_POST_DEFAULTS, title: ' a ' }, 'draft').title).toBeDefined();
  });

  it('accepts a past deadline and a salary range that is unfinished', () => {
    const values = { ...JOB_POST_DEFAULTS, title: 'Cook', application_deadline: '2000-01-01' };
    expect(errorsOf({ ...values, salary_min: '15000' }, 'draft')).toEqual({});
  });

  it('still checks the salary range and number format on what is filled in', () => {
    const base = { ...JOB_POST_DEFAULTS, title: 'Cook' };
    expect(errorsOf({ ...base, salary_min: '9', salary_max: '5' }, 'draft').salary_max).toBe(
      'Maximum salary must be at least the minimum'
    );
    expect(errorsOf({ ...base, openings: 'many' }, 'draft').openings).toBeDefined();
  });
});

describe('text length limits', () => {
  const tooLong = 'x'.repeat(JOB_TEXT_LIMIT + 1);

  it.each(['publish', 'draft'] as const)('rejects texts over the limit when %s', (mode) => {
    const base = mode === 'publish' ? VALID : { ...JOB_POST_DEFAULTS, title: 'Cook' };
    const errors = errorsOf(
      { ...base, description: tooLong, responsibilities: tooLong, requirements: tooLong },
      mode
    );
    expect(Object.keys(errors).sort()).toEqual(['description', 'requirements', 'responsibilities']);
  });

  it.each(['publish', 'draft'] as const)('accepts texts at the limit when %s', (mode) => {
    const atLimit = 'x'.repeat(JOB_TEXT_LIMIT);
    expect(errorsOf({ ...VALID, description: atLimit }, mode)).toEqual({});
  });

  it('counts the limit after trimming', () => {
    const padded = `  ${'x'.repeat(JOB_TEXT_LIMIT)}  `;
    expect(errorsOf({ ...VALID, description: padded }, 'publish')).toEqual({});
  });
});

describe('toJobPostBody', () => {
  it('converts the number strings and sets the status from the mode', () => {
    const publish = toJobPostBody(VALID, 'publish');
    expect(publish).toMatchObject({ openings: 3, salary_min: 18000, salary_max: 25000 });
    expect(publish.status).toBe('active');
    expect(toJobPostBody(VALID, 'draft').status).toBe('draft');
  });

  it('turns empty numbers and an empty deadline into null', () => {
    const body = toJobPostBody({ ...JOB_POST_DEFAULTS, title: 'Cook' }, 'draft');
    expect(body.openings).toBeNull();
    expect(body.salary_min).toBeNull();
    expect(body.salary_max).toBeNull();
    expect(body.application_deadline).toBeNull();
    expect(body.skills).toEqual([]);
  });

  it('trims strings and keeps the deadline', () => {
    const body = toJobPostBody(
      { ...VALID, title: '  Sous Chef  ', description: ' Run the line. ', openings: ' 3 ' },
      'publish'
    );
    expect(body.title).toBe('Sous Chef');
    expect(body.description).toBe('Run the line.');
    expect(body.openings).toBe(3);
    expect(body.application_deadline).toBe('2999-12-31');
  });

  it('trims skills and removes blanks and repeats', () => {
    const body = toJobPostBody(
      { ...VALID, skills: ['Grilling', ' Grilling ', 'grilling', '', 'Baking', '  '] },
      'publish'
    );
    expect(body.skills).toEqual(['Grilling', 'Baking']);
  });
});

describe('jobPostToday', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a YYYY-MM-DD string', () => {
    expect(jobPostToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('uses the local calendar day, not the UTC day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 23, 59, 0));
    expect(jobPostToday()).toBe('2026-01-05');
    vi.setSystemTime(new Date(2026, 0, 6, 0, 1, 0));
    expect(jobPostToday()).toBe('2026-01-06');
  });
});
