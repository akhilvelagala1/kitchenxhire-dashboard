import { PageHeader } from '@/shared/components/PageHeader';
import { RecruiterHeaderActions } from '../components/RecruiterHeaderActions';
import { RecruiterTableSection } from '../components/RecruiterTableSection';

/**
 * Recruiter Management list: heading (Export + Add) plus the management card.
 * KPI cards, trend chart and Quick Actions stay removed.
 */
export function AdminRecruitersPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <PageHeader
        flush
        className="lg:items-center"
        titleClassName="text-[#111111] lg:text-dense-title lg:leading-8 lg:font-bold"
        descriptionClassName="lg:mt-0.5"
        title="Recruiter Management"
        description="Manage recruiter accounts, business assignments, verification and hiring access."
        actions={<RecruiterHeaderActions />}
      />
      <RecruiterTableSection />
    </div>
  );
}
