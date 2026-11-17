import { cn } from '@/shared/lib/cn';
import type { HireJobStatus } from '../schemas/adminJob';
import { hireJobStatusClass, hireJobStatusLabel } from './hireJobStatusBadgeClasses';

/** Soft status pill sized to the Jobs table redesign. */
export function HireJobStatusBadge({
  status,
  className
}: {
  status: HireJobStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-[23px] items-center rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
        hireJobStatusClass(status),
        className
      )}
    >
      {hireJobStatusLabel(status)}
    </span>
  );
}
