import { ReportsTimeToHireCategoriesCard } from './ReportsTimeToHireCategoriesCard';
import { ReportsTimeToHireTrendCard } from './ReportsTimeToHireTrendCard';

/**
 * What the Avg. Time to Hire stat card opens: how the average moved on the left and which job
 * categories are slow on the right, 1.65 to 1 as in the reference picture. From xl they sit side by
 * side; below that they stack, each taking half of the height it is given. The gaps are those of the
 * page's other card rows. Each card reads the same request, so it is made once.
 */
export function ReportsTimeToHireSection() {
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-rows-2 lg:gap-[calc(18*var(--u))] xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] xl:grid-rows-1 xl:gap-[calc(17*var(--u))]">
      <ReportsTimeToHireTrendCard />
      <ReportsTimeToHireCategoriesCard />
    </div>
  );
}
