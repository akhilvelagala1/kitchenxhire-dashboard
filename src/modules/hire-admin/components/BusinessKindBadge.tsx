import { cn } from '@/shared/lib/cn';
import type { BusinessKind } from '../schemas/adminBusiness';

/** Soft type pills from the Businesses redesign reference. */
const TONES: Record<BusinessKind, string> = {
  Restaurant: 'bg-[#FFEBE3] text-[#B9380B]',
  'Cloud Kitchen': 'bg-[#F0E8FF] text-[#6B2FE8]',
  'Food Court': 'bg-[#E4EFFF] text-[#1761C2]',
  Warehouse: 'bg-[#E8EAFF] text-[#3F46AD]'
};

export function BusinessKindBadge({ kind, className }: { kind: BusinessKind; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-[23px] items-center rounded-full px-2.5 text-[11.5px] font-semibold whitespace-nowrap',
        TONES[kind],
        className
      )}
    >
      {kind}
    </span>
  );
}
