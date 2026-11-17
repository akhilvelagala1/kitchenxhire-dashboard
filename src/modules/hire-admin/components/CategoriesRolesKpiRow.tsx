import { useQuery } from '@tanstack/react-query';
import { MoveUpRight, Tag, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/Skeleton';
import { adminCategoriesApi } from '../api/adminCategoriesApi';
import { adminCategoriesKeys } from '../api/adminCategoriesKeys';
import type { CategoriesRolesSummaryKey } from '../schemas/adminCategoryRole';

interface KpiDef {
  key: CategoriesRolesSummaryKey;
  label: string;
  noun: string;
  icon: LucideIcon;
  /** The flat pastel panel inside the white card. */
  panel: string;
  /** The soft round badge behind the icon, and the icon colour. */
  badge: string;
}

const KPI_DEFS: KpiDef[] = [
  {
    key: 'categories',
    label: 'Total Categories',
    noun: 'categories',
    icon: Tag,
    panel: 'bg-[#FEF1ED]',
    badge: 'bg-linear-to-br from-[#FEF0E9] to-[#FEE3D2] text-[#FF4B16]'
  },
  {
    key: 'roles',
    label: 'Total Roles',
    noun: 'roles',
    icon: Users,
    panel: 'bg-[#F4EEFE]',
    badge: 'bg-linear-to-br from-[#F1E9FD] to-[#E9DDFD] text-[#7C3AED]'
  }
];

/*
 * Each card is two layers, as in the picture: a white card 118 design px tall with a soft shadow,
 * and a flat pastel panel inset 6 design px inside it. The same frame wraps the loading and error
 * states so the grid below never jumps.
 */
const FRAME =
  'min-w-0 rounded-[20px] bg-white p-1.5 shadow-[0_4px_14px_rgba(16,24,40,0.06)] lg:h-[calc(118*var(--u))] lg:rounded-[calc(20*var(--u))] lg:p-[calc(6*var(--u))]';
const PANEL =
  'flex h-full min-h-28 min-w-0 items-center gap-4 overflow-hidden rounded-[14px] px-4 py-3 lg:min-h-0 lg:gap-[calc(28*var(--u))] lg:rounded-[calc(14*var(--u))] lg:px-[calc(15*var(--u))] lg:py-0';

function Growth({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold lg:gap-x-[calc(6*var(--u))] lg:text-[calc(14*var(--u))]">
      <MoveUpRight
        aria-hidden
        className={cn(
          'size-4 lg:size-[calc(16*var(--u))]',
          up ? 'text-[#0F7A3A]' : 'rotate-90 text-[#B42318]'
        )}
        strokeWidth={2.25}
      />
      <span
        className={cn(
          'rounded-md px-1.5 py-px font-bold lg:rounded-[calc(6*var(--u))] lg:px-[calc(6*var(--u))]',
          up ? 'bg-[#E4F4E6] text-[#0F7A3A]' : 'bg-[#FDE8E7] text-[#B42318]'
        )}
      >
        {up ? '+' : ''}
        {value}%
      </span>
      <span className="font-normal whitespace-nowrap text-[#202A3A]">vs last month</span>
    </span>
  );
}

function KpiSkeleton() {
  return (
    <div className={FRAME}>
      <div className={cn(PANEL, 'bg-[#F6F7FA]')}>
        <Skeleton className="size-16 shrink-0 rounded-full lg:size-[calc(72*var(--u))]" />
        <span className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3.5 w-32" />
        </span>
      </div>
    </div>
  );
}

function KpiCard({ def, value, growth }: { def: KpiDef; value: number; growth: number }) {
  const Icon = def.icon;
  const shown = value.toLocaleString('en-IN');
  return (
    <div role="group" aria-label={`${def.label}, ${shown} ${def.noun}`} className={FRAME}>
      <div className={cn(PANEL, def.panel)}>
        <span
          className={cn(
            'flex size-16 shrink-0 items-center justify-center rounded-full lg:size-[calc(72*var(--u))]',
            def.badge
          )}
        >
          <Icon className="size-9 lg:size-[calc(40*var(--u))]" strokeWidth={1.8} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] leading-5 font-semibold text-[#111111] lg:text-[calc(15*var(--u))]">
            {def.label}
          </span>
          <span className="block text-[32px] leading-10 font-bold text-[#111111] lg:text-[calc(32*var(--u))] lg:leading-[calc(40*var(--u))]">
            {shown}
          </span>
          <Growth value={growth} />
        </span>
      </div>
    </div>
  );
}

/** Two equal cards: how many categories and how many roles there are, with growth against last month. */
export function CategoriesRolesKpiRow() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: adminCategoriesKeys.summary(),
    queryFn: () => adminCategoriesApi.summary()
  });
  const failed = isError && !data;

  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 lg:gap-[calc(10*var(--u))]"
      aria-busy={isLoading || undefined}
    >
      {isLoading && (
        <>
          <span role="status" className="sr-only">
            Loading category and role counts
          </span>
          <KpiSkeleton />
          <KpiSkeleton />
        </>
      )}
      {failed && !isLoading && (
        <div role="alert" className={cn(FRAME, 'col-span-full')}>
          <div
            className={cn(
              PANEL,
              'flex-wrap justify-center bg-[#F6F7FA] text-sm text-ink-soft lg:text-[calc(14*var(--u))]'
            )}
          >
            <span>Could not load the category and role counts.</span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="min-h-11 rounded-lg border border-[#E9ECF2] bg-white px-3 py-1.5 font-semibold text-[#202A3A] hover:bg-[#F6F7FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:min-h-0"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {data &&
        KPI_DEFS.map((def) => (
          <KpiCard
            key={def.key}
            def={def}
            value={data[def.key]}
            growth={data.growth_pct[def.key]}
          />
        ))}
    </div>
  );
}
