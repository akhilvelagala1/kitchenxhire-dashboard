import type { ReactNode } from 'react';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/Skeleton';
import { jobsCardClass } from './jobsCardStyles';

interface ReportCardProps {
  title: string;
  /** Muted line under the title. */
  subtitle?: string;
  /** Muted text on the title line, for example "(Applications)". */
  titleNote?: string;
  /** Shown before the title, for example the orange map pin of Top Locations. */
  icon?: ReactNode;
  /** The right end of the header row, for example a chart legend. */
  aside?: ReactNode;
  isLoading: boolean;
  /** A failed request with nothing to show: the card shows the error state with a retry. */
  error?: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * The white frame of every card on the Reports page: title row, then the body, which is the
 * loading, error or empty state until there is something to draw. The body fills the rest of the
 * card, so a chart can take `flex-1` and a `min-h-0`.
 */
export function ReportCard({
  title,
  subtitle,
  titleNote,
  icon,
  aside,
  isLoading,
  error,
  onRetry,
  isEmpty,
  className,
  children
}: ReportCardProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        jobsCardClass,
        'flex min-w-0 flex-col p-4 lg:rounded-[calc(16*var(--u))] lg:px-[calc(17*var(--u))] lg:pt-[calc(13*var(--u))] lg:pb-[calc(12*var(--u))]',
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#101828] lg:gap-[calc(8*var(--u))] lg:text-[calc(21*var(--u))]">
            {icon}
            <span>{title}</span>
            {titleNote && (
              <span className="text-sm font-normal text-[#667085] lg:text-[calc(15*var(--u))]">
                {titleNote}
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-[#475467] lg:mt-[calc(2*var(--u))] lg:text-[calc(14*var(--u))]">
              {subtitle}
            </p>
          )}
        </div>
        {aside}
      </header>
      <div className="mt-3 flex min-h-0 flex-1 flex-col lg:mt-[calc(6*var(--u))]">
        {isLoading ? (
          <>
            <span role="status" className="sr-only">
              Loading {title}
            </span>
            <Skeleton className="min-h-40 flex-1 rounded-xl" />
          </>
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : isEmpty ? (
          <EmptyState title="No data for this period" description="Try a longer date range." />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
