import { Cloud, Store, Truck, Utensils, Warehouse, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { CategoryIcon } from '../schemas/adminCategoryRole';

const GLYPHS: Record<CategoryIcon, LucideIcon> = {
  utensils: Utensils,
  cloud: Cloud,
  store: Store,
  warehouse: Warehouse,
  truck: Truck
};

/** Pastel tint and a darker glyph colour per icon, each pair above 4.5:1 (WCAG AA). */
const TONES: Record<CategoryIcon, string> = {
  utensils: 'bg-[#FFE9E1] text-[#C2410C]',
  cloud: 'bg-[#EDE8FF] text-[#6D3FD1]',
  store: 'bg-[#E1EDFF] text-[#1A5FB8]',
  warehouse: 'bg-[#E4E9FF] text-[#3B47A8]',
  truck: 'bg-[#DDF8E7] text-[#0F7A3A]'
};

/** The 36 design px rounded tile in front of a category's name. Decorative, so hidden from screen readers. */
export function CategoryIconTile({ icon }: { icon: CategoryIcon }) {
  const Glyph = GLYPHS[icon];
  return (
    <span
      aria-hidden
      data-testid="category-icon-tile"
      data-icon={icon}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-[calc(10*var(--u))] lg:size-[calc(36*var(--u))]',
        TONES[icon]
      )}
    >
      <Glyph className="size-4.5" />
    </span>
  );
}
