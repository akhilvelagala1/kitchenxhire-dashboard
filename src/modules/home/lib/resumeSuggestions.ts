import type { ResumeWizardFormValues, WorkExperienceEntry } from '../schemas/jobSeekerResumeWizard';

const QUALIFICATION_SKILLS: Record<string, string[]> = {
  'Below 10th': ['Kitchen helper', 'Cleaning', 'Dishwashing', 'Food prep', 'Vegetable cutting'],
  '10th pass': ['Kitchen helper', 'Food prep', 'Vegetable cutting', 'Cleaning', 'Serving'],
  '12th pass': ['Food prep', 'Customer service', 'Hygiene', 'Kitchen helper', 'Billing'],
  Graduation: ['Customer service', 'Hygiene', 'Inventory', 'Kitchen helper', 'Food prep']
};

const JOB_SKILLS: Record<string, string[]> = {
  cook: ['Basic cooking', 'South Indian cooking', 'Bulk cooking', 'Hygiene'],
  chef: ['Basic cooking', 'South Indian cooking', 'Tandoor', 'Hygiene'],
  helper: ['Kitchen helper', 'Food prep', 'Cleaning', 'Dishwashing'],
  waiter: ['Serving', 'Customer service', 'Billing'],
  steward: ['Stewarding', 'Dishwashing', 'Cleaning', 'Hygiene'],
  clean: ['Cleaning', 'Dishwashing', 'Hygiene', 'Stewarding'],
  baker: ['Baking', 'Food prep', 'Hygiene'],
  delivery: ['Delivery', 'Packing', 'Customer service']
};

function unique(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function jobSkillHints(jobTitle: string): string[] {
  const needle = jobTitle.trim().toLowerCase();
  if (!needle) return [];
  return Object.entries(JOB_SKILLS).flatMap(([key, skills]) =>
    needle.includes(key) ? skills : []
  );
}

/** Four to five kitchen skills from qualification and job title. */
export function suggestResumeSkills(qualification: string, jobTitle = ''): string[] {
  const fromQualification = QUALIFICATION_SKILLS[qualification] ?? [
    'Kitchen helper',
    'Cleaning',
    'Dishwashing',
    'Food prep',
    'Vegetable cutting'
  ];
  return unique([...jobSkillHints(jobTitle), ...fromQualification]).slice(0, 5);
}

function suggestResumeSummary(values: ResumeWizardFormValues): string {
  const role = values.workHistory[0]?.jobTitle.trim() || 'kitchen';
  const place = values.workHistory[0]?.workplaceType.trim();
  const study = values.qualification || 'school';
  const city = values.city.split(',')[0]?.trim() || 'the city';
  const workplace = place ? ` at a ${place.toLowerCase()}` : '';
  return `${values.fullName || 'This candidate'} is a ${role.toLowerCase()} worker${workplace} (${study}) looking for kitchen work in ${city}.`;
}

function suggestJobDescription(job: WorkExperienceEntry, qualification: string): string {
  const role = job.jobTitle.trim().toLowerCase() || 'kitchen helper';
  const place = job.workplaceType.trim().toLowerCase() || 'restaurant';
  const study = qualification || 'school';
  return `Helps with daily ${role} work at a ${place}. Comfortable with kitchen tasks after ${study.toLowerCase()} studies.`;
}

export function applyResumeDerivedContent(values: ResumeWizardFormValues): ResumeWizardFormValues {
  const jobTitle = values.workHistory[0]?.jobTitle ?? '';
  const suggested = suggestResumeSkills(values.qualification, jobTitle);
  const skills = unique([...values.skills, ...suggested]).slice(0, 8);

  return {
    ...values,
    skills: skills.length > 0 ? skills : suggested,
    professionalSummary: suggestResumeSummary(values),
    workHistory: values.workHistory.map((job) => ({
      ...job,
      employmentType: job.employmentType || 'Full-time',
      description: suggestJobDescription(job, values.qualification)
    }))
  };
}
