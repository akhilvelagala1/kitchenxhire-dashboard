import { Briefcase, Building2, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';
import { fetchHireDashboardSummary } from '../api/hireDashboardApi';
import { hireDashboardKeys } from '../api/hireDashboardKeys';
import { DashboardStatCard } from './DashboardStatCard';

export function DashboardStatsRow() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: hireDashboardKeys.summary,
    queryFn: fetchHireDashboardSummary
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-soft">
        Could not load dashboard statistics.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardStatCard
        label="Total Jobs"
        value={data.total_jobs}
        growthPct={data.growth_jobs_pct}
        icon={Briefcase}
        cardClassName="bg-[#FFF0E9]"
        iconClassName="text-[#F45116]"
        onClick={() => navigate('/admin/jobs')}
      />
      <DashboardStatCard
        label="Total Applications"
        value={data.total_applications}
        growthPct={data.growth_applications_pct}
        icon={Users}
        cardClassName="bg-[#E8F8F0]"
        iconClassName="text-[#20A66A]"
        onClick={() => navigate('/admin/applications')}
      />
      <DashboardStatCard
        label="Active Recruiters"
        value={data.active_recruiters}
        growthPct={data.growth_recruiters_pct}
        icon={Building2}
        cardClassName="bg-[#FFF5DF]"
        iconClassName="text-[#E99A18]"
        onClick={() => navigate('/admin/recruiters')}
      />
      <DashboardStatCard
        label="Job Seekers"
        value={data.job_seekers}
        growthPct={data.growth_job_seekers_pct}
        icon={Users}
        cardClassName="bg-[#EAF2FF]"
        iconClassName="text-[#2879DC]"
        onClick={() => navigate('/admin/job-seekers')}
      />
    </div>
  );
}
