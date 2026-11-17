import type {
  RecruiterApplicationStatus,
  RecruiterInboundApplication
} from '../schemas/recruiterApplication';
import { DEMO_RECRUITER_JOBS } from './demoRecruiterJobs';

const FIRST_NAMES = [
  'Ramesh',
  'Suresh',
  'Anita',
  'Venkatesh',
  'Priya',
  'Karthik',
  'Lakshmi',
  'Arjun',
  'Deepa',
  'Manoj',
  'Sneha',
  'Ravi',
  'Kavya',
  'Naveen',
  'Pooja'
] as const;

const LAST_NAMES = [
  'Kumar',
  'Prasad',
  'Reddy',
  'Rao',
  'Sharma',
  'Nair',
  'Patel',
  'Singh',
  'Iyer',
  'Gupta',
  'Mehta',
  'Das',
  'Verma',
  'Joshi',
  'Choudhary'
] as const;

const STATUS_CYCLE: RecruiterApplicationStatus[] = [
  'new',
  'under-review',
  'selected',
  'rejected',
  'shortlisted',
  'interview',
  'hired',
  'under-review'
];

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function appliedAtDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

function daysBefore(iso: string, days: number) {
  const date = new Date(iso);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const LOCATIONS = [
  'Hyderabad',
  'Hitech City, Hyderabad',
  'Madhapur, Hyderabad',
  'Secunderabad',
  'Gachibowli, Hyderabad',
  'Banjara Hills, Hyderabad',
  'Kondapur, Hyderabad'
] as const;

const EXPERIENCE = ['No Experience', '1 Year', '2 Years', '3 Years', '5 Years'] as const;

function candidateMeta(index: number) {
  return {
    age: 22 + (index % 14),
    gender: index % 3 === 0 ? 'Female' : 'Male',
    location: LOCATIONS[index % LOCATIONS.length]!,
    experience: EXPERIENCE[index % EXPERIENCE.length]!
  };
}

// --- Candidate profile / resume mock data (deterministic, index-seeded) ---

const EDU_LEVELS = ['10th Pass', '12th Pass', 'ITI Certificate', 'Diploma', 'Graduate'] as const;

const SKILL_POOLS: Record<string, readonly string[]> = {
  Kitchen: [
    'Kitchen Cleaning',
    'Food Prep',
    'Hygiene & Safety',
    'Waste Management',
    'Knife Handling',
    'Inventory Stocking'
  ],
  Service: [
    'Customer Service',
    'Billing',
    'Table Service',
    'POS Handling',
    'Order Taking',
    'Guest Relations'
  ],
  Bakery: [
    'Baking',
    'Dough Preparation',
    'Inventory Management',
    'Cake Decoration',
    'Oven Handling'
  ],
  Delivery: ['Route Planning', 'Order Handling', 'Customer Communication', 'Time Management']
};

const EMPLOYER_POOL = [
  'Cloud Kitchen Pvt. Ltd.',
  'Spice Route Restaurant',
  'Urban Bites Café',
  'Green Leaf Caterers',
  'Royal Treat Banquets',
  'Sunrise Foods & Bakery'
] as const;

const INSTITUTION_POOL = [
  'Board of Intermediate Education, Telangana',
  'Government Polytechnic College',
  'District Vocational Training Institute',
  'State Board of Secondary Education',
  'Government ITI'
] as const;

const EXPERIENCE_YEARS: Record<string, number> = {
  'No Experience': 0,
  '1 Year': 1,
  '2 Years': 2,
  '3 Years': 3,
  '5 Years': 5
};

const PROFILE_SUMMARY_TEMPLATES: Array<(role: string, expPhrase: string) => string> = [
  (role, exp) =>
    `Experienced ${role} with ${exp} in restaurant and hotel environments. Skilled in maintaining hygiene standards and efficient service.`,
  (role, exp) =>
    `Reliable ${role} with ${exp} in fast-paced kitchens and dining floors. Known for punctuality, teamwork, and consistent quality.`,
  (role, exp) =>
    `Dedicated ${role} with ${exp}, focused on guest satisfaction and smooth service during busy shifts.`,
  (role, exp) =>
    `Hardworking ${role} with ${exp} across cafes, restaurants, and catering kitchens. Comfortable working under pressure.`
];

function experiencePhrase(experience: string) {
  return experience === 'No Experience' ? 'no prior experience' : `${experience} of experience`;
}

function jobCategoryForId(jobId: string) {
  return DEMO_RECRUITER_JOBS.find((job) => job.id === jobId)?.category ?? 'Kitchen';
}

function skillsFor(category: string, index: number): string[] {
  const pool = SKILL_POOLS[category] ?? SKILL_POOLS.Kitchen!;
  const count = 3 + (index % 2);
  const start = index % pool.length;
  const picked: string[] = [];
  for (let k = 0; k < count; k += 1) {
    picked.push(pool[(start + k) % pool.length]!);
  }
  return picked;
}

function phoneDigits(seed: number) {
  let value = seed;
  let digits = '';
  for (let k = 0; k < 9; k += 1) {
    value = (value * 9301 + 49297) % 233280;
    digits += String(value % 10);
  }
  return digits;
}

function phoneFor(index: number) {
  const digits = phoneDigits(index);
  return `+91 9${digits.slice(0, 4)} ${digits.slice(4, 9)}`;
}

function emailFor(candidateName: string) {
  const slug = candidateName.trim().toLowerCase().split(/\s+/).join('.');
  return `${slug}@example.com`;
}

function workHistoryFor(index: number, jobTitle: string, experience: string, appliedAt: string) {
  const employer = EMPLOYER_POOL[index % EMPLOYER_POOL.length]!;
  const years = EXPERIENCE_YEARS[experience] ?? 1;
  const endDate = daysBefore(appliedAt, 7 + (index % 10));
  const start = new Date(endDate);
  if (years > 0) {
    start.setFullYear(start.getFullYear() - years);
  } else {
    start.setMonth(start.getMonth() - 3);
  }
  const title = years > 0 ? jobTitle : `${jobTitle} Trainee`;
  return [{ title, employer, startDate: start.toISOString(), endDate }];
}

function educationFor(index: number, age: number, appliedAt: string) {
  const institution = INSTITUTION_POOL[index % INSTITUTION_POOL.length]!;
  const appliedYear = new Date(appliedAt).getFullYear();
  const graduationAge = 18 + (index % 4);
  const year = appliedYear - Math.max(age - graduationAge, 1);
  return [{ institution, year: String(year) }];
}

function candidateProfile(
  index: number,
  candidateName: string,
  jobId: string,
  jobTitle: string,
  age: number,
  experience: string,
  appliedAt: string
) {
  const category = jobCategoryForId(jobId);
  const expPhrase = experiencePhrase(experience);
  const summaryTemplate = PROFILE_SUMMARY_TEMPLATES[index % PROFILE_SUMMARY_TEMPLATES.length]!;
  const profileSummary = summaryTemplate(jobTitle, expPhrase);

  return {
    phone: phoneFor(index),
    email: emailFor(candidateName),
    profileSummary,
    educationLevel: EDU_LEVELS[index % EDU_LEVELS.length]!,
    skills: skillsFor(category, index),
    resumeFileName: `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`,
    resumeFileSizeKb: 150 + ((index * 17) % 451),
    resumeUpdatedAt: daysBefore(appliedAt, 1 + (index % 2)),
    resumeSummary: `${profileSummary} Available to join immediately.`,
    workHistory: workHistoryFor(index, jobTitle, experience, appliedAt),
    education: educationFor(index, age, appliedAt)
  };
}

function buildRow(
  id: string,
  candidateName: string,
  initialsValue: string,
  avatarHue: number,
  jobId: string,
  jobTitle: string,
  daysAgo: number,
  status: RecruiterApplicationStatus,
  index: number
): RecruiterInboundApplication {
  const appliedAt = appliedAtDaysAgo(daysAgo);
  const meta = candidateMeta(index);
  return {
    id,
    candidateName,
    initials: initialsValue,
    avatarHue,
    jobId,
    jobTitle,
    appliedAt,
    status,
    ...meta,
    ...candidateProfile(index, candidateName, jobId, jobTitle, meta.age, meta.experience, appliedAt)
  };
}

function buildSeedApplications(): RecruiterInboundApplication[] {
  const rows: RecruiterInboundApplication[] = [
    buildRow('rec-app-1', 'Ramesh Kumar', 'RK', 24, 'rec-job-1', 'Cook / Chef', 2, 'new', 1),
    buildRow(
      'rec-app-2',
      'Suresh Prasad',
      'SP',
      198,
      'rec-job-2',
      'Kitchen Helper',
      3,
      'under-review',
      2
    ),
    buildRow(
      'rec-app-3',
      'Anita Reddy',
      'AR',
      280,
      'rec-job-3',
      'Waiter / Service Staff',
      4,
      'selected',
      3
    ),
    buildRow('rec-app-4', 'Venkatesh Rao', 'VR', 142, 'rec-job-4', 'Bakery Staff', 5, 'rejected', 4)
  ];

  for (let i = 5; i <= 86; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length]!;
    const job = DEMO_RECRUITER_JOBS[i % DEMO_RECRUITER_JOBS.length]!;
    const candidateName = `${first} ${last}`;
    rows.push(
      buildRow(
        `rec-app-${i}`,
        candidateName,
        initials(first, last),
        (i * 37) % 360,
        job.id,
        job.title,
        i % 28,
        STATUS_CYCLE[i % STATUS_CYCLE.length]!,
        i
      )
    );
  }

  return rows.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
}

export const DEMO_RECRUITER_APPLICATIONS = buildSeedApplications();
