/**
 * KitchenX Hiring job-category and location master data index.
 *
 * This is the single source of truth for search suggestions. It is local
 * prototype data (UI-13); a search API replaces it later, the components stay.
 *
 * Five connected dimensions — never duplicated as separate categories:
 * 1. Main job category  2. Job designation  3. Cuisine
 * 4. Food specialization  5. Skills / dishes / search keywords
 *
 * A single chef can carry several cuisine + specialization associations, so
 * searching any of those terms can identify the same relevant job listing.
 */

export interface SearchableItem {
  label: string;
  type: 'category' | 'designation' | 'cuisine' | 'specialization' | 'skill';
  /** Lowercase keywords the item matches against (never hardcoded in a component). */
  keywords: string[];
}

export interface CityItem {
  label: string;
  state: string;
  /** Abbreviations / aliases that resolve to this city (e.g. HYD -> Hyderabad). */
  abbreviations: string[];
  /** Notable localities / areas within the city. */
  areas: string[];
}

/** One selectable place: a city itself, or a named locality inside one. */
export interface LocationSuggestion {
  /** The place that actually matched — a city name, or a locality name. */
  label: string;
  /** Set only for a locality match, so the suggestion can show "Locality, City". */
  city?: string;
}

import { MAIN_CATEGORIES } from './mainCategories';
import { DESIGNATIONS } from './designations';
import { CUISINES } from './cuisines';
import { SPECIALIZATIONS } from './specializations';
import { SKILLS } from './skills';
import { CITIES } from './cities';

/** Combined search index across all five dimensions (used by searchTaxonomy). */
const SEARCH_INDEX: SearchableItem[] = [
  ...MAIN_CATEGORIES,
  ...DESIGNATIONS,
  ...CUISINES,
  ...SPECIALIZATIONS,
  ...SKILLS
];

/**
 * Return search suggestions matching the query across every dimension.
 * Matches label or any keyword, case-insensitive, substring/prefix.
 * Results are deduplicated by label, most relevant first.
 */
export function searchTaxonomy(query: string): SearchableItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const seen = new Set<string>();
  const results: SearchableItem[] = [];

  const push = (item: SearchableItem) => {
    if (seen.has(item.label)) return;
    const labelMatch = item.label.toLowerCase().includes(q);
    const keywordMatch = item.keywords.some((k) => k.includes(q));
    if (labelMatch || keywordMatch) {
      seen.add(item.label);
      results.push(item);
    }
  };

  // Exact / prefix label matches first, then keyword matches.
  const exact = SEARCH_INDEX.filter((i) => i.label.toLowerCase().startsWith(q));
  const rest = SEARCH_INDEX.filter(
    (i) =>
      !i.label.toLowerCase().startsWith(q) &&
      (i.label.toLowerCase().includes(q) || i.keywords.some((k) => k.includes(q)))
  );

  for (const item of [...exact, ...rest]) push(item);
  return results;
}

/**
 * Return place suggestions matching the query: cities, their abbreviations
 * (HYD -> Hyderabad), and their localities, case-insensitive.
 *
 * A city match and a locality match are two different places and are never merged —
 * typing "Ben" must suggest the locality "Benz Circle" (in Vijayawada) and the city
 * "Bengaluru" as two separate options, not just "Vijayawada" standing in for the locality.
 */
export function searchCities(query: string): LocationSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const seen = new Set<string>();
  const results: LocationSuggestion[] = [];

  for (const city of CITIES) {
    const cityMatch =
      city.label.toLowerCase().startsWith(q) ||
      city.label.toLowerCase().includes(q) ||
      city.abbreviations.some((a) => a.startsWith(q) || a.includes(q));

    if (cityMatch && !seen.has(city.label)) {
      seen.add(city.label);
      results.push({ label: city.label });
    }

    for (const area of city.areas) {
      if (area.toLowerCase().includes(q) && !seen.has(area)) {
        seen.add(area);
        results.push({ label: area, city: city.label });
      }
    }
  }

  return results;
}
