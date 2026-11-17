import { cn } from '@/shared/lib/cn';
import { USER_STATUS_LABELS, type UserStatus } from '../schemas/adminUser';

/** Dark text on a pastel tint, at least 4.5:1 (WCAG AA). The word is shown as well as the colour. */
const TONES: Record<UserStatus, string> = {
  active: 'bg-[#DCFCE7] text-[#15803D]',
  inactive: 'bg-[#E9EDF2] text-[#475569]',
  pending: 'bg-[#FFF0CC] text-[#A16207]',
  suspended: 'bg-[#FEE2E2] text-[#DC2626]'
};

export function UserStatusBadge({ status, className }: { status: UserStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold whitespace-nowrap',
        TONES[status],
        className
      )}
    >
      {USER_STATUS_LABELS[status]}
    </span>
  );
}
