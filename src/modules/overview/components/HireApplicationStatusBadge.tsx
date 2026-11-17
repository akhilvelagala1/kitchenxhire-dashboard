import { cn } from '@/shared/lib/cn';
import type { ApplicationStatus } from '../api/hireDashboardTypes';

const STYLES: Record<ApplicationStatus, { bg: string; text: string; label: string }> = {
  NEW: { bg: 'bg-[#E5F1FF]', text: 'text-[#2674D9]', label: 'New' },
  UNDER_REVIEW: { bg: 'bg-[#FFF1D5]', text: 'text-[#A96B12]', label: 'Under Review' },
  SHORTLISTED: { bg: 'bg-[#EDE8FF]', text: 'text-[#7443C5]', label: 'Shortlisted' },
  INTERVIEW: { bg: 'bg-[#FFF0E9]', text: 'text-[#E75A26]', label: 'Interview' },
  HIRED: { bg: 'bg-[#DDF7E9]', text: 'text-[#178A52]', label: 'Hired' },
  REJECTED: { bg: 'bg-[#FDE8E8]', text: 'text-[#D93636]', label: 'Rejected' }
};

export function HireApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const tone = STYLES[status];
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone.bg,
        tone.text
      )}
    >
      {tone.label}
    </span>
  );
}
