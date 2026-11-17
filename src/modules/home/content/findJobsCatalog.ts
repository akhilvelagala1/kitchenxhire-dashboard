import type { ExperienceBand, FindJobListing, JobCategory, ShiftKind } from '../schemas/findJobs';
import type { EmploymentType } from '../schemas/home';

/** Mostly Hyderabad so the default city demo stays dense; other cities still appear. */
const AREAS = [
  'Hitech City, Hyderabad',
  'Madhapur, Hyderabad',
  'Gachibowli, Hyderabad',
  'Banjara Hills, Hyderabad',
  'Secunderabad, Hyderabad',
  'Kondapur, Hyderabad',
  'Jubilee Hills, Hyderabad',
  'Kukatpally, Hyderabad',
  'Koramangala, Bengaluru',
  'Indiranagar, Bengaluru',
  'T Nagar, Chennai',
  'Anna Nagar, Chennai',
  'Auto Nagar, Vijayawada',
  'Dwaraka Nagar, Visakhapatnam'
];

const COMPANIES = [
  'Cloud Kitchen Pvt. Ltd.',
  'Spice Route Restaurants',
  'Grand Banquet Hotels',
  'Fresh Crumb Bakery',
  'Metro Caterers India',
  'Urban Bites Café'
];

const EXPERIENCE_CYCLE: ExperienceBand[] = ['fresher', '1-2', '3-5', '5-plus'];

interface Template {
  title: string;
  category: JobCategory;
  place: string;
  type: EmploymentType;
  shiftKind: ShiftKind;
  shift: string;
  pay: string;
  salaryMin: number;
  salaryMax: number;
  searchText: string;
}

const TEMPLATES: Template[] = [
  {
    title: 'South Indian Cook',
    category: 'cook',
    place: 'Restaurant',
    type: 'Full-time',
    shiftKind: 'day',
    shift: 'Day Shift (9:00 AM – 6:00 PM)',
    pay: '₹22,000 – ₹28,000 / month',
    salaryMin: 22000,
    salaryMax: 28000,
    searchText: 'south indian cook chef restaurant full-time day'
  },
  {
    title: 'Kitchen Helper',
    category: 'kitchen-helper',
    place: 'Cloud Kitchen',
    type: 'Full-time',
    shiftKind: 'day',
    shift: 'Day Shift (7:00 AM – 4:00 PM)',
    pay: '₹14,000 – ₹18,000 / month',
    salaryMin: 14000,
    salaryMax: 18000,
    searchText: 'kitchen helper prep cloud kitchen full-time day'
  },
  {
    title: 'Waiter / Service Staff',
    category: 'waiter',
    place: 'Restaurant',
    type: 'Part-time',
    shiftKind: 'evening',
    shift: 'Evening Shift (4:00 PM – 11:00 PM)',
    pay: '₹12,000 – ₹16,000 / month',
    salaryMin: 12000,
    salaryMax: 16000,
    searchText: 'waiter service staff restaurant part-time evening'
  },
  {
    title: 'Bakery Assistant',
    category: 'bakery',
    place: 'Bakery & Café',
    type: 'Part-time',
    shiftKind: 'evening',
    shift: 'Evening Shift (2:00 PM – 10:00 PM)',
    pay: '₹10,000 – ₹14,000 / month',
    salaryMin: 10000,
    salaryMax: 14000,
    searchText: 'bakery assistant baker cafe part-time evening'
  },
  {
    title: 'Cleaning & Stewarding Staff',
    category: 'cleaning',
    place: 'Hotel',
    type: 'Full-time',
    shiftKind: 'night',
    shift: 'Night Shift (10:00 PM – 6:00 AM)',
    pay: '₹15,000 – ₹20,000 / month',
    salaryMin: 15000,
    salaryMax: 20000,
    searchText: 'cleaning stewarding hotel housekeeping night full-time'
  },
  {
    title: 'Restaurant Manager',
    category: 'restaurant-manager',
    place: 'Restaurant',
    type: 'Full-time',
    shiftKind: 'flexible',
    shift: 'Flexible Shift (hours agreed)',
    pay: '₹35,000 – ₹45,000 / month',
    salaryMin: 35000,
    salaryMax: 40000,
    searchText: 'restaurant manager hospitality full-time flexible'
  },
  {
    title: 'Kitchen Supervisor',
    category: 'kitchen-supervisor',
    place: 'Hotel',
    type: 'Full-time',
    shiftKind: 'rotational',
    shift: 'Rotational Shift (rotating roster)',
    pay: '₹28,000 – ₹36,000 / month',
    salaryMin: 28000,
    salaryMax: 36000,
    searchText: 'kitchen supervisor hotel full-time rotational'
  },
  {
    title: 'Barista',
    category: 'barista',
    place: 'Café',
    type: 'Part-time',
    shiftKind: 'day',
    shift: 'Day Shift (8:00 AM – 4:00 PM)',
    pay: '₹12,000 – ₹16,000 / month',
    salaryMin: 12000,
    salaryMax: 16000,
    searchText: 'barista cafe coffee part-time day'
  },
  {
    title: 'Delivery Executive',
    category: 'delivery',
    place: 'Cloud Kitchen',
    type: 'Contract',
    shiftKind: 'flexible',
    shift: 'Flexible Shift (delivery windows)',
    pay: '₹15,000 – ₹22,000 / month',
    salaryMin: 15000,
    salaryMax: 22000,
    searchText: 'delivery executive rider cloud kitchen contract flexible'
  },
  {
    title: 'Cashier',
    category: 'cashier',
    place: 'Restaurant',
    type: 'Full-time',
    shiftKind: 'evening',
    shift: 'Evening Shift (2:00 PM – 10:00 PM)',
    pay: '₹14,000 – ₹18,000 / month',
    salaryMin: 14000,
    salaryMax: 18000,
    searchText: 'cashier billing restaurant full-time evening'
  },
  {
    title: 'Dishwasher',
    category: 'dishwasher',
    place: 'Hotel',
    type: 'Temporary',
    shiftKind: 'night',
    shift: 'Night Shift (10:00 PM – 6:00 AM)',
    pay: '₹10,000 – ₹13,000 / month',
    salaryMin: 10000,
    salaryMax: 13000,
    searchText: 'dishwasher steward temporary night hotel'
  },
  {
    title: 'Store / Inventory Staff',
    category: 'store',
    place: 'Hotel',
    type: 'Contract',
    shiftKind: 'day',
    shift: 'Day Shift (9:00 AM – 6:00 PM)',
    pay: '₹16,000 – ₹22,000 / month',
    salaryMin: 16000,
    salaryMax: 22000,
    searchText: 'store inventory stock hotel contract day'
  },
  {
    title: 'Security Staff',
    category: 'security',
    place: 'Hotel',
    type: 'Full-time',
    shiftKind: 'rotational',
    shift: 'Rotational Shift (security roster)',
    pay: '₹14,000 – ₹19,000 / month',
    salaryMin: 14000,
    salaryMax: 19000,
    searchText: 'security staff hotel full-time rotational'
  },
  {
    title: 'Continental Cook',
    category: 'cook',
    place: 'Hotel',
    type: 'Full-time',
    shiftKind: 'evening',
    shift: 'Evening Shift (2:00 PM – 11:00 PM)',
    pay: '₹26,000 – ₹32,000 / month',
    salaryMin: 26000,
    salaryMax: 32000,
    searchText: 'continental cook chef hotel full-time evening'
  }
];

/** Anchor so Date Posted windows stay meaningful in the prototype catalog. */
export const FIND_JOBS_DEMO_NOW_MS = Date.UTC(2026, 10, 15, 12, 0, 0);

/** Prototype-scale list for client-side search, filters, and pagination. */
export const FIND_JOBS_CATALOG: FindJobListing[] = Array.from({ length: 126 }, (_, index) => {
  // Different strides so every template/experience can appear in Hyderabad and other cities.
  const template = TEMPLATES[index % TEMPLATES.length]!;
  const area = AREAS[(index * 5) % AREAS.length]!;
  const company = COMPANIES[index % COMPANIES.length]!;
  const experience = EXPERIENCE_CYCLE[(index * 3) % EXPERIENCE_CYCLE.length]!;
  const suffix = index >= TEMPLATES.length ? ` ${Math.floor(index / TEMPLATES.length) + 1}` : '';
  const title = `${template.title}${suffix}`.trim();

  return {
    id: `find-job-${index + 1}`,
    title,
    type: template.type,
    place: template.place,
    area,
    shift: template.shift,
    pay: template.pay,
    searchText: `${template.searchText} ${area.toLowerCase()} ${company.toLowerCase()} ${title.toLowerCase()}`,
    company,
    verified: index % 3 !== 1,
    category: template.category,
    shiftKind: template.shiftKind,
    salaryMin: Math.min(40000, template.salaryMin + (index % 4) * 500),
    salaryMax: Math.min(40000, template.salaryMax + (index % 5) * 400),
    experience,
    // Newest first: half-day steps so 24h / 3d / 7d / 30d windows all have matches.
    postedAt: new Date(FIND_JOBS_DEMO_NOW_MS - index * 12 * 60 * 60 * 1000).toISOString()
  };
});
