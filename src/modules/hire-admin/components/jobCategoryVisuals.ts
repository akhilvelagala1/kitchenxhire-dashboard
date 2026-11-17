import {
  Briefcase,
  BrushCleaning,
  ChefHat,
  Croissant,
  Ellipsis,
  Package,
  Utensils,
  type LucideIcon
} from 'lucide-react';
import type { HireAdminJob } from '../schemas/adminJob';

/** One icon per "Jobs by Category" label. The table and the category card both read it. */
const LABEL_ICONS: Record<string, LucideIcon> = {
  'Cook / Chef': ChefHat,
  'Kitchen Helper': Utensils,
  'Cleaning & Stewarding': BrushCleaning,
  'Delivery & Store Support': Package,
  'Bakery Assistant': Croissant,
  'Restaurant Manager': Briefcase,
  Others: Ellipsis
};

export function jobLabelIcon(label: string): LucideIcon {
  return LABEL_ICONS[label] ?? Briefcase;
}

/** Category badge tints from the Jobs redesign reference. */
const CATEGORY_BADGES: Record<HireAdminJob['category'], string> = {
  Kitchen: 'bg-[#FFF0CB] text-[#A65B00]',
  Operations: 'bg-[#F0E3FF] text-[#7025D5]',
  Logistics: 'bg-[#FFE1E1] text-[#D32626]',
  Management: 'bg-[#DCEBFF] text-[#1558C7]'
};

export function jobCategoryBadgeClass(category: HireAdminJob['category']): string {
  return CATEGORY_BADGES[category];
}

// brand-600 and brand-200 from src/styles/index.css, as channels so a bar can be any step between them.
const STRONG = [255, 79, 24] as const;
const SOFT = [255, 216, 200] as const;

/**
 * Bar fill for the "Jobs by Category" card: strong brand orange for the biggest category,
 * progressively softer peach as the count falls. `ratio` is count divided by the largest count.
 */
export function categoryBarColor(ratio: number): string {
  const strength = 0.25 + 0.75 * Math.min(1, Math.max(0, ratio));
  const [r, g, b] = STRONG.map((strong, i) =>
    Math.round(SOFT[i]! + (strong - SOFT[i]!) * strength)
  );
  return `rgb(${r} ${g} ${b})`;
}
