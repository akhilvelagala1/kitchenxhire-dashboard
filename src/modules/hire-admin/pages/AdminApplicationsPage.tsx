import { PageHeader } from '@/shared/components/PageHeader';
import { ApplicationsTableSection } from '../components/ApplicationsTableSection';

/**
 * Applications list redesign: heading plus the management card (tabs, filters, table, pager).
 * KPI cards, trend chart and Quick Actions were removed. Reuses AppShell header/sidebar.
 */
export function AdminApplicationsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <PageHeader
        flush
        titleClassName="text-[#111111] lg:text-dense-title lg:leading-8 lg:font-bold"
        descriptionClassName="lg:mt-0.5"
        title="Applications"
        description="Manage all job applications from job seekers across recruiters and outlets."
      />
      <ApplicationsTableSection />
    </div>
  );
}
