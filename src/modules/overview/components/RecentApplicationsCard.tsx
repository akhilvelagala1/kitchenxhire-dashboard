import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';
import { formatDateTime } from '@/shared/lib/dates';
import { fetchRecentApplications } from '../api/hireDashboardApi';
import { hireDashboardKeys } from '../api/hireDashboardKeys';
import { CandidateInitialsAvatar } from './CandidateInitialsAvatar';
import { dashboardCardClass } from './dashboardCardStyles';
import { HireApplicationStatusBadge } from './HireApplicationStatusBadge';

const GRID =
  'grid grid-cols-[88px_minmax(180px,1.4fr)_minmax(110px,1fr)_minmax(96px,0.9fr)_minmax(108px,0.9fr)_minmax(130px,1fr)] items-center gap-3';

export function RecentApplicationsCard() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: hireDashboardKeys.recentApplications,
    queryFn: fetchRecentApplications
  });

  return (
    <section className={dashboardCardClass}>
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E9ECF1] px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Recent Applications</h2>
          <p className="text-sm text-[#667085]">Latest applications received</p>
        </div>
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View all
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}
      {isError && <p className="p-5 text-sm text-ink-soft">Could not load recent applications.</p>}
      {data && !isLoading && (
        <div className="overflow-x-auto px-1 pb-2">
          <div
            className={`${GRID} min-w-[720px] border-b border-[#E9ECF1] bg-[#F5F6F9] px-4 py-2.5 text-[11px] font-semibold tracking-wide text-[#667085] uppercase`}
          >
            <span>#</span>
            <span>Candidate</span>
            <span>Applied For</span>
            <span>Location</span>
            <span>Status</span>
            <span>Applied On</span>
          </div>
          {data.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`${GRID} min-w-[720px] w-full border-b border-[#E9ECF1] px-4 py-3 text-left text-sm transition hover:bg-muted/50`}
              onClick={() => navigate(`/admin/applications/${row.id}`)}
            >
              <span className="text-xs font-medium text-[#667085]">{row.id}</span>
              <span className="flex min-w-0 items-center gap-3">
                <CandidateInitialsAvatar initials={row.candidate_initials} className="size-10" />
                <span className="truncate font-semibold text-ink">{row.candidate_name}</span>
              </span>
              <span className="truncate text-ink">{row.job_title}</span>
              <span className="truncate text-[#667085]">{row.location}</span>
              <span>
                <HireApplicationStatusBadge status={row.status} />
              </span>
              <span className="whitespace-nowrap text-xs text-[#667085]">
                {formatDateTime(row.applied_at)}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
