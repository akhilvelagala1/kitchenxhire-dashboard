import { useSearchParams } from 'react-router';
import { PageHeader } from '@/shared/components/PageHeader';
import { ReportsApplicationsCategoriesCard } from '../components/ReportsApplicationsCategoriesCard';
import { ReportsApplicationsKpiRow } from '../components/ReportsApplicationsKpiRow';
import { ReportsApplicationsLocationsCard } from '../components/ReportsApplicationsLocationsCard';
import { ReportsApplicationsStatusCard } from '../components/ReportsApplicationsStatusCard';
import { ReportsApplicationsTrendCard } from '../components/ReportsApplicationsTrendCard';
import { ReportsDrilldownSection } from '../components/ReportsDrilldownSection';
import { ReportsHeaderActions } from '../components/ReportsHeaderActions';
import { ReportsHiringTrendCard } from '../components/ReportsHiringTrendCard';
import { ReportsJobsCategoriesCard } from '../components/ReportsJobsCategoriesCard';
import { ReportsJobsKpiRow } from '../components/ReportsJobsKpiRow';
import { ReportsJobsStatusCard } from '../components/ReportsJobsStatusCard';
import { ReportsJobsTrendCard } from '../components/ReportsJobsTrendCard';
import { ReportsKpiRow } from '../components/ReportsKpiRow';
import { ReportsPlatformGrowthCard } from '../components/ReportsPlatformGrowthCard';
import { ReportsRecentApplicationsCard } from '../components/ReportsRecentApplicationsCard';
import { ReportsRecentJobsCard } from '../components/ReportsRecentJobsCard';
import { ReportsRecentRecruitersCard } from '../components/ReportsRecentRecruitersCard';
import { ReportsRecentUsersCard } from '../components/ReportsRecentUsersCard';
import { ReportsRecruitersActivityCard } from '../components/ReportsRecruitersActivityCard';
import { ReportsRecruitersKpiRow } from '../components/ReportsRecruitersKpiRow';
import { ReportsRecruitersLeaderboardCard } from '../components/ReportsRecruitersLeaderboardCard';
import { ReportsRecruitersStatusCard } from '../components/ReportsRecruitersStatusCard';
import { ReportsStatusCard } from '../components/ReportsStatusCard';
import { ReportsTabs } from '../components/ReportsTabs';
import { ReportsTopCategoriesCard } from '../components/ReportsTopCategoriesCard';
import { ReportsTopLocationsCard } from '../components/ReportsTopLocationsCard';
import { ReportsUsersKpiRow } from '../components/ReportsUsersKpiRow';
import { ReportsUsersLocationsCard } from '../components/ReportsUsersLocationsCard';
import { ReportsUsersTrendCard } from '../components/ReportsUsersTrendCard';
import { ReportsUsersTypeCard } from '../components/ReportsUsersTypeCard';
import { useReportsDrilldown } from '../components/reportsDrilldownParams';
import { parseReportTab } from '../components/reportsPageParams';

/**
 * Below lg the cards stack and the page scrolls. From xl up it is a five-row grid drawn for the
 * 1600x900 reference picture and scaled with the window (`fit-scale` and `fit-scale-reports`, see
 * styles/index.css): the heading, the report pills, five stat cards (95 design px), then a taller
 * row of chart cards (300 design px) and the bottom row (253 design px), both fixed heights so the
 * page keeps its own bottom margin instead of stretching to fill the window. Between lg and xl the
 * cards would be too narrow for that, so the two chart rows grow taller instead and the page
 * scrolls inside the shell. Every tab shares this same grid, so its cards are always the same size
 * as Overview's; only the three report-body rows swap their contents (UI-14).
 *
 * While a stat card is open on Overview (`metric` in the URL), one block that spans both chart rows
 * takes their place; the heading, pills and stat cards above it stay as they are.
 */
export function AdminReportsPage() {
  const [searchParams] = useSearchParams();
  const tab = parseReportTab(searchParams);
  const { metric } = useReportsDrilldown();
  /** A stat card only opens on Overview; any other pill ignores a `metric` left in the URL. */
  const openMetric = tab === 'overview' ? metric : null;

  return (
    <div className="fit-scale fit-scale-reports flex min-h-0 flex-1 flex-col lg:pt-[calc(22*var(--u))] lg:pr-[calc(16*var(--u))] lg:pb-[calc(16*var(--u))] lg:pl-[calc(14*var(--u))]">
      <div className="mx-auto grid w-full flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 lg:max-w-[calc(1760*var(--u))] lg:grid-rows-[auto_auto_calc(95*var(--u))_calc(618*var(--u))_calc(253*var(--u))] lg:gap-y-[calc(26*var(--u))] xl:grid-rows-[auto_auto_calc(95*var(--u))_calc(300*var(--u))_calc(253*var(--u))]">
        <PageHeader
          flush
          className="lg:items-start"
          titleClassName="text-[#101828] lg:text-dense-title lg:leading-[calc(38*var(--u))] lg:font-extrabold"
          descriptionClassName="text-[#475467] lg:mt-[calc(2*var(--u))] lg:text-[calc(15*var(--u))]"
          title="Reports & Analytics"
          description="Get insights into hiring performance, jobs, applications and platform growth."
          actions={<ReportsHeaderActions />}
        />
        <ReportsTabs />
        {tab === 'overview' && <ReportsKpiRow />}
        {tab === 'jobs' && <ReportsJobsKpiRow />}
        {tab === 'applications' && <ReportsApplicationsKpiRow />}
        {tab === 'users' && <ReportsUsersKpiRow />}
        {tab === 'recruiters' && <ReportsRecruitersKpiRow />}
        {openMetric ? (
          <div className="min-h-0 lg:row-span-2">
            <ReportsDrilldownSection key={openMetric} metric={openMetric} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:min-h-0 lg:grid-rows-[calc(300*var(--u))_calc(300*var(--u))] lg:gap-[calc(18*var(--u))] xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:grid-rows-1 xl:gap-[calc(17*var(--u))] 2xl:grid-cols-[minmax(0,1.53fr)_minmax(0,1fr)]">
              {tab === 'overview' && (
                <>
                  <ReportsHiringTrendCard />
                  <ReportsStatusCard />
                </>
              )}
              {tab === 'jobs' && (
                <>
                  <ReportsJobsTrendCard />
                  <ReportsJobsStatusCard />
                </>
              )}
              {tab === 'applications' && (
                <>
                  <ReportsApplicationsTrendCard />
                  <ReportsApplicationsStatusCard />
                </>
              )}
              {tab === 'users' && (
                <>
                  <ReportsUsersTrendCard />
                  <ReportsUsersTypeCard />
                </>
              )}
              {tab === 'recruiters' && (
                <>
                  <ReportsRecruitersActivityCard />
                  <ReportsRecruitersStatusCard />
                </>
              )}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:min-h-0 lg:grid-cols-2 lg:grid-rows-[calc(253*var(--u))_calc(253*var(--u))] lg:gap-[calc(18*var(--u))] xl:grid-cols-[minmax(0,1.03fr)_minmax(0,1fr)_minmax(0,1.18fr)] xl:grid-rows-1 xl:gap-[calc(16*var(--u))]">
              {tab === 'overview' && (
                <>
                  <ReportsTopCategoriesCard />
                  <ReportsTopLocationsCard />
                  <div className="h-full min-h-0 lg:col-span-2 xl:col-span-1">
                    <ReportsPlatformGrowthCard />
                  </div>
                </>
              )}
              {tab === 'jobs' && (
                <>
                  <ReportsJobsCategoriesCard />
                  <div className="h-full min-h-0 xl:col-span-2">
                    <ReportsRecentJobsCard />
                  </div>
                </>
              )}
              {tab === 'applications' && (
                <>
                  <ReportsApplicationsCategoriesCard />
                  <ReportsApplicationsLocationsCard />
                  <ReportsRecentApplicationsCard />
                </>
              )}
              {tab === 'users' && (
                <>
                  <ReportsUsersLocationsCard />
                  <div className="h-full min-h-0 xl:col-span-2">
                    <ReportsRecentUsersCard />
                  </div>
                </>
              )}
              {tab === 'recruiters' && (
                <>
                  <ReportsRecruitersLeaderboardCard />
                  <div className="h-full min-h-0 xl:col-span-2">
                    <ReportsRecentRecruitersCard />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
