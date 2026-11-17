import { PROFILE_OTHER_VALUE } from '../content/profileFormOptions';
import { skillsExperienceSchema } from './jobSeekerProfileWizard';

const validSkills = {
  primarySkills: 'Cooking, Food Preparation',
  currentRoleTitle: 'Commis Chef',
  lastEmployer: 'Grand Banquet Hotels'
};

describe('skillsExperienceSchema', () => {
  it('requires at least one skill', () => {
    const empty = skillsExperienceSchema.safeParse({
      ...validSkills,
      primarySkills: ''
    });
    expect(empty.success ? '' : empty.error.issues[0]?.message).toBe(
      'Please select at least one skill.'
    );
  });

  it('rejects more than 10 skills', () => {
    const tooMany = skillsExperienceSchema.safeParse({
      ...validSkills,
      primarySkills: [
        'Cooking',
        'Food Preparation',
        'Kitchen Hygiene',
        'Food Safety',
        'Baking',
        'Cleaning',
        'Dishwashing',
        'Inventory Handling',
        'Packaging',
        'Customer Service',
        'Cash Handling'
      ].join(', ')
    });
    expect(tooMany.success).toBe(false);
  });

  it('requires current role title', () => {
    const empty = skillsExperienceSchema.safeParse({
      ...validSkills,
      currentRoleTitle: ''
    });
    expect(empty.success ? '' : empty.error.issues[0]?.message).toBe(
      'Please select or enter your role.'
    );

    const otherEmpty = skillsExperienceSchema.safeParse({
      ...validSkills,
      currentRoleTitle: PROFILE_OTHER_VALUE
    });
    expect(otherEmpty.success ? '' : otherEmpty.error.issues[0]?.message).toBe(
      'Please select or enter your role.'
    );
  });

  it('accepts Other custom role and optional employer', () => {
    expect(
      skillsExperienceSchema.safeParse({
        primarySkills: 'Cooking',
        currentRoleTitle: 'Pastry Lead',
        lastEmployer: ''
      }).success
    ).toBe(true);
  });

  it('accepts a complete valid skills payload', () => {
    expect(skillsExperienceSchema.safeParse(validSkills).success).toBe(true);
  });
});
