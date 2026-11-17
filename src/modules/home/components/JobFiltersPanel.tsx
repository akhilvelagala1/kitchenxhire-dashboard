import { useState } from 'react';
import {
  DATE_POSTED_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  JOB_CATEGORY_OPTIONS,
  SHIFT_OPTIONS
} from '../content/filterOptions';
import type { EmploymentType } from '../schemas/home';
import type {
  DatePostedWindow,
  ExperienceBand,
  FindJobsFilterState,
  JobCategory,
  ShiftKind
} from '../schemas/findJobs';
import { FIND_JOBS_CATEGORY_PREVIEW, SALARY_CEIL, SALARY_FLOOR } from '../schemas/findJobs';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { card } from './styles';

interface JobFiltersPanelProps {
  filters: FindJobsFilterState;
  onChange: (patch: Partial<FindJobsFilterState>) => void;
  onClear: () => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function JobFiltersPanel({ filters, onChange, onClear }: JobFiltersPanelProps) {
  const { tx } = useHireLanguage();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories
    ? JOB_CATEGORY_OPTIONS
    : JOB_CATEGORY_OPTIONS.slice(0, FIND_JOBS_CATEGORY_PREVIEW);

  return (
    <aside className={card + ' h-fit self-start p-4 min-[1024px]:sticky min-[1024px]:top-[72px]'}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-extrabold tracking-tight">{tx('Filter Jobs')}</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[13px] font-extrabold text-brand-600 hover:underline"
        >
          {tx('Clear All')}
        </button>
      </div>

      <fieldset className="mt-4 border-0 border-t border-line p-0 pt-4">
        <legend className="text-[13px] font-extrabold text-ink-700">{tx('Job Category')}</legend>
        <ul className="mt-2 space-y-2">
          {visibleCategories.map((option) => (
            <li key={option.id}>
              <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px] font-semibold text-ink-600">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(option.id)}
                  onChange={() =>
                    onChange({
                      categories: toggle<JobCategory>(filters.categories, option.id),
                      page: 1
                    })
                  }
                  className="mt-0.5 size-4 rounded border-line accent-brand-600"
                />
                {tx(option.label)}
              </label>
            </li>
          ))}
        </ul>
        {JOB_CATEGORY_OPTIONS.length > FIND_JOBS_CATEGORY_PREVIEW && (
          <button
            type="button"
            onClick={() => setShowAllCategories((open) => !open)}
            className="mt-2 text-[13px] font-extrabold text-brand-600 hover:underline"
          >
            {showAllCategories ? tx('View Less Categories') : tx('View More Categories')}
          </button>
        )}
      </fieldset>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-[13px] font-extrabold text-ink-700">{tx('Employment Type')}</legend>
        <ul className="mt-2 space-y-2">
          {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
            <li key={option.id}>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold text-ink-600">
                <input
                  type="checkbox"
                  checked={filters.types.includes(option.id)}
                  onChange={() =>
                    onChange({
                      types: toggle<EmploymentType>(filters.types, option.id),
                      page: 1
                    })
                  }
                  className="size-4 rounded border-line accent-brand-600"
                />
                {tx(option.label)}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-[13px] font-extrabold text-ink-700">{tx('Shift')}</legend>
        <ul className="mt-2 space-y-2">
          {SHIFT_OPTIONS.map((option) => (
            <li key={option.id}>
              <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px] font-semibold text-ink-600">
                <input
                  type="checkbox"
                  checked={filters.shifts.includes(option.id)}
                  onChange={() =>
                    onChange({
                      shifts: toggle<ShiftKind>(filters.shifts, option.id),
                      page: 1
                    })
                  }
                  className="mt-0.5 size-4 rounded border-line accent-brand-600"
                />
                <span>
                  {tx(option.label)}
                  <span className="block text-[12px] font-medium text-ink-400">{option.hint}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-[13px] font-extrabold text-ink-700">{tx('Experience')}</legend>
        <ul className="mt-2 space-y-2">
          {EXPERIENCE_OPTIONS.map((option) => (
            <li key={option.id}>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold text-ink-600">
                <input
                  type="checkbox"
                  checked={filters.experience.includes(option.id)}
                  onChange={() =>
                    onChange({
                      experience: toggle<ExperienceBand>(filters.experience, option.id),
                      page: 1
                    })
                  }
                  className="size-4 rounded border-line accent-brand-600"
                />
                {tx(option.label)}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="text-[13px] font-extrabold text-ink-700">
          {tx('Salary (per month)')}
        </legend>
        <p className="mt-1.5 text-[12px] font-bold text-ink-500">
          ₹{filters.salaryMin.toLocaleString('en-IN')} – ₹
          {filters.salaryMax.toLocaleString('en-IN')}
        </p>
        <div className="mt-2 space-y-2">
          <label className="block text-[11px] font-semibold text-ink-400">
            {tx('Min')}
            <input
              type="range"
              min={SALARY_FLOOR}
              max={SALARY_CEIL}
              step={1000}
              value={filters.salaryMin}
              onChange={(event) =>
                onChange({
                  salaryMin: Math.min(Number(event.target.value), filters.salaryMax),
                  page: 1
                })
              }
              className="mt-0.5 h-1.5 w-full accent-brand-600"
            />
          </label>
          <label className="block text-[11px] font-semibold text-ink-400">
            {tx('Max')}
            <input
              type="range"
              min={SALARY_FLOOR}
              max={SALARY_CEIL}
              step={1000}
              value={filters.salaryMax}
              onChange={(event) =>
                onChange({
                  salaryMax: Math.max(Number(event.target.value), filters.salaryMin),
                  page: 1
                })
              }
              className="mt-0.5 h-1.5 w-full accent-brand-600"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-4 border-0 p-0 pb-1">
        <legend className="text-[13px] font-extrabold text-ink-700">{tx('Date Posted')}</legend>
        <ul className="mt-2 space-y-2">
          {DATE_POSTED_OPTIONS.map((option) => (
            <li key={option.id}>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold text-ink-600">
                <input
                  type="checkbox"
                  checked={filters.datePosted.includes(option.id)}
                  onChange={() =>
                    onChange({
                      datePosted: toggle<DatePostedWindow>(filters.datePosted, option.id),
                      page: 1
                    })
                  }
                  className="size-4 rounded border-line accent-brand-600"
                />
                {tx(option.label)}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </aside>
  );
}
