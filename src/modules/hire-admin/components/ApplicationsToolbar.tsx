import { Calendar, ChevronDown, Download, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { AsyncSelect, type Option } from '@/shared/components/AsyncSelect';
import { DateRangeFilter } from '@/shared/components/DateRangeFilter';
import { ExportButton } from '@/shared/components/ExportButton';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { SearchInput } from '@/shared/components/SearchInput';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import { adminApplicationsApi, type ApplicationsListParams } from '../api/adminApplicationsApi';
import { adminApplicationsKeys } from '../api/adminApplicationsKeys';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import {
  APPLICATION_STATUS_LABELS,
  HIRE_APPLICATION_STATUSES,
  type ApplicationOptionKind
} from '../schemas/adminApplication';
import type { ApplicationsPageParams } from './applicationsPageParams';

export type ParamChanges = Record<string, string | undefined>;

function shortDay(iso: string): string {
  const [year = NaN, month = NaN, day = NaN] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** `1 Jun – 24 Jun`, `From 1 Jun`, `Until 24 Jun`, or an empty string when no date is set. */
function dateRangeLabel(from: string | undefined, to: string | undefined): string {
  if (from && to) return `${shortDay(from)} – ${shortDay(to)}`;
  if (from) return `From ${shortDay(from)}`;
  if (to) return `Until ${shortDay(to)}`;
  return '';
}

/*
 * Control sizes. Below lg every control keeps the standard tap size from the shared Input and
 * Button. From lg up they are 36 design px tall with a 10 px radius, as in the reference picture.
 */
const FIELD = 'lg:h-9 lg:min-h-0 lg:rounded-[calc(10*var(--u))] lg:text-dense-md';
const SLOT = 'min-w-[150px] flex-1 lg:min-w-0 lg:flex-none';
const ASYNC_INPUT =
  '[&_input]:truncate [&_input]:pr-8 [&_input]:placeholder:text-[#1F2937] lg:[&_input]:h-9 ' +
  'lg:[&_input]:min-h-0 lg:[&_input]:rounded-[calc(10*var(--u))] lg:[&_input]:text-dense-md';

function Chevron() {
  return (
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-ink-600"
    />
  );
}

/** Job, recruiter and location pickers: searchable on the server, and the label survives a reload. */
function PickerFilter({
  kind,
  label,
  placeholder,
  value,
  onChange
}: {
  kind: ApplicationOptionKind;
  label: string;
  placeholder: string;
  value: Option | null;
  onChange: (option: Option | null) => void;
}) {
  const id = useId();
  return (
    <div className={cn('relative', SLOT, 'lg:w-[12.3%]', ASYNC_INPUT)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <AsyncSelect
        id={id}
        queryKey={adminApplicationsKeys.options(kind)}
        loadOptions={(search) => adminApplicationsApi.options(kind, search || undefined)}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <Chevron />
    </div>
  );
}

/** A small box with a calendar icon. It opens the shared date-range inputs and closes on Escape or an outside click. */
function AppliedDateFilter({
  from,
  to,
  onChange
}: {
  from: string | undefined;
  to: string | undefined;
  onChange: (from: string | undefined, to: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const label = dateRangeLabel(from, to);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative w-28 flex-none lg:w-[8.1%] lg:min-w-[calc(80*var(--u))]">
      <button
        ref={trigger}
        type="button"
        aria-label="Filter by applied date"
        aria-haspopup="true"
        aria-expanded={open}
        title={label || undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex min-h-11 w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-ink hover:bg-muted',
          'focus-visible:outline-2 focus-visible:outline-brand-600',
          FIELD
        )}
      >
        <Calendar aria-hidden className="size-4 shrink-0 text-ink-600" />
        {label && <span className="truncate text-dense-sm text-ink-600">{label}</span>}
      </button>
      {open && (
        <div
          role="group"
          aria-label="Applied date filter"
          className="absolute top-full right-0 z-30 mt-2 w-max max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-3 shadow-lg"
        >
          <DateRangeFilter label="Applied date" from={from} to={to} onChange={onChange} />
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              disabled={!from && !to}
              onClick={() => onChange(undefined, undefined)}
              className="lg:min-h-8 lg:text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportAction({ listQuery }: { listQuery: ApplicationsListParams }) {
  return (
    <PermissionGate permission={P.manage}>
      <div className="relative flex-none lg:w-auto lg:min-w-[calc(88*var(--u))]">
        <Download
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-brand-600"
        />
        <ExportButton
          label="Export"
          start={() => adminApplicationsApi.exportApplications(listQuery, [])}
          className={cn(
            'w-full border-brand-600! pl-9! text-brand-600! whitespace-nowrap hover:bg-brand-50!',
            'lg:h-9 lg:min-h-0 lg:rounded-[calc(10*var(--u))] lg:text-dense-md'
          )}
        />
      </div>
    </PermissionGate>
  );
}

/**
 * Search, three pickers, the status select, the date box and Export on one row from lg up
 * (wrapping below). Every change goes to the URL through `onPatch`, which also drops the page.
 * `resetKey` remounts the search box so "Clear filters" empties the text as well as the URL.
 */
export function ApplicationsToolbar({
  params: p,
  listQuery,
  hasActiveFilters,
  resetKey,
  onPatch,
  onReset
}: {
  params: ApplicationsPageParams;
  listQuery: ApplicationsListParams;
  hasActiveFilters: boolean;
  resetKey: number;
  onPatch: (changes: ParamChanges) => void;
  onReset: () => void;
}) {
  return (
    <div
      role="search"
      className="mt-3 flex flex-wrap items-center gap-2 lg:mt-2.75 lg:flex-nowrap lg:gap-3"
    >
      <div className="relative min-w-[200px] flex-1 lg:min-w-0">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft"
        />
        <SearchInput
          key={resetKey}
          label="Search applications"
          placeholder="Search by candidate name, email, phone..."
          value={p.search}
          onChange={(value) => onPatch({ search: value || undefined })}
          className={cn('pl-9!', FIELD)}
        />
      </div>
      <PickerFilter
        kind="jobs"
        label="Filter by job"
        placeholder="All Jobs"
        value={p.job_id ? { value: p.job_id, label: p.job_label ?? p.job_id } : null}
        onChange={(option) => onPatch({ job_id: option?.value, job_label: option?.label })}
      />
      <PickerFilter
        kind="recruiters"
        label="Filter by recruiter"
        placeholder="All Recruiters"
        value={
          p.recruiter_id
            ? { value: p.recruiter_id, label: p.recruiter_label ?? p.recruiter_id }
            : null
        }
        onChange={(option) =>
          onPatch({ recruiter_id: option?.value, recruiter_label: option?.label })
        }
      />
      <PickerFilter
        kind="locations"
        label="Filter by location"
        placeholder="All Locations"
        value={p.location ? { value: p.location, label: p.location } : null}
        onChange={(option) => onPatch({ location: option?.value })}
      />
      <div className={cn('relative', SLOT, 'lg:w-[12.3%]')}>
        <Select
          aria-label="Filter by status"
          value={p.status}
          onChange={(event) =>
            onPatch({ status: event.target.value === 'all' ? undefined : event.target.value })
          }
          className={cn('appearance-none pr-8', FIELD)}
        >
          <option value="all">All Status</option>
          {HIRE_APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {APPLICATION_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <Chevron />
      </div>
      <AppliedDateFilter from={p.from} to={p.to} onChange={(from, to) => onPatch({ from, to })} />
      <ExportAction listQuery={listQuery} />
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
