import { Briefcase, CheckCircle2, Users, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';
import type { RecruiterDashboardMetrics } from '../lib/recruiterDashboard';

interface RecruiterStatCardsProps {
  metrics: RecruiterDashboardMetrics;
  onJobsClick: () => void;
  onApplicantsClick: () => void;
  onSelectedClick: () => void;
  onRejectedClick: () => void;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconWrap,
  onClick
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  iconWrap: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[92px] w-full items-center gap-3.5 rounded-[16px] border border-line bg-surface px-5 py-4 text-left shadow-card transition-shadow hover:shadow-card-hover"
    >
      <span className={cn('grid size-11 flex-none place-items-center rounded-xl', iconWrap)}>
        <Icon className="size-[22px] stroke-[2.2]" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-[32px] leading-none font-extrabold tracking-tight text-ink tabular-nums">
          {value}
        </span>
        <span className="mt-1.5 block text-[13px] font-bold text-ink-600">{label}</span>
      </span>
    </button>
  );
}

export function RecruiterStatCards({
  metrics,
  onJobsClick,
  onApplicantsClick,
  onSelectedClick,
  onRejectedClick
}: RecruiterStatCardsProps) {
  const { tx } = useHireLanguage();

  return (
    <div className="grid gap-4 min-[640px]:grid-cols-2 min-[1024px]:grid-cols-4">
      <StatCard
        label={tx('Jobs Posted')}
        value={metrics.jobsPosted}
        icon={Briefcase}
        iconWrap="bg-brand-50 text-brand-600"
        onClick={onJobsClick}
      />
      <StatCard
        label={tx('Total Applicants')}
        value={metrics.totalApplicants}
        icon={Users}
        iconWrap="bg-brand-50 text-brand-600"
        onClick={onApplicantsClick}
      />
      <StatCard
        label={tx('Selected / Hired')}
        value={metrics.selectedHired}
        icon={CheckCircle2}
        iconWrap="bg-emerald-50 text-emerald-600"
        onClick={onSelectedClick}
      />
      <StatCard
        label={tx('Rejected')}
        value={metrics.rejected}
        icon={XCircle}
        iconWrap="bg-rose-50 text-rose-600"
        onClick={onRejectedClick}
      />
    </div>
  );
}
