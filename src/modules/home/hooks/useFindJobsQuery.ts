import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { DEFAULT_CITY } from '../content/nav';
import type { FindJobsFilterState, SortOption } from '../schemas/findJobs';
import {
  DATE_POSTED_VALUES,
  EMPLOYMENT_TYPE_VALUES,
  EXPERIENCE_VALUES,
  JOB_CATEGORY_VALUES,
  SALARY_CEIL,
  SALARY_FLOOR,
  SHIFT_VALUES
} from '../schemas/findJobs';

const SORT_VALUES: SortOption[] = ['relevant', 'latest', 'oldest', 'salary-high', 'salary-low'];

function parseList<T extends string>(value: string | null, allowed: readonly T[]): T[] {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part): part is T => allowed.includes(part as T));
}

function parseNumber(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function readFilters(params: URLSearchParams): FindJobsFilterState {
  const sortParam = params.get('sort');
  const sort = SORT_VALUES.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : 'relevant';

  return {
    role: params.get('q') ?? '',
    city: params.get('city') ?? DEFAULT_CITY,
    categories: parseList(params.get('cat'), JOB_CATEGORY_VALUES),
    types: parseList(params.get('type'), EMPLOYMENT_TYPE_VALUES),
    shifts: parseList(params.get('shift'), SHIFT_VALUES),
    experience: parseList(params.get('exp'), EXPERIENCE_VALUES),
    salaryMin: parseNumber(params.get('salaryMin'), SALARY_FLOOR),
    salaryMax: parseNumber(params.get('salaryMax'), SALARY_CEIL),
    datePosted: parseList(params.get('posted'), DATE_POSTED_VALUES),
    sort,
    page: Math.max(1, parseNumber(params.get('page'), 1))
  };
}

function writeFilters(current: URLSearchParams, merged: FindJobsFilterState): URLSearchParams {
  const updated = new URLSearchParams(current);

  const setOrDelete = (key: string, value: string, defaultValue?: string) => {
    if (!value || (defaultValue !== undefined && value === defaultValue)) updated.delete(key);
    else updated.set(key, value);
  };

  setOrDelete('q', merged.role.trim());
  setOrDelete('city', merged.city.trim(), DEFAULT_CITY);
  setOrDelete('cat', merged.categories.join(','));
  setOrDelete('type', merged.types.join(','));
  setOrDelete('shift', merged.shifts.join(','));
  setOrDelete('exp', merged.experience.join(','));
  setOrDelete('salaryMin', String(merged.salaryMin), String(SALARY_FLOOR));
  setOrDelete('salaryMax', String(merged.salaryMax), String(SALARY_CEIL));
  setOrDelete('posted', merged.datePosted.join(','));
  setOrDelete('sort', merged.sort, 'relevant');
  setOrDelete('page', String(merged.page), '1');

  return updated;
}

export function useFindJobsQuery() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => readFilters(params), [params]);

  const patch = useCallback(
    (next: Partial<FindJobsFilterState>) => {
      setParams((current) => {
        const merged = { ...readFilters(current), ...next };
        return writeFilters(current, merged);
      });
    },
    [setParams]
  );

  const clearFilters = useCallback(() => {
    patch({
      categories: [],
      types: [],
      shifts: [],
      experience: [],
      salaryMin: SALARY_FLOOR,
      salaryMax: SALARY_CEIL,
      datePosted: [],
      page: 1
    });
  }, [patch]);

  return { filters, patch, clearFilters };
}
