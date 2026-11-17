import { Calendar, Search } from 'lucide-react';
import { SearchInput } from '@/shared/components/SearchInput';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import {
  USER_DEPARTMENTS,
  USER_ROLES,
  USER_STATUSES,
  USER_STATUS_LABELS
} from '../schemas/adminUser';
import { LIST_FIELD, ListFilterSelect } from './ListFilterSelect';
import { JOINED_OPTIONS } from './listParams';
import { DEFAULT_LOGIN_FILTER, type UsersPageParams } from './usersPageParams';

export type UserParamChanges = Record<string, string | undefined>;

const orAll = (value: string) => (value === 'all' || value === '' ? undefined : value);

/**
 * Search, role, department, status and last-login pickers on one row from lg up (wrapping below).
 * Every change goes to the URL through `onPatch`, which also drops the page. `resetKey` remounts
 * the search box so "Clear filters" empties the text as well as the URL.
 */
export function UserToolbar({
  params: p,
  hasActiveFilters,
  resetKey,
  onPatch,
  onReset
}: {
  params: UsersPageParams;
  hasActiveFilters: boolean;
  resetKey: number;
  onPatch: (changes: UserParamChanges) => void;
  onReset: () => void;
}) {
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
          label="Search users"
          placeholder="Search by name, email or user ID..."
          value={p.search}
          onChange={(value) => onPatch({ search: value || undefined })}
          className={cn('pl-9!', LIST_FIELD)}
        />
      </div>
      <ListFilterSelect
        label="Filter by role"
        value={p.role ?? 'all'}
        onChange={(value) => onPatch({ role: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="all">All Roles</option>
        {USER_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </ListFilterSelect>
      <ListFilterSelect
        label="Filter by department"
        value={p.department ?? 'all'}
        onChange={(value) => onPatch({ department: orAll(value) })}
        className="lg:flex-1"
      >
        <option value="all">All Departments</option>
        {USER_DEPARTMENTS.map((department) => (
          <option key={department} value={department}>
            {department}
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
        {USER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {USER_STATUS_LABELS[status]}
          </option>
        ))}
      </ListFilterSelect>
      <ListFilterSelect
        label="Filter by last login"
        value={p.login}
        // The default window is the empty URL; every other choice, "Any time" included, is kept.
        onChange={(value) => onPatch({ login: value === DEFAULT_LOGIN_FILTER ? undefined : value })}
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
