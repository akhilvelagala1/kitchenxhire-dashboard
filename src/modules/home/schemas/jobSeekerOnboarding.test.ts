import { jobSeekerCandidateSchema, jobSeekerFullNameSchema } from './jobSeekerOnboarding';

describe('jobSeekerFullNameSchema', () => {
  it('rejects empty, whitespace-only, short, and number-only names', () => {
    expect(jobSeekerFullNameSchema.safeParse('').success).toBe(false);
    expect(jobSeekerFullNameSchema.safeParse('   ').success).toBe(false);
    expect(jobSeekerFullNameSchema.safeParse('A').success).toBe(false);
    expect(jobSeekerFullNameSchema.safeParse('12345').success).toBe(false);
    expect(jobSeekerFullNameSchema.safeParse('@@@@').success).toBe(false);
    expect(jobSeekerFullNameSchema.safeParse('').error?.issues[0]?.message).toBe(
      'Please enter your full name'
    );
    expect(jobSeekerFullNameSchema.safeParse('12345').error?.issues[0]?.message).toBe(
      'Please enter a valid full name'
    );
  });

  it('accepts letter names with spaces, hyphens, and apostrophes', () => {
    expect(jobSeekerFullNameSchema.safeParse('Ravi Teja').success).toBe(true);
    expect(jobSeekerFullNameSchema.safeParse("O'Brien").success).toBe(true);
    expect(jobSeekerFullNameSchema.safeParse('Mary-Jane').success).toBe(true);
  });
});

describe('jobSeekerCandidateSchema', () => {
  it('requires category and city while allowing empty optional fields', () => {
    const missing = jobSeekerCandidateSchema.safeParse({
      fullName: 'Ravi Teja',
      preferredRole: '',
      city: ''
    });
    expect(missing.success).toBe(false);
    const messages = missing.success ? [] : missing.error.issues.map((issue) => issue.message);
    expect(messages).toContain('Please select a job category');
    expect(messages).toContain('Please select your city or location');

    const ok = jobSeekerCandidateSchema.safeParse({
      fullName: 'Ravi Teja',
      preferredRole: 'Kitchen Helper',
      city: 'Hyderabad'
    });
    expect(ok.success).toBe(true);
  });
});
