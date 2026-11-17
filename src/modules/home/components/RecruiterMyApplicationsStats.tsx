import { Briefcase, Check, Clock, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { RecruiterDashboardMetrics } from '../lib/recruiterDashboard';
import type { RecruiterMyApplicationsTab } from '../schemas/recruiterApplication';

function StatCard({
  value,
  label,
  icon: Icon,
  iconWrap,
  isActive,
  onClick
}: {
  value: number;
  label: string;
  icon: LucideIcon;
  iconWrap: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'flex h-[86px] min-w-0 items-center gap-3.5 rounded-2xl border bg-white px-4 text-left shadow-[0_5px_18px_rgb(22_30_50/0.05)] transition-colors',
        isActive
          ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-100'
          : 'border-[#eef0f5] hover:border-brand-200'
      )}
    >
      <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl', iconWrap)}>
        <Icon className="size-7 stroke-[2]" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[30px] leading-none font-extrabold tracking-tight text-[#141517] tabular-nums min-[1024px]:text-[32px]">
          {value}
        </span>
        <span className="mt-1 block truncate text-[15px] font-medium text-[#243754]">{label}</span>
      </span>
    </button>
  );
}

interface RecruiterMyApplicationsStatsProps {
  metrics: RecruiterDashboardMetrics;
  activeView: 'applications' | 'jobs';
  activeTab: RecruiterMyApplicationsTab;
  onSelectJobsPosted: () => void;
  onSelectTab: (tab: RecruiterMyApplicationsTab) => void;
}

export function RecruiterMyApplicationsStats({
  metrics,
  activeView,
  activeTab,
  onSelectJobsPosted,
  onSelectTab
}: RecruiterMyApplicationsStatsProps) {
  return (
    <div className="grid gap-4 min-[640px]:grid-cols-2 min-[1024px]:grid-cols-3 min-[1280px]:grid-cols-5">
      <StatCard
        value={metrics.jobsPosted}
        label="Jobs Posted"
        icon={Briefcase}
        iconWrap="bg-[#fff2e7] text-[#ff4f18]"
        isActive={activeView === 'jobs'}
        onClick={onSelectJobsPosted}
      />
      <StatCard
        value={metrics.totalApplicants}
        label="Total Applications"
        icon={Users}
        iconWrap="bg-[#fff2e7] text-[#f97316]"
        isActive={activeView === 'applications' && activeTab === 'all'}
        onClick={() => onSelectTab('all')}
      />
      <StatCard
        value={metrics.selectedHired}
        label="Hired / Accepted"
        icon={Check}
        iconWrap="bg-[#eaf8ec] text-[#16a34a]"
        isActive={activeView === 'applications' && activeTab === 'accepted'}
        onClick={() => onSelectTab('accepted')}
      />
      <StatCard
        value={metrics.rejected}
        label="Rejected / Declined"
        icon={X}
        iconWrap="bg-[#fff0f0] text-[#dc2626]"
        isActive={activeView === 'applications' && activeTab === 'rejected'}
        onClick={() => onSelectTab('rejected')}
      />
      <StatCard
        value={metrics.underReview}
        label="Under Review"
        icon={Clock}
        iconWrap="bg-[#fff5e5] text-[#f59e0b]"
        isActive={activeView === 'applications' && activeTab === 'under-review'}
        onClick={() => onSelectTab('under-review')}
      />
    </div>
  );
}
