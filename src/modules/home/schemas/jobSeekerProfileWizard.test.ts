import { PROFILE_OTHER_VALUE } from '../content/profileFormOptions';
import { basicDetailsSchema } from './jobSeekerProfileWizard';

const validBasic = {
  fullName: 'Akhil Velagala',
  mobile: '+91 98765 43210',
  city: 'Hyderabad, Telangana',
  preferredRole: 'Cook / Chef',
  workExperience: 'Fresher',
  expectedSalary: '₹18,000 - ₹25,000'
};

describe('basicDetailsSchema', () => {
  it('rejects empty, short, numeric, and symbol-only names', () => {
    expect(basicDetailsSchema.safeParse({ ...validBasic, fullName: '' }).success).toBe(false);
    expect(basicDetailsSchema.safeParse({ ...validBasic, fullName: '   ' }).success).toBe(false);
    expect(basicDetailsSchema.safeParse({ ...validBasic, fullName: '1' }).success).toBe(false);
    expect(basicDetailsSchema.safeParse({ ...validBasic, fullName: '12345' }).success).toBe(false);
    expect(basicDetailsSchema.safeParse({ ...validBasic, fullName: '@@@@' }).success).toBe(false);
    expect(basicDetailsSchema.safeParse({ ...validBasic, fullName: 'gggg' }).success).toBe(true);

    const empty = basicDetailsSchema.safeParse({ ...validBasic, fullName: '' });
    expect(empty.success ? '' : empty.error.issues[0]?.message).toBe('Please enter your full name');
    const bad = basicDetailsSchema.safeParse({ ...validBasic, fullName: '12345' });
    expect(bad.success ? '' : bad.error.issues[0]?.message).toBe('Please enter a valid full name');
  });

  it('accepts letter names with spaces', () => {
    expect(basicDetailsSchema.safeParse({ ...validBasic, fullName: 'Akhil' }).success).toBe(true);
    expect(basicDetailsSchema.safeParse({ ...validBasic, fullName: 'Mary Anne' }).success).toBe(
      true
    );
  });

  it('requires verified mobile and option selects', () => {
    const noMobile = basicDetailsSchema.safeParse({ ...validBasic, mobile: '' });
    expect(noMobile.success ? '' : noMobile.error.issues[0]?.message).toBe(
      'Please verify your mobile number'
    );

    const noCity = basicDetailsSchema.safeParse({ ...validBasic, city: '' });
    expect(noCity.success ? '' : noCity.error.issues[0]?.message).toBe(
      'Please select your current city or location'
    );

    const otherSentinel = basicDetailsSchema.safeParse({
      ...validBasic,
      city: PROFILE_OTHER_VALUE
    });
    expect(otherSentinel.success).toBe(false);

    const noRole = basicDetailsSchema.safeParse({ ...validBasic, preferredRole: '' });
    expect(noRole.success ? '' : noRole.error.issues[0]?.message).toBe(
      'Please select your preferred job role'
    );

    const noExp = basicDetailsSchema.safeParse({ ...validBasic, workExperience: '' });
    expect(noExp.success ? '' : noExp.error.issues[0]?.message).toBe(
      'Please select your work experience'
    );

    const noPay = basicDetailsSchema.safeParse({ ...validBasic, expectedSalary: '' });
    expect(noPay.success ? '' : noPay.error.issues[0]?.message).toBe(
      'Please select your expected salary range'
    );
  });

  it('validates Other preferred role: required, 2–50 chars, not spaces-only', () => {
    const emptyOther = basicDetailsSchema.safeParse({
      ...validBasic,
      preferredRole: PROFILE_OTHER_VALUE
    });
    expect(emptyOther.success ? '' : emptyOther.error.issues[0]?.message).toBe(
      'Please enter your preferred job role.'
    );

    expect(basicDetailsSchema.safeParse({ ...validBasic, preferredRole: '   ' }).success).toBe(
      false
    );
    expect(basicDetailsSchema.safeParse({ ...validBasic, preferredRole: 'A' }).success).toBe(false);
    expect(
      basicDetailsSchema.safeParse({ ...validBasic, preferredRole: 'Italian Chef' }).success
    ).toBe(true);
    expect(
      basicDetailsSchema.safeParse({
        ...validBasic,
        preferredRole: 'x'.repeat(51)
      }).success
    ).toBe(false);
  });

  it('validates Other expected salary: digits only, not zero', () => {
    const emptyOther = basicDetailsSchema.safeParse({
      ...validBasic,
      expectedSalary: PROFILE_OTHER_VALUE
    });
    expect(emptyOther.success ? '' : emptyOther.error.issues[0]?.message).toBe(
      'Please enter a valid expected salary.'
    );

    expect(basicDetailsSchema.safeParse({ ...validBasic, expectedSalary: '0' }).success).toBe(
      false
    );
    expect(basicDetailsSchema.safeParse({ ...validBasic, expectedSalary: 'abc' }).success).toBe(
      false
    );
    expect(basicDetailsSchema.safeParse({ ...validBasic, expectedSalary: '80000' }).success).toBe(
      true
    );
  });

  it('accepts custom Other values for city, role, and salary', () => {
    expect(
      basicDetailsSchema.safeParse({
        ...validBasic,
        city: 'Vijayawada, Andhra Pradesh',
        preferredRole: 'Tandoor Cook',
        expectedSalary: '80000'
      }).success
    ).toBe(true);
  });

  it('accepts a complete valid basic details payload', () => {
    expect(basicDetailsSchema.safeParse(validBasic).success).toBe(true);
  });
});
