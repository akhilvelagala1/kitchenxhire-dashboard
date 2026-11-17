import type { LucideIcon } from 'lucide-react';

export type FlowKey = 'seeker' | 'employer';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';

export interface Job {
  id: string;
  title: string;
  type: EmploymentType;
  place: string;
  area: string;
  shift: string;
  pay: string;
  company?: string;
  /** Shows a "Verified" badge next to the company name when true. */
  verified?: boolean;
  /** Shown in the job details modal when present; omitted there otherwise. */
  description?: string;
  responsibilities?: string[];
  skills?: string[];
  /** Lowercase index text the search matches against. A search API replaces it. */
  searchText: string;
}

export interface Role {
  query: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface Feature {
  titleLines: string[];
  description: string;
  icon: LucideIcon;
}

export interface Business {
  title: string;
  description: string;
  image: string;
  alt: string;
}

export interface Step {
  title: string;
  description: string;
  image: string;
  alt: string;
}

export interface ValueCard {
  title: string;
  description: string;
  image: string;
  alt: string;
  icon: LucideIcon;
}

export interface Story {
  quote: string;
  name: string;
  role: string;
  pill: string;
  photo: string;
}

export interface NavLinkItem {
  label: string;
  target: 'jobs' | 'roles' | 'businesses' | 'how';
}

interface FooterLink {
  label: string;
  target: string;
  flow?: FlowKey;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}
