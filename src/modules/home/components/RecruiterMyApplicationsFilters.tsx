import { Search, X } from 'lucide-react';
import type { RecruiterDateFilter } from '../lib/recruiterDashboard';
import type { useRecruiterMyApplicationsDashboard } from '../hooks/useRecruiterMyApplicationsDashboard';
import { recruiterMyApplicationsFilterInput } from './recruiterMyApplicationsStyles';

type Dashboard = ReturnType<typeof useRecruiterMyApplicationsDashboard>;

interface RecruiterMyApplicationsFiltersProps {
  dashboard: Dashboard;
}

export function RecruiterMyApplicationsFilters({ dashboard }: RecruiterMyApplicationsFiltersProps) {
  const {
    query,
    jobs,
    locations,
    setSearch,
    setJobId,
    setLocation,
    setDateRange,
    clearFilters,
    filtersActive
  } = dashboard;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 min-[900px]:grid-cols-[minmax(0,1fr)_204px_196px_184px] min-[900px]:gap-4">
        <label className="relative block min-w-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <input
            value={query.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, job title..."
            className={`${recruiterMyApplicationsFilterInput} pl-9 pr-9`}
          />
          {query.search.trim() && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
        <select // guard-allow: recruiter my applications job filter
          value={query.jobId}
          onChange={(e) => setJobId(e.target.value)}
          className={recruiterMyApplicationsFilterInput}
          aria-label="Filter by job"
        >
          <option value="all">All Jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <select // guard-allow: recruiter my applications location filter
          value={query.location ?? 'all'}
          onChange={(e) => setLocation(e.target.value)}
          className={recruiterMyApplicationsFilterInput}
          aria-label="Filter by location"
        >
          <option value="all">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
        <select // guard-allow: recruiter my applications date filter
          value={query.dateRange}
          onChange={(e) => setDateRange(e.target.value as RecruiterDateFilter)}
          className={recruiterMyApplicationsFilterInput}
          aria-label="Filter by date"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>
      {filtersActive && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-[14px] font-semibold text-brand-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
