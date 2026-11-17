import { cn } from '@/shared/lib/cn';
import { APPLICATION_STATUS_LABELS, type HireApplicationStatus } from '../schemas/adminApplication';

const TONES: Record<HireApplicationStatus, string> = {
  pending_review: 'bg-[#E9EDF2] text-[#475569]',
  reviewed: 'bg-[#DCFCE7] text-[#08783B]',
  shortlisted: 'bg-[#F1EAFE] text-[#6D28D9]',
  interview_scheduled: 'bg-[#FFF0D1] text-[#9A5700]',
  hired: 'bg-[#DBEAFE] text-[#1554B4]',
  rejected: 'bg-[#FEE2E2] text-[#B42318]'
};

/** Soft status pills sized to the Applications table reference. */
export function ApplicationStatusBadge({
  status,
  className
}: {
  status: HireApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-[23px] items-center rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
        TONES[status],
        className
      )}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
