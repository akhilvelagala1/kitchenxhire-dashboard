import { cn } from '@/shared/lib/cn';
import { BUSINESS_STATUS_LABELS, type BusinessStatus } from '../schemas/adminBusiness';

/** Soft status pills from the Businesses redesign reference. */
const TONES: Record<BusinessStatus, string> = {
  active: 'bg-[#DCFCE7] text-[#15803D]',
  inactive: 'bg-[#E9EDF2] text-[#475569]',
  under_review: 'bg-[#FEF3C7] text-[#A16207]',
  suspended: 'bg-[#FEE2E2] text-[#DC2626]'
};

export function BusinessStatusBadge({
  status,
  className
}: {
  status: BusinessStatus;
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
      {BUSINESS_STATUS_LABELS[status]}
    </span>
  );
}
