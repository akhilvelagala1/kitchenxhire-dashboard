import { describe, expect, it } from 'vitest';
import { emptyResumeWizardValues } from '../schemas/jobSeekerResumeWizard';
import { applyResumeDerivedContent, suggestResumeSkills } from './resumeSuggestions';

describe('resumeSuggestions', () => {
  it('suggests five simple skills for below 10th', () => {
    expect(suggestResumeSkills('Below 10th')).toHaveLength(5);
    expect(suggestResumeSkills('Below 10th')).toContain('Kitchen helper');
  });

  it('fills summary and job lines so the user does not type them', () => {
    const next = applyResumeDerivedContent({
      ...emptyResumeWizardValues,
      fullName: 'Ramesh',
      city: 'Hyderabad, Telangana',
      qualification: '10th pass',
      workHistory: [
        {
          jobTitle: 'Cook',
          workplaceType: 'Hotel',
          employmentType: 'Full-time',
          yearsOfExperience: '2',
          startDate: '2020-01',
          description: ''
        }
      ]
    });

    expect(next.professionalSummary).toMatch(/cook/i);
    expect(next.workHistory[0]?.description).toMatch(/hotel/i);
    expect(next.skills.length).toBeGreaterThanOrEqual(4);
  });
});
