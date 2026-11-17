import { Calendar, ChevronDown, Search } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { SearchInput } from '@/shared/components/SearchInput';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import {
  EXPERIENCE_BANDS,
  JOB_SEEKER_STATUSES,
  JOB_SEEKER_STATUS_LABELS
} from '../schemas/adminJobSeeker';
import type { FilterOption } from '../schemas/listDashboard';
import type { JobSeekersPageParams } from './jobSeekersPageParams';
import { JOINED_OPTIONS } from './listParams';

export type JobSeekerParamChanges = Record<string, string | undefined>;

/*
 * Control sizes. Below lg every control keeps the standard tap size from the shared Input and
 * Button. From lg up they are 36 design px tall with a 10 px radius, as in the reference picture.
 */
const FIELD = 'lg:h-9 lg:min-h-0 lg:rounded-[calc(10*var(--u))] lg:text-dense-md';
const SLOT = 'min-w-[150px] flex-1 lg:min-w-0 lg:flex-none';

function Chevron() {
  return (
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-ink-600"
    />
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  className,
  icon,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className={cn('relative', SLOT, className)}>
      {icon}
      <Select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn('appearance-none pr-8', icon ? 'pl-9' : undefined, FIELD)}
      >
        {children}
      </Select>
      <Chevron />
    </div>
  );
}

/**
 * Search, experience, location, status and joined pickers on one row from lg up (wrapping below).
 * Every change goes to the URL through `onPatch`, which also drops the page. `resetKey` remounts
 * the search box so "Clear filters" empties the text as well as the URL. A city from the URL that
 * the list of locations does not (yet) hold still gets an option, so the picker never shows a
 * different value from the one in use.
 */
export function JobSeekerToolbar({
  params: p,
  locations,
  hasActiveFilters,
  resetKey,
  onPatch,
  onReset
}: {
  params: JobSeekersPageParams;
  locations: FilterOption[] | undefined;
  hasActiveFilters: boolean;
  resetKey: number;
  onPatch: (changes: JobSeekerParamChanges) => void;
  onReset: () => void;
}) {
  const known = locations ?? [];
  const cities =
    p.city && !known.some((option) => option.value === p.city)
      ? [...known, { value: p.city, label: p.city }]
      : known;
  const orAll = (value: string) => (value === 'all' || value === '' ? undefined : value);

  return (
    <div
      role="search"
      className="mt-3 flex flex-wrap items-center gap-2 lg:mt-2.75 lg:flex-nowrap lg:gap-3"
    >
      <div className="relative min-w-[200px] flex-1 lg:min-w-0 lg:flex-[1.5]">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft"
        />
        <SearchInput
          key={resetKey}
          label="Search job seekers"
          placeholder="Search by name, email, phone..."
          value={p.search}
          onChange={(value) => onPatch({ search: value || undefined })}
          className={cn('pl-9!', FIELD)}
        />
      </div>
      <FilterSelect
        label="Filter by experience"
        value={p.experience}
        onChange={(value) => onPatch({ experience: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="all">All Experience</option>
        {EXPERIENCE_BANDS.map((band) => (
          <option key={band.value} value={band.value}>
            {band.label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Filter by location"
        value={p.city ?? 'all'}
        onChange={(value) => onPatch({ city: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="all">All Locations</option>
        {cities.map((city) => (
          <option key={city.value} value={city.value}>
            {city.label}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Filter by status"
        value={p.status}
        onChange={(value) => onPatch({ status: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="all">All Status</option>
        {JOB_SEEKER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {JOB_SEEKER_STATUS_LABELS[status]}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="Filter by joined date"
        value={p.joined}
        onChange={(value) => onPatch({ joined: orAll(value) })}
        className="lg:flex-1"
        icon={
          <Calendar
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-ink-600"
          />
        }
      >
        {JOINED_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="flex-none whitespace-nowrap lg:h-9 lg:min-h-0 lg:px-2 lg:text-dense-md"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
