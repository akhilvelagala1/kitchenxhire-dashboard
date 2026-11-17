import { Bookmark, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { JOB_CATEGORY_OPTIONS } from '../content/filterOptions';
import { savedJobsRangeLine } from '../content/hireResultCopy';
import { useHireLanguage } from '../hooks/useHireLanguage';
import {
  cityFromArea,
  filterSavedListings,
  paginateSavedListings,
  sortSavedListings,
  type SavedJobListing
} from '../lib/savedJobs';
import type { JobCategory } from '../schemas/findJobs';
import type { SavedJobsSort } from '../schemas/savedJobs';
import { SAVED_JOBS_SORT_OPTIONS } from '../schemas/savedJobs';
import { FindJobsPagination } from './FindJobsPagination';
import { SavedJobCard } from './SavedJobCard';
import { homeButton } from './styles';

interface SavedJobsPanelProps {
  savedJobs: SavedJobListing[];
  onUnsave: (jobId: string) => void;
  onApply: (job: SavedJobListing) => void;
}

export function SavedJobsPanel({ savedJobs, onUnsave, onApply }: SavedJobsPanelProps) {
  const { language } = useHireLanguage();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<JobCategory | ''>('');
  const [sort, setSort] = useState<SavedJobsSort>('recently-saved');
  const [page, setPage] = useState(1);

  const locations = useMemo(() => {
    const cities = new Set(savedJobs.map((job) => cityFromArea(job.area)).filter(Boolean));
    return [...cities].sort((a, b) => a.localeCompare(b));
  }, [savedJobs]);

  const filtered = useMemo(() => {
    return sortSavedListings(filterSavedListings(savedJobs, { query, location, category }), sort);
  }, [savedJobs, query, location, category, sort]);

  const pageResult = paginateSavedListings(filtered, page);

  function resetPage() {
    setPage(1);
  }

  if (savedJobs.length === 0) {
    return (
      <section className="mt-5 rounded-[18px] border border-line bg-surface px-6 py-12 text-center shadow-card">
        <Bookmark className="mx-auto size-10 text-brand-600" aria-hidden="true" />
        <h2 className="mt-4 text-[18px] font-extrabold text-ink">No Saved Jobs Yet</h2>
        <p className="mt-2 text-sm font-medium text-ink-500">Jobs you save will appear here.</p>
        <Link to="/user" className={cn(homeButton('orange-base'), 'mt-6 inline-flex')}>
          Explore Jobs
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-[18px] border border-line bg-surface p-4 shadow-card min-[768px]:p-5">
      <div className="flex items-start gap-2">
        <Bookmark className="mt-0.5 size-5 fill-brand-600 text-brand-600" aria-hidden="true" />
        <div>
          <h2 className="text-[17px] font-extrabold text-ink">Saved Jobs ({savedJobs.length})</h2>
          <p className="mt-1 text-[13.5px] font-medium text-ink-500">
            Jobs you have saved to view or apply later.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 min-[900px]:flex-row min-[900px]:flex-wrap min-[900px]:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="Search saved jobs..."
            className="h-11 w-full rounded-xl border border-line bg-canvas pr-3 pl-10 text-[14px] font-semibold text-ink outline-none focus:border-brand-300"
          />
        </label>
        <select // guard-allow: saved jobs location filter matches hire prototype native select
          aria-label="Filter by location"
          value={location}
          onChange={(event) => {
            setLocation(event.target.value);
            resetPage();
          }}
          className="h-11 rounded-xl border border-line bg-surface px-3 text-[13px] font-bold text-ink outline-none"
        >
          <option value="">All Locations</option>
          {locations.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select // guard-allow: saved jobs category filter matches hire prototype native select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as JobCategory | '');
            resetPage();
          }}
          className="h-11 rounded-xl border border-line bg-surface px-3 text-[13px] font-bold text-ink outline-none"
        >
          <option value="">All Categories</option>
          {JOB_CATEGORY_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-600">
          Sort by:
          <select // guard-allow: saved jobs sort enum matches hire prototype native select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SavedJobsSort);
              resetPage();
            }}
            className="h-11 rounded-xl border border-line bg-surface px-3 text-[13px] font-bold text-ink outline-none"
          >
            {SAVED_JOBS_SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-canvas px-4 py-8 text-center text-sm font-semibold text-ink-500">
          No saved jobs match your search or filters.
        </p>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {pageResult.slice.map((job) => (
              <li key={job.id}>
                <SavedJobCard
                  job={job}
                  onUnsave={() => onUnsave(job.id)}
                  onApply={() => onApply(job)}
                />
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 min-[768px]:flex-row min-[768px]:items-center min-[768px]:justify-between">
            <p className="text-[13px] font-semibold text-ink-600">
              {savedJobsRangeLine(
                language,
                pageResult.rangeStart,
                pageResult.rangeEnd,
                filtered.length
              )}
            </p>
            {pageResult.totalPages > 1 && (
              <FindJobsPagination
                page={Math.min(page, pageResult.totalPages)}
                totalPages={pageResult.totalPages}
                onPageChange={setPage}
                className="mt-0 justify-start border-0 pt-0 min-[768px]:justify-end"
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
