import type { CityItem } from './jobTaxonomy';

/** Supported cities with abbreviations / aliases and localities. */
export const CITIES: CityItem[] = [
  {
    label: 'Hyderabad',
    state: 'Telangana',
    abbreviations: ['hyd', 'hyderabad', 'hdy', 'hye'],
    areas: ['Hitech City', 'Madhapur', 'Gachibowli', 'Banjara Hills', 'Secunderabad', 'Kondapur']
  },
  {
    label: 'Vijayawada',
    state: 'Andhra Pradesh',
    abbreviations: ['vij', 'vijayawada', 'vd'],
    areas: ['Auto Nagar', 'Benz Circle', 'Governorpet']
  },
  {
    label: 'Bengaluru',
    state: 'Karnataka',
    abbreviations: ['ban', 'bang', 'bengaluru', 'bengalooru', 'blr'],
    areas: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout']
  },
  {
    label: 'Chennai',
    state: 'Tamil Nadu',
    abbreviations: ['chen', 'chennai', 'madras', 'maa'],
    areas: ['T Nagar', 'Anna Nagar', 'Velachery', 'Adyar']
  },
  {
    label: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    abbreviations: ['viz', 'vizag', 'visakhapatnam', 'vskp'],
    areas: ['Dwaraka Nagar', 'MVP Colony', 'Gajuwaka']
  }
];
