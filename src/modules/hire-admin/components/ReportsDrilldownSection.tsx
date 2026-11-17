import type { ReportKpiKey } from '../schemas/adminReports';
import { ReportsRecordsCard } from './ReportsRecordsCard';
import { ReportsTimeToHireSection } from './ReportsTimeToHireSection';
import {
  APPLICATIONS_CONFIG,
  HIRED_CONFIG,
  JOBS_POSTED_CONFIG,
  REJECTED_CONFIG
} from './reportsRecordsConfig';

/**
 * What the open stat card shows in place of the Overview's two chart rows: the records behind the
 * number for the first four cards, and how the average is made up for Avg. Time to Hire. The page
 * mounts it with `key={metric}`, so moving from one card to another starts the next one fresh.
 */
export function ReportsDrilldownSection({ metric }: { metric: ReportKpiKey }) {
  switch (metric) {
    case 'jobs_posted':
      return <ReportsRecordsCard config={JOBS_POSTED_CONFIG} />;
    case 'applications':
      return <ReportsRecordsCard config={APPLICATIONS_CONFIG} />;
    case 'hired':
      return <ReportsRecordsCard config={HIRED_CONFIG} />;
    case 'rejected':
      return <ReportsRecordsCard config={REJECTED_CONFIG} />;
    case 'avg_time_to_hire_days':
      return <ReportsTimeToHireSection />;
  }
}
