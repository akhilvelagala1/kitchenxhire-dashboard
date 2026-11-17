import { Calendar, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '@/shared/components/PageHeader';
import { DateRangeFilter } from '@/shared/components/DateRangeFilter';
import { cn } from '@/shared/lib/cn';
import { Select } from '@/shared/ui/Input';
import type { JobsDateRangePreset } from '../schemas/adminJob';
import { RANGE_OPTIONS } from './jobsPageParams';

/** Title on the left, period and compact Post a Job on the right. */
export function JobsPageHeaderSection({
  range,
  from,
  to,
  onRangeChange,
  onDateRangeChange
}: {
  range: JobsDateRangePreset;
  from?: string;
  to?: string;
  onRangeChange: (r: JobsDateRangePreset) => void;
  onDateRangeChange: (from: string | undefined, to: string | undefined) => void;
}) {
  return (
    <PageHeader
      flush
      className="items-start md:items-center"
      titleClassName="text-[30px] leading-tight font-bold tracking-tight text-[#111111]"
      descriptionClassName="mt-1 text-sm font-normal text-[#64748B]"
      title="Jobs"
      description="Manage all job postings, review recruiter jobs, and track their performance."
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Calendar className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#526079]" />
            <Select
              aria-label="Report period"
              value={range}
              onChange={(e) => onRangeChange(e.target.value as JobsDateRangePreset)}
              className="h-[42px] min-h-[42px] w-[188px] rounded-[10px] border-[#E9ECF2] pl-10 text-sm"
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          {range === 'custom' && (
            <DateRangeFilter
              label="Custom range"
              from={from}
              to={to}
              onChange={onDateRangeChange}
            />
          )}
          <Link
            to="/admin/jobs/new"
            className={cn(
              'inline-flex h-[42px] min-h-[42px] items-center justify-center gap-2 rounded-[10px] px-4',
              'bg-brand-600 text-sm font-bold text-white hover:bg-brand-700',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
            )}
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden />
            Post a Job
          </Link>
        </div>
      }
    />
  );
}
