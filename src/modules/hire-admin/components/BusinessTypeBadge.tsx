import { cn } from '@/shared/lib/cn';
import type { BusinessType } from '../schemas/adminRecruiter';

/** Dark text on a pastel tint, each pair above 4.5:1 (WCAG AA). */
const TONES: Record<BusinessType, string> = {
  Restaurant: 'bg-[#FFE9E1] text-[#A6400A]',
  'Cloud Kitchen': 'bg-[#EDE8FF] text-[#6D3FD1]',
  'Food Court': 'bg-[#E1EDFF] text-[#1A5FB8]'
};

/** The kind of business as a pastel pill. The words carry the meaning, the colour only helps. */
export function BusinessTypeBadge({ type, className }: { type: BusinessType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5.5 items-center rounded-full px-3 text-xs font-semibold whitespace-nowrap',
        TONES[type],
        className
      )}
    >
      {type}
    </span>
  );
}
