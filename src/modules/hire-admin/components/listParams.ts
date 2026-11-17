import type { JoinedPreset } from '../schemas/listDashboard';

/** Page-size options shared by hire-admin list pagers. */
export const LIST_PAGE_SIZES = [5, 10, 20, 50] as const;

export const JOINED_OPTIONS: { value: JoinedPreset; label: string }[] = [
  { value: 'all', label: 'Any time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' }
];

export function pick<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(raw as T) ? (raw as T) : fallback;
}

/** A page number from the URL: a whole number from 1, else 1. */
export function parsePage(raw: string | null): number {
  const page = Math.floor(Number(raw ?? 1));
  return Number.isFinite(page) && page > 0 ? page : 1;
}
