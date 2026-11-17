import type { EmploymentType } from '../schemas/home';
import type { DatePostedWindow, ExperienceBand, JobCategory, ShiftKind } from '../schemas/findJobs';

export const JOB_CATEGORY_OPTIONS: { id: JobCategory; label: string }[] = [
  { id: 'cook', label: 'Cook / Chef' },
  { id: 'kitchen-helper', label: 'Kitchen Helper' },
  { id: 'waiter', label: 'Waiter / Service Staff' },
  { id: 'bakery', label: 'Bakery Staff' },
  { id: 'cleaning', label: 'Cleaning / Stewarding' },
  { id: 'restaurant-manager', label: 'Restaurant Manager' },
  { id: 'kitchen-supervisor', label: 'Kitchen Supervisor' },
  { id: 'barista', label: 'Barista' },
  { id: 'delivery', label: 'Delivery Executive' },
  { id: 'cashier', label: 'Cashier' },
  { id: 'dishwasher', label: 'Dishwasher' },
  { id: 'store', label: 'Store / Inventory Staff' },
  { id: 'security', label: 'Security Staff' }
];

export const EMPLOYMENT_TYPE_OPTIONS: { id: EmploymentType; label: string }[] = [
  { id: 'Full-time', label: 'Full-time' },
  { id: 'Part-time', label: 'Part-time' },
  { id: 'Contract', label: 'Contract' },
  { id: 'Temporary', label: 'Temporary / Daily Work' }
];

export const SHIFT_OPTIONS: { id: ShiftKind; label: string; hint: string }[] = [
  { id: 'day', label: 'Day Shift', hint: '6 AM – 6 PM' },
  { id: 'evening', label: 'Evening Shift', hint: '2 PM – 10 PM' },
  { id: 'night', label: 'Night Shift', hint: '10 PM – 6 AM' },
  { id: 'flexible', label: 'Flexible Shift', hint: 'Hours agreed with employer' },
  { id: 'rotational', label: 'Rotational Shift', hint: 'Rotating day / evening / night' }
];

export const EXPERIENCE_OPTIONS: { id: ExperienceBand; label: string }[] = [
  { id: 'fresher', label: 'Fresher' },
  { id: '1-2', label: '1–2 Years' },
  { id: '3-5', label: '3–5 Years' },
  { id: '5-plus', label: '5+ Years' }
];

export const DATE_POSTED_OPTIONS: { id: DatePostedWindow; label: string }[] = [
  { id: '24h', label: 'Last 24 hours' },
  { id: '3d', label: 'Last 3 days' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' }
];

export const SORT_OPTIONS = [
  { id: 'relevant' as const, label: 'Most Relevant' },
  { id: 'latest' as const, label: 'Latest Jobs' },
  { id: 'oldest' as const, label: 'Oldest Jobs' },
  { id: 'salary-high' as const, label: 'Salary – High to Low' },
  { id: 'salary-low' as const, label: 'Salary – Low to High' }
];

export const TRUST_ITEMS = [
  {
    title: 'Industrial Best Practices',
    description: 'A safer, fairer and more transparent hiring experience.'
  },
  {
    title: 'Verified Employers',
    description: 'Work with trusted food businesses.'
  },
  {
    title: 'Transparent Pay',
    description: 'Clear salary and job details.'
  },
  {
    title: 'Defined Shifts',
    description: 'Know your work hours upfront.'
  },
  {
    title: 'Fair Opportunity',
    description: 'Equal and inclusive hiring for all.'
  }
] as const;
