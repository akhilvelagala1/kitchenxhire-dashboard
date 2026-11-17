import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Briefcase, ChefHat, Sparkles, Truck, Users } from 'lucide-react';
import { Link } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';
import { cn } from '@/shared/lib/cn';
import { fetchOpenJobsByCategory } from '../api/hireDashboardApi';
import { hireDashboardKeys } from '../api/hireDashboardKeys';
import { dashboardCardClass } from './dashboardCardStyles';

const ICONS: Record<string, typeof Briefcase> = {
  chef: ChefHat,
  helper: Users,
  cleaning: Sparkles,
  delivery: Truck,
  other: Briefcase
};

export function OpenJobsByCategoryCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: hireDashboardKeys.openJobsByCategory,
    queryFn: fetchOpenJobsByCategory
  });

  const max = data?.reduce((m, row) => Math.max(m, row.count), 0) ?? 1;

  return (
    <section className={cn(dashboardCardClass, 'h-full')}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E9ECF1] px-5 py-4">
        <h2 className="text-lg font-bold text-ink">Open Jobs by Category</h2>
        <Link
          to="/admin/jobs"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View all
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      {isLoading && (
        <div className="flex flex-1 items-center justify-center py-10">
          <Spinner />
        </div>
      )}
      {isError && <p className="p-4 text-sm text-ink-soft">Could not load categories.</p>}
      {data && (
        <ul className="space-y-3.5 px-5 py-4">
          {data.map((row) => {
            const Icon = ICONS[row.id] ?? Briefcase;
            const pct = Math.round((row.count / max) * 100);
            return (
              <li key={row.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className="size-[18px] shrink-0 text-brand-600" strokeWidth={1.75} />
                    <span className="truncate text-sm font-medium text-ink">{row.label}</span>
                  </div>
                  <span className="text-sm font-bold text-ink">{row.count}</span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-[#E9EBF0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-[#FF7A4D] transition-[width] duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
