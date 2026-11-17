import { cn } from '@/shared/lib/cn';
import { RECRUITER_STATUS_LABELS, type RecruiterStatus } from '../schemas/adminRecruiter';

/** Soft status pills from the Recruiter Management reference. */
const TONES: Record<RecruiterStatus, string> = {
  active: 'bg-[#DCFCE7] text-[#15803D]',
  inactive: 'bg-[#EEF1F5] text-[#475569]',
  pending: 'bg-[#FEF3C7] text-[#A16207]',
  suspended: 'bg-[#FEE2E2] text-[#DC2626]'
};

export function RecruiterStatusBadge({
  status,
  className
}: {
  status: RecruiterStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5.5 items-center rounded-full px-3 text-[11.5px] font-bold whitespace-nowrap',
        TONES[status],
        className
      )}
    >
      {RECRUITER_STATUS_LABELS[status]}
    </span>
  );
}
