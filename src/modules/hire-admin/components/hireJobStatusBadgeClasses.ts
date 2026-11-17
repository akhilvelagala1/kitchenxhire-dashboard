import type { HireJobStatus } from '../schemas/adminJob';

/** Soft status pills from the Jobs redesign reference. */
const MAP: Record<HireJobStatus, string> = {
  active: 'bg-[#D9F9E3] text-[#087A36]',
  under_review: 'bg-[#FFF0C9] text-[#A45B00]',
  paused: 'bg-[#E9EDF2] text-[#475569]',
  closed: 'bg-[#FFE2E2] text-[#C62828]',
  draft: 'bg-[#EDE4FF] text-[#5B21B6]'
};

export function hireJobStatusLabel(s: HireJobStatus): string {
  if (s === 'under_review') return 'Under Review';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function hireJobStatusClass(s: HireJobStatus): string {
  return MAP[s] ?? MAP.active;
}
