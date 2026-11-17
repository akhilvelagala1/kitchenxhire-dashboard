import { cn } from '@/shared/lib/cn';
import { CATEGORY_STATUS_LABELS, type CategoryStatus } from '../schemas/adminCategoryRole';

/** Dark text on a pastel tint, each pair above 4.5:1 (WCAG AA). Roles use `active` and `inactive`. */
const TONES: Record<CategoryStatus, string> = {
  active: 'bg-[#DDF8E7] text-[#0F7A3A]',
  inactive: 'bg-[#ECEEF2] text-[#4B5563]',
  archived: 'bg-[#FFF1D6] text-[#986000]'
};

/** The status of a category or a role as a pastel pill. The word carries the meaning. */
export function CategoryRoleStatusBadge({
  status,
  className
}: {
  status: CategoryStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5.5 items-center rounded-full px-3 text-xs font-semibold whitespace-nowrap',
        TONES[status],
        className
      )}
    >
      {CATEGORY_STATUS_LABELS[status]}
    </span>
  );
}
