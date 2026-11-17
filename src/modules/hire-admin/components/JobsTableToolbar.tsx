import { Calendar, ChevronDown, Download, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DateRangeFilter } from '@/shared/components/DateRangeFilter';
import { ExportButton } from '@/shared/components/ExportButton';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { SearchInput } from '@/shared/components/SearchInput';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import { adminJobsApi, type JobsListParams } from '../api/adminJobsApi';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';

const STATUS_OPTS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft', label: 'Draft' }
];

const CATEGORY_OPTS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Kitchen', label: 'Kitchen' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'Management', label: 'Management' }
];

const LOCATION_OPTS = [
  { value: 'all', label: 'All Locations' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Secunderabad', label: 'Secunderabad' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Chennai', label: 'Chennai' }
];

const RECRUITER_OPTS = [
  { value: 'all', label: 'All Recruiters' },
  { value: 'Rahul Verma', label: 'Rahul Verma' },
  { value: 'Anita Rao', label: 'Anita Rao' },
  { value: 'Vikram Singh', label: 'Vikram Singh' },
  { value: 'Neha Patel', label: 'Neha Patel' },
  { value: 'Arjun Mehta', label: 'Arjun Mehta' },
  { value: 'Suman Reddy', label: 'Suman Reddy' },
  { value: 'Megha Jain', label: 'Megha Jain' },
  { value: 'Ravi Kumar', label: 'Ravi Kumar' }
];

const FIELD = 'lg:h-9 lg:min-h-0 lg:rounded-[calc(10*var(--u))] lg:text-dense-md';
const SLOT = 'min-w-[130px] flex-1 lg:min-w-0 lg:flex-none';

function shortDay(iso: string): string {
  const [year = NaN, month = NaN, day = NaN] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function dateRangeLabel(from: string | undefined, to: string | undefined): string {
  if (from && to) return `${shortDay(from)} – ${shortDay(to)}`;
  if (from) return `From ${shortDay(from)}`;
  if (to) return `Until ${shortDay(to)}`;
  return '';
}

function Chevron() {
  return (
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-ink-600"
    />
  );
}

function PostedDateFilter({
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
        aria-label="Filter by posted date"
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
          aria-label="Posted date filter"
          className="absolute top-full right-0 z-30 mt-2 w-max max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-3 shadow-lg"
        >
          <DateRangeFilter label="Posted date" from={from} to={to} onChange={onChange} />
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

function ExportAction({ listQuery }: { listQuery: JobsListParams }) {
  return (
    <PermissionGate permission={P.manage}>
      <div className="relative flex-none lg:w-auto lg:min-w-[calc(88*var(--u))]">
        <Download
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-brand-600"
        />
        <ExportButton
          label="Export"
          start={() => adminJobsApi.exportJobs(listQuery, [])}
          className={cn(
            'w-full border-brand-600! pl-9! text-brand-600! whitespace-nowrap hover:bg-brand-50!',
            'lg:h-9 lg:min-h-0 lg:rounded-[calc(10*var(--u))] lg:text-dense-md'
          )}
        />
      </div>
    </PermissionGate>
  );
}

/** Search, category/location/recruiter/status, posted-date calendar and Export (Jobs redesign). */
export function JobsTableToolbar({
  search,
  jobStatus,
  jobCategory,
  location,
  recruiterName,
  from,
  to,
  listQuery,
  onPatch
}: {
  search: string | undefined;
  jobStatus: string;
  jobCategory: string;
  location: string;
  recruiterName: string;
  from: string | undefined;
  to: string | undefined;
  listQuery: JobsListParams;
  onPatch: (changes: Record<string, string | undefined>) => void;
}) {
  return (
    <div
      role="search"
      className="mt-3 mb-4 flex flex-wrap items-center gap-2 lg:mt-2.75 lg:mb-3.5 lg:flex-nowrap lg:gap-3"
    >
      <div className="relative min-w-[200px] flex-1 lg:min-w-0">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft"
        />
        <SearchInput
          label="Filter jobs"
          placeholder="Search by job title, recruiter, or outlet..."
          value={search}
          onChange={(value) => onPatch({ search: value || undefined })}
          className={cn('pl-9!', FIELD)}
        />
      </div>
      <div className={cn('relative', SLOT, 'lg:w-[12%]')}>
        <Select
          aria-label="Job category filter"
          value={jobCategory}
          onChange={(e) =>
            onPatch({ job_category: e.target.value === 'all' ? undefined : e.target.value })
          }
          className={cn('appearance-none pr-8', FIELD)}
        >
          {CATEGORY_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Chevron />
      </div>
      <div className={cn('relative', SLOT, 'lg:w-[12%]')}>
        <Select
          aria-label="Location filter"
          value={location}
          onChange={(e) =>
            onPatch({ location: e.target.value === 'all' ? undefined : e.target.value })
          }
          className={cn('appearance-none pr-8', FIELD)}
        >
          {LOCATION_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Chevron />
      </div>
      <div className={cn('relative', SLOT, 'lg:w-[12%]')}>
        <Select
          aria-label="Recruiter filter"
          value={recruiterName}
          onChange={(e) =>
            onPatch({ recruiter_name: e.target.value === 'all' ? undefined : e.target.value })
          }
          className={cn('appearance-none pr-8', FIELD)}
        >
          {RECRUITER_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Chevron />
      </div>
      <div className={cn('relative', SLOT, 'lg:w-[12%]')}>
        <Select
          aria-label="Job status"
          value={jobStatus}
          onChange={(e) =>
            onPatch({ job_status: e.target.value === 'all' ? undefined : e.target.value })
          }
          className={cn('appearance-none pr-8', FIELD)}
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Chevron />
      </div>
      <PostedDateFilter
        from={from}
        to={to}
        onChange={(nextFrom, nextTo) =>
          onPatch({
            from: nextFrom,
            to: nextTo,
            range: nextFrom || nextTo ? 'custom' : '30d'
          })
        }
      />
      <ExportAction listQuery={listQuery} />
    </div>
  );
}
