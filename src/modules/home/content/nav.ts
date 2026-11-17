import { FacebookIcon, InstagramIcon, LinkedInIcon } from '../components/SocialIcons';
import type { FooterColumn, NavLinkItem } from '../schemas/home';

export const DEFAULT_CITY = 'Hyderabad';

export const CITIES = [
  'Hyderabad',
  'Secunderabad',
  'Hitech City',
  'Madhapur',
  'Banjara Hills',
  'Gachibowli',
  'Kondapur',
  'Bengaluru',
  'Vijayawada',
  'Chennai',
  'Visakhapatnam'
];

export const SOCIAL_LINKS = [
  { label: 'LinkedIn', Icon: LinkedInIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'Facebook', Icon: FacebookIcon }
];

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Find Jobs', target: 'jobs' },
  { label: 'Find Workers', target: 'roles' },
  { label: 'For Businesses', target: 'businesses' },
  { label: 'How it Works', target: 'how' }
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'For Job Seekers',
    links: [
      { label: 'Browse Jobs', target: 'jobs' },
      { label: 'Create Profile', target: 'how', flow: 'seeker' },
      { label: 'Saved Jobs', target: 'jobs' },
      { label: 'Career Tips', target: 'stories' }
    ]
  },
  {
    title: 'For Employers',
    links: [
      { label: 'Post a Vacancy', target: 'how', flow: 'employer' },
      { label: 'Manage Applicants', target: 'roles' },
      { label: 'Hiring Guide', target: 'how', flow: 'employer' },
      { label: 'Employer Support', target: 'match' }
    ]
  },
  {
    title: 'KitchenX',
    links: [
      { label: 'About KitchenX Hiring', target: 'how' },
      { label: 'About Us', target: 'stories' },
      { label: 'Resources', target: 'roles' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', target: 'how' },
      { label: 'Contact Us', target: 'stories' },
      { label: 'FAQs', target: 'how' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Use', target: 'top' },
      { label: 'Privacy Policy', target: 'top' },
      { label: 'Employer Guidelines', target: 'how', flow: 'employer' }
    ]
  }
];
