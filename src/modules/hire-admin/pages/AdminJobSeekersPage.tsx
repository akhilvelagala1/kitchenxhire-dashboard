import { PageHeader } from '@/shared/components/PageHeader';
import { JobSeekerHeaderActions } from '../components/JobSeekerHeaderActions';
import { JobSeekerTableSection } from '../components/JobSeekerTableSection';

/**
 * Job Seekers list redesign: heading (Export + Add) plus the management card.
 * KPI cards, trend chart and Quick Actions were removed.
 */
export function AdminJobSeekersPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <PageHeader
        flush
        className="lg:items-center"
        titleClassName="text-[#111111] lg:text-dense-title lg:leading-8 lg:font-bold"
        descriptionClassName="lg:mt-0.5"
        title="Job Seekers"
        description="Browse and manage job seeker accounts, profiles, applications and hiring activity."
        actions={<JobSeekerHeaderActions />}
      />
      <JobSeekerTableSection />
    </div>
  );
}
