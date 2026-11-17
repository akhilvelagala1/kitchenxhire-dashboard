import {
  ChefHat,
  Cookie,
  Package,
  Sparkles,
  Truck,
  UtensilsCrossed,
  type LucideIcon
} from 'lucide-react';
import type { ComponentType } from 'react';
import { ONBOARDING_CATEGORY_OPTIONS } from '../content/profileFormOptions';
import type { JobSeekerOnboardingField } from '../schemas/jobSeekerOnboarding';

const CATEGORY_ICONS: Record<
  string,
  ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  'Cook / Chef': ChefHat,
  'Kitchen Helper': Cookie,
  'Waiter / Service Staff': UtensilsCrossed,
  'Bakery Staff': Cookie,
  'Cleaning / Stewarding': Sparkles,
  'Vegetable Cutting & Prep': Package,
  'Warehouse Staff': Package,
  'Delivery / Support Staff': Truck
};

export const ONBOARDING_CATEGORY_SELECT_OPTIONS = ONBOARDING_CATEGORY_OPTIONS.map((opt) => ({
  ...opt,
  icon: CATEGORY_ICONS[opt.value] as LucideIcon | undefined
}));

const FIELD_FOCUS_ORDER: JobSeekerOnboardingField[] = ['fullName', 'preferredRole', 'city'];

export function focusFirstOnboardingInvalid(fields: JobSeekerOnboardingField[]) {
  for (const field of FIELD_FOCUS_ORDER) {
    if (!fields.includes(field)) continue;
    if (field === 'fullName') {
      document.getElementById('onboarding-fullName')?.focus();
      return;
    }
    const trigger = document.querySelector<HTMLElement>(
      `button[id^="${field}-"][aria-haspopup="listbox"]`
    );
    trigger?.focus();
    return;
  }
}
