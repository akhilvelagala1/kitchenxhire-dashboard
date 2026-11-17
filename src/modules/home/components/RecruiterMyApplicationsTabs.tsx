import { cn } from '@/shared/lib/cn';
import type { RecruiterDashboardMetrics } from '../lib/recruiterDashboard';
import type { RecruiterMyApplicationsTab } from '../schemas/recruiterApplication';

const TABS: {
  id: RecruiterMyApplicationsTab;
  label: string;
  countKey: keyof Pick<
    RecruiterDashboardMetrics,
    'totalApplicants' | 'underReview' | 'selectedHired' | 'rejected'
  >;
}[] = [
  { id: 'all', label: 'All Applications', countKey: 'totalApplicants' },
  { id: 'under-review', label: 'Under Review', countKey: 'underReview' },
  { id: 'accepted', label: 'Accepted', countKey: 'selectedHired' },
  { id: 'rejected', label: 'Rejected', countKey: 'rejected' }
];

interface RecruiterMyApplicationsTabsProps {
  active: RecruiterMyApplicationsTab;
  metrics: RecruiterDashboardMetrics;
  onChange: (tab: RecruiterMyApplicationsTab) => void;
}

export function RecruiterMyApplicationsTabs({
  active,
  metrics,
  onChange
}: RecruiterMyApplicationsTabsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const count = metrics[tab.countKey];
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex h-12 items-center rounded-full border px-5 text-[15px] font-semibold transition-colors min-[1024px]:h-[48px]',
              isActive
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-[#e1e5ee] bg-white text-[#141517] hover:border-brand-200'
            )}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
