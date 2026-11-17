import type { Job } from '../schemas/home';
import { TEMPLATES, describeJob, responsibilitiesFor, skillsFor } from './jobTemplates';

/**
 * Prototype-scale sample jobs for the homepage search and "Recently posted jobs" strip.
 *
 * Each template generates three postings in Hyderabad (the flagship city) plus one each in
 * three other cities, so every category search returns 6+ jobs and every city search returns
 * 8+ jobs. Local data only (UI-13) — a search API replaces this list, the components stay.
 */

/** Rotating Hyderabad localities for the two non-flagship postings. Never "Madhapur" — that
 * stays unique to Kitchen Helper's flagship posting so city search for it stays exact. */
const OTHER_HYD_AREAS = [
  'Kondapur, Hyderabad',
  'Secunderabad, Hyderabad',
  'Banjara Hills, Hyderabad',
  'Gachibowli, Hyderabad',
  'Hitech City, Hyderabad',
  'Jubilee Hills, Hyderabad',
  'Charminar, Hyderabad'
];
const OTHER_CITIES = ['Vijayawada', 'Chennai', 'Visakhapatnam', 'Bengaluru'];
const SHIFTS = [
  'Day Shift (9:00 AM – 6:00 PM)',
  'Evening Shift (3:00 PM – 11:00 PM)',
  'Rotational Shift (10:00 AM – 7:00 PM)',
  'Night Shift (10:00 PM – 6:00 AM)',
  'Day Shift (6:00 AM – 2:00 PM)'
];

function pay(min: number, max: number): string {
  return `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')} / month`;
}

/** Posting 0 keeps the template's own title; later postings get a short distinguishing suffix. */
function titleFor(title: string, postingIndex: number): string {
  const SUFFIXES = ['', ' II', ' III', ' (Branch)', ' (New Outlet)', ' (Associate)'];
  return `${title}${SUFFIXES[postingIndex] ?? ''}`;
}

function buildJob(template: (typeof TEMPLATES)[number], postingIndex: number, area: string): Job {
  const title = titleFor(template.title, postingIndex);
  const shift = SHIFTS[postingIndex % SHIFTS.length]!;
  const payMin = template.payMin - postingIndex * 500;
  const payMax = template.payMax - postingIndex * 500;
  return {
    id: `${template.query}-${postingIndex}`,
    title,
    type: template.type,
    place: template.place,
    area,
    shift,
    pay: pay(payMin, payMax),
    // Same ratio the Find Jobs catalog already uses for its "Verified employer" badge.
    verified: postingIndex % 3 !== 1,
    description: describeJob(template),
    responsibilities: responsibilitiesFor(template),
    skills: skillsFor(template),
    searchText:
      `${title} ${template.category} ${template.cuisine} ${template.specialization} ${template.extra} ${template.place} ${area} ${template.type} ${template.query}`.toLowerCase()
  };
}

export const JOBS: Job[] = TEMPLATES.flatMap((template, catIndex) => {
  const hyderabadAreas = [
    template.area0,
    OTHER_HYD_AREAS[catIndex % OTHER_HYD_AREAS.length]!,
    OTHER_HYD_AREAS[(catIndex + 1) % OTHER_HYD_AREAS.length]!
  ];
  const hyderabadJobs = hyderabadAreas.map((area, n) => buildJob(template, n, area));
  const otherCityJobs = OTHER_CITIES.map((city, n) => buildJob(template, n + 3, city));
  return [...hyderabadJobs, ...otherCityJobs];
});
