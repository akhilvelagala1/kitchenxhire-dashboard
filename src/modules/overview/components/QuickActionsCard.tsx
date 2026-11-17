import {
  Briefcase,
  Grid3X3,
  PieChart,
  UserPlus,
  Users,
  Building2,
  type LucideIcon
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { dashboardCardClass } from './dashboardCardStyles';

const ACTIONS: {
  label: string;
  to: string;
  icon: LucideIcon;
  className: string;
}[] = [
  {
    label: 'Post a Job',
    to: '/admin/jobs/new',
    icon: Briefcase,
    className: 'bg-[#FFF0E9] text-[#F45116]'
  },
  {
    label: 'Review Applications',
    to: '/admin/applications',
    icon: Users,
    className: 'bg-[#F1EBFF] text-[#7443C5]'
  },
  {
    label: 'Add Recruiter',
    to: '/admin/recruiters/create',
    icon: Building2,
    className: 'bg-[#E8F8F0] text-[#20A66A]'
  },
  {
    label: 'Add Job Seeker',
    to: '/admin/job-seekers/create',
    icon: UserPlus,
    className: 'bg-[#EAF2FF] text-[#2879DC]'
  },
  {
    label: 'Manage Roles',
    to: '/admin/settings?tab=users',
    icon: Grid3X3,
    className: 'bg-[#F2F4F7] text-[#667085]'
  },
  {
    label: 'View Reports',
    to: '/admin/reports',
    icon: PieChart,
    className: 'bg-[#FFF5DF] text-[#E99A18]'
  }
];

export function QuickActionsCard() {
  const navigate = useNavigate();
  return (
    <section className={dashboardCardClass}>
      <h2 className="shrink-0 px-5 pt-4 text-lg font-bold text-ink">Quick Actions</h2>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3 p-4 pt-3">
        {ACTIONS.map((action) => (
          <button
            key={action.to}
            type="button"
            onClick={() => navigate(action.to)}
            className={cn(
              'flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-[14px] p-2 text-center text-sm font-medium transition duration-150 hover:opacity-95',
              action.className
            )}
          >
            <action.icon className="size-6" strokeWidth={1.75} aria-hidden />
            <span className="leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
