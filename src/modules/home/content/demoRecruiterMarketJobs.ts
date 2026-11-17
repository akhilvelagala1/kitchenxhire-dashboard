export interface RecruiterMarketJobListing {
  id: string;
  title: string;
  companyName: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  employmentType: 'Full-time' | 'Part-time';
  category: 'chef' | 'helper' | 'bakery';
}

export const DEMO_RECRUITER_MARKET_JOBS: RecruiterMarketJobListing[] = [
  {
    id: 'market-1',
    title: 'Cook / Chef',
    companyName: 'Cloud Kitchen Pvt. Ltd.',
    location: 'HiTech City, Hyderabad',
    salaryMin: 22000,
    salaryMax: 28000,
    employmentType: 'Full-time',
    category: 'chef'
  },
  {
    id: 'market-2',
    title: 'Kitchen Helper',
    companyName: 'Restaurant & Café',
    location: 'Madhapur, Hyderabad',
    salaryMin: 14000,
    salaryMax: 18000,
    employmentType: 'Full-time',
    category: 'helper'
  },
  {
    id: 'market-3',
    title: 'Bakery Assistant',
    companyName: 'Bakery & Café',
    location: 'Banjara Hills, Hyderabad',
    salaryMin: 10000,
    salaryMax: 14000,
    employmentType: 'Part-time',
    category: 'bakery'
  }
];
