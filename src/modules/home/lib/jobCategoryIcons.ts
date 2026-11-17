import {
  Bike,
  BrushCleaning,
  ChefHat,
  ClipboardList,
  Coffee,
  ConciergeBell,
  CreditCard,
  Package,
  Shield,
  Soup,
  UtensilsCrossed,
  type LucideIcon
} from 'lucide-react';
import type { JobCategory } from '../schemas/findJobs';

/** Prototype-aligned role icons (reference My Applications / Find Jobs). */
export const JOB_CATEGORY_ICON: Record<JobCategory, LucideIcon> = {
  cook: ChefHat,
  'kitchen-helper': UtensilsCrossed,
  waiter: ConciergeBell,
  bakery: ConciergeBell,
  cleaning: BrushCleaning,
  'restaurant-manager': ClipboardList,
  'kitchen-supervisor': Soup,
  barista: Coffee,
  delivery: Bike,
  cashier: CreditCard,
  dishwasher: BrushCleaning,
  store: Package,
  security: Shield
};
