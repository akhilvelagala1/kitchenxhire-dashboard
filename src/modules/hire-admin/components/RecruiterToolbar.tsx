import { Calendar, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SearchInput } from '@/shared/components/SearchInput';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { adminRecruitersApi } from '../api/adminRecruitersApi';
import { adminRecruitersKeys } from '../api/adminRecruitersKeys';
import {
  BUSINESS_TYPES,
  RECRUITER_STATUSES,
  RECRUITER_STATUS_LABELS,
  RECRUITER_VERIFICATION_LABELS,
  type RecruiterVerification
} from '../schemas/adminRecruiter';
import { LIST_FIELD, ListFilterSelect } from './ListFilterSelect';
import { JOINED_OPTIONS } from './listParams';
import type { RecruitersPageParams } from './recruitersPageParams';

export type ParamChanges = Record<string, string | undefined>;

const VERIFICATIONS = Object.keys(RECRUITER_VERIFICATION_LABELS) as RecruiterVerification[];
const orAll = (value: string) => (value === 'all' || value === '' ? undefined : value);

function useLocationOptions(selected: string | undefined): string[] {
  const locations = useQuery({
    queryKey: adminRecruitersKeys.locations(),
    queryFn: adminRecruitersApi.locations,
    staleTime: Infinity
  });
  const values = (locations.data ?? []).map((option) => option.value);
  return selected && !values.includes(selected) ? [selected, ...values] : values;
}

/**
 * Search, business type, location, verification, status and last-login pickers on one row from lg up.
 */
export function RecruiterToolbar({
  params: p,
  hasActiveFilters,
  resetKey,
  onPatch,
  onReset
}: {
  params: RecruitersPageParams;
  hasActiveFilters: boolean;
  resetKey: number;
  onPatch: (changes: ParamChanges) => void;
  onReset: () => void;
}) {
  const cities = useLocationOptions(p.city);

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
          label="Search recruiters"
          placeholder="Search by recruiter name, email or phone..."
          value={p.search}
          onChange={(value) => onPatch({ search: value || undefined })}
          className={cn('truncate pl-9!', LIST_FIELD)}
        />
      </div>
      <ListFilterSelect
        label="Filter by business type"
        value={p.business_type}
        onChange={(value) => onPatch({ business_type: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="all">All Business Types</option>
        {BUSINESS_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </ListFilterSelect>
      <ListFilterSelect
        label="Filter by location"
        value={p.city ?? ''}
        onChange={(value) => onPatch({ city: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="">All Locations</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </ListFilterSelect>
      <ListFilterSelect
        label="Filter by verification"
        value={p.verification}
        onChange={(value) => onPatch({ verification: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="all">All Verification</option>
        {VERIFICATIONS.map((verification) => (
          <option key={verification} value={verification}>
            {RECRUITER_VERIFICATION_LABELS[verification]}
          </option>
        ))}
      </ListFilterSelect>
      <ListFilterSelect
        label="Filter by status"
        value={p.status}
        onChange={(value) => onPatch({ status: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="all">All Status</option>
        {RECRUITER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {RECRUITER_STATUS_LABELS[status]}
          </option>
        ))}
      </ListFilterSelect>
      <ListFilterSelect
        label="Filter by last login"
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
      </ListFilterSelect>
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
