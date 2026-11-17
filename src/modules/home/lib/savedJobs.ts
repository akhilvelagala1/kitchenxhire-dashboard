import { FIND_JOBS_CATALOG } from '../content/findJobsCatalog';
import { JOB_CATEGORY_OPTIONS } from '../content/filterOptions';
import type { FindJobListing, JobCategory } from '../schemas/findJobs';
import type { SavedJobEntry, SavedJobsFilterState, SavedJobsSort } from '../schemas/savedJobs';
import { SAVED_JOBS_PAGE_SIZE } from '../schemas/savedJobs';

const SAVED_JOBS_STORAGE_KEY = 'kx-hire-saved-jobs';

export interface SavedJobListing extends FindJobListing {
  savedAt: string;
}

export function cityFromArea(area: string): string {
  const parts = area.split(',');
  const last = parts[parts.length - 1]?.trim();
  return last || area.trim();
}

export function categoryLabel(category: JobCategory): string {
  return JOB_CATEGORY_OPTIONS.find((option) => option.id === category)?.label ?? category;
}

/** Accepts legacy `string[]` ids and current `{ id, savedAt }[]`. */
export function parseSavedJobEntries(raw: unknown): SavedJobEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: SavedJobEntry[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (typeof item === 'string' && item && !seen.has(item)) {
      seen.add(item);
      entries.push({ id: item, savedAt: new Date(0).toISOString() });
      continue;
    }
    if (typeof item !== 'object' || item === null) continue;
    const row = item as Partial<SavedJobEntry>;
    if (typeof row.id !== 'string' || !row.id || seen.has(row.id)) continue;
    seen.add(row.id);
    entries.push({
      id: row.id,
      savedAt: typeof row.savedAt === 'string' ? row.savedAt : new Date(0).toISOString()
    });
  }

  return entries;
}

export function readSavedJobEntries(): SavedJobEntry[] {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_STORAGE_KEY);
    if (!raw) return [];
    return parseSavedJobEntries(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function writeSavedJobEntries(entries: SavedJobEntry[]) {
  try {
    localStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Vitest/jsdom may omit localStorage in some Node builds.
  }
}

export function resolveSavedListings(entries: SavedJobEntry[]): SavedJobListing[] {
  const byId = new Map(FIND_JOBS_CATALOG.map((job) => [job.id, job]));
  const resolved: SavedJobListing[] = [];
  for (const entry of entries) {
    const job = byId.get(entry.id);
    if (!job) continue;
    resolved.push({ ...job, savedAt: entry.savedAt });
  }
  return resolved;
}

export function sortSavedListings(jobs: SavedJobListing[], sort: SavedJobsSort): SavedJobListing[] {
  const copy = [...jobs];
  if (sort === 'recently-saved') {
    copy.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } else if (sort === 'oldest-saved') {
    copy.sort((a, b) => a.savedAt.localeCompare(b.savedAt));
  } else if (sort === 'title-az') {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'salary-high') {
    copy.sort((a, b) => b.salaryMax - a.salaryMax);
  } else if (sort === 'salary-low') {
    copy.sort((a, b) => a.salaryMin - b.salaryMin);
  }
  return copy;
}

export function filterSavedListings(
  jobs: SavedJobListing[],
  filters: Omit<SavedJobsFilterState, 'page' | 'sort'>
): SavedJobListing[] {
  const queryWords = filters.query
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  return jobs.filter((job) => {
    if (filters.location && cityFromArea(job.area) !== filters.location) return false;
    if (filters.category && job.category !== filters.category) return false;
    if (queryWords.length === 0) return true;
    const haystack =
      `${job.title} ${job.company} ${job.area} ${categoryLabel(job.category)}`.toLowerCase();
    return queryWords.every((word) => haystack.includes(word));
  });
}

export function paginateSavedListings<T>(
  items: T[],
  page: number,
  pageSize = SAVED_JOBS_PAGE_SIZE
): { slice: T[]; rangeStart: number; rangeEnd: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    slice: items.slice(start, start + pageSize),
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, total),
    totalPages
  };
}
