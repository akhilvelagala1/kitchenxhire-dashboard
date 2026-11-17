import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import type { useRecruiterDashboard } from '../hooks/useRecruiterDashboard';
import {
  RECRUITER_STATUS_LABEL,
  type RecruiterApplicationStatusFilter
} from '../schemas/recruiterApplication';
import { FindJobsPagination } from './FindJobsPagination';
import { applicationsRangeLine } from '../content/hireResultCopy';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { homeButton } from './styles';
import { RecruiterApplicationsTable } from './RecruiterApplicationsTable';

type Dashboard = ReturnType<typeof useRecruiterDashboard>;

interface RecruiterRecentApplicationsProps {
  dashboard: Dashboard;
}

const STATUS_FILTERS: { id: RecruiterApplicationStatusFilter; label: string }[] = [
  { id: 'all', label: 'All Status' },
  ...(
    Object.keys(RECRUITER_STATUS_LABEL) as Exclude<RecruiterApplicationStatusFilter, 'all'>[]
  ).map((id) => ({ id, label: RECRUITER_STATUS_LABEL[id] }))
];

export function RecruiterRecentApplications({ dashboard }: RecruiterRecentApplicationsProps) {
  const { language, tx } = useHireLanguage();
  const {
    accountId,
    query,
    pageResult,
    setSearch,
    setJobId,
    setStatus,
    setDateRange,
    setPage,
    jobs,
    accept,
    reject,
    updateNotes
  } = dashboard;

  return (
    <section className="rounded-[20px] border border-line bg-surface p-4 shadow-card min-[768px]:p-5">
      <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-start min-[768px]:justify-between">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight text-ink">
            {tx('Recent Applications')}
          </h2>
          <p className="mt-0.5 text-[14px] font-medium text-ink-500">
            {tx('Latest people who applied to your jobs.')}
          </p>
        </div>
        <Link
          to="/recruiter/applications"
          className={cn(homeButton('white-slim'), 'inline-flex shrink-0 self-start')}
        >
          {tx('View All Applications')}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-4 grid gap-2 min-[900px]:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <label className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query.search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tx('Search by candidate name...')}
            aria-label={tx('Search by candidate name...')}
            className="h-11 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-[13px] font-semibold text-ink outline-none focus-visible:border-brand-600/70"
          />
        </label>
        <select // guard-allow: recruiter applications job filter
          value={query.jobId}
          onChange={(event) => setJobId(event.target.value)}
          className="h-11 rounded-xl border border-line bg-canvas px-3 text-[13px] font-semibold text-ink outline-none"
        >
          <option value="all">{tx('All Jobs')}</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <select // guard-allow: recruiter applications status filter
          value={query.status}
          onChange={(event) => setStatus(event.target.value as RecruiterApplicationStatusFilter)}
          className="h-11 rounded-xl border border-line bg-canvas px-3 text-[13px] font-semibold text-ink outline-none"
        >
          {STATUS_FILTERS.map((item) => (
            <option key={item.id} value={item.id}>
              {tx(item.label)}
            </option>
          ))}
        </select>
        <select // guard-allow: recruiter applications date filter
          value={query.dateRange}
          onChange={(event) => setDateRange(event.target.value as '30d' | '90d' | 'all')}
          className="h-11 rounded-xl border border-line bg-canvas px-3 text-[13px] font-semibold text-ink outline-none"
        >
          <option value="30d">{tx('Last 30 Days')}</option>
          <option value="90d">{tx('Last 90 Days')}</option>
          <option value="all">{tx('All time')}</option>
        </select>
      </div>

      <div className="mt-4">
        {pageResult.slice.length === 0 ? (
          <p className="py-10 text-center text-[14px] font-medium text-ink-500">
            {tx('No applications match your filters.')}
          </p>
        ) : (
          <RecruiterApplicationsTable
            rows={pageResult.slice}
            accountId={accountId}
            onAccept={accept}
            onReject={reject}
            onUpdateNotes={updateNotes}
          />
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between min-[768px]:gap-6">
        <p className="shrink-0 text-[13px] font-semibold text-ink-600">
          {applicationsRangeLine(
            language,
            pageResult.rangeStart,
            pageResult.rangeEnd,
            pageResult.total
          )}
        </p>
        <div className="min-w-0 flex-1 [&_nav]:mt-0 [&_nav]:border-0 [&_nav]:justify-end [&_nav]:pt-0">
          <FindJobsPagination
            page={pageResult.page}
            totalPages={pageResult.totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </section>
  );
}
