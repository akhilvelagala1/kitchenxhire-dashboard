import { ApplicationsTrendCard } from '../components/ApplicationsTrendCard';
import {
  dashboardAnalyticsRowHeight,
  dashboardBottomRowMinHeight
} from '../components/dashboardCardStyles';
import { DashboardPageHeader } from '../components/DashboardPageHeader';
import { DashboardStatsRow } from '../components/DashboardStatsRow';
import { OpenJobsByCategoryCard } from '../components/OpenJobsByCategoryCard';
import { QuickActionsCard } from '../components/QuickActionsCard';
import { RecentApplicationsCard } from '../components/RecentApplicationsCard';

export function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardPageHeader />
      <DashboardStatsRow />
      <div className={`grid gap-4 lg:grid-cols-5 ${dashboardAnalyticsRowHeight}`}>
        <div className="min-h-[240px] lg:col-span-3 lg:min-h-0">
          <ApplicationsTrendCard />
        </div>
        <div className="min-h-[240px] lg:col-span-2 lg:min-h-0">
          <QuickActionsCard />
        </div>
      </div>
      <div className={`grid gap-4 lg:grid-cols-5 ${dashboardBottomRowMinHeight}`}>
        <div className="lg:col-span-3">
          <RecentApplicationsCard />
        </div>
        <div className="lg:col-span-2">
          <OpenJobsByCategoryCard />
        </div>
      </div>
    </div>
  );
}
