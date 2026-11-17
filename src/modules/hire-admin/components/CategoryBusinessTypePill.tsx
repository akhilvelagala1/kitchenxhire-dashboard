import { cn } from '@/shared/lib/cn';
import type { CategoryBusinessType } from '../schemas/adminCategoryRole';

/** Dark text on a pastel tint, each pair above 4.5:1 (WCAG AA). */
const TONES: Record<CategoryBusinessType, string> = {
  Restaurant: 'bg-[#FFE9E1] text-[#A6400A]',
  'Cloud Kitchen': 'bg-[#EDE8FF] text-[#6D3FD1]',
  'Food Court': 'bg-[#E1EDFF] text-[#1A5FB8]',
  Warehouse: 'bg-[#E4E9FF] text-[#3B47A8]',
  Kitchen: 'bg-[#DDF8E7] text-[#0F7A3A]'
};

/** The kind of business a category stands for, as a pastel pill. The words carry the meaning. */
export function CategoryBusinessTypePill({
  type,
  className
}: {
  type: CategoryBusinessType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-3 text-xs font-semibold whitespace-nowrap lg:h-[calc(24*var(--u))] lg:px-[calc(11*var(--u))] lg:text-[calc(12.5*var(--u))]',
        TONES[type],
        className
      )}
    >
      {type}
    </span>
  );
}
