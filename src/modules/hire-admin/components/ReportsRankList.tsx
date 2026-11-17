import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { RankedCount } from '../schemas/adminReports';
import { categoryBarColor } from './jobCategoryVisuals';
import { formatCount, formatShare } from './reportsFormat';

type RankVariant = 'category' | 'location';

/**
 * What differs between the two ranking cards, in design pixels (u) from lg up. The columns are, left
 * to right: icon, name, bar, count, share. The name column is as wide as the longest name and takes
 * any room the bar does not need; the bar gets what is left, between its two limits. Every row reads
 * the same columns, so the bars and the numbers line up whatever the data.
 */
const VARIANTS: Record<RankVariant, { list: string; row: string; name: string }> = {
  category: {
    list: 'lg:auto-rows-[minmax(0,calc(31*var(--u)))] lg:grid-cols-[auto_minmax(min-content,1fr)_minmax(calc(56*var(--u)),calc(110*var(--u)))_auto_auto]',
    row: '',
    name: 'lg:max-w-[calc(190*var(--u))] lg:text-[calc(14*var(--u))]'
  },
  location: {
    list: 'lg:auto-rows-[minmax(0,calc(33*var(--u)))] lg:grid-cols-[auto_minmax(min-content,1fr)_minmax(calc(56*var(--u)),calc(115*var(--u)))_auto_auto]',
    row: 'border-t border-[#EEF0F4] first:border-t-0',
    name: 'lg:max-w-[calc(150*var(--u))] lg:text-[calc(15*var(--u))]'
  }
};

interface ReportsRankListProps {
  rows: RankedCount[];
  /** What each share is out of: jobs posted for categories, applications for locations. */
  total: number;
  variant: RankVariant;
  /** The picture before a name. Decorative, because the name already says it. */
  renderIcon: (label: string) => ReactNode;
}

/**
 * Icon, name, bar, count and share on one line per row. A bar is its count over the largest count,
 * softer as it falls. Shares are worked out here from the counts; the API never sends them.
 */
export function ReportsRankList({ rows, total, variant, renderIcon }: ReportsRankListProps) {
  const styles = VARIANTS[variant];
  const largest = Math.max(...rows.map((row) => row.count), 1);

  return (
    <ul
      className={cn(
        'grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)_3rem_auto_auto] content-start gap-x-2 sm:grid-cols-[auto_minmax(0,1fr)_4.5rem_auto_auto] lg:gap-x-[calc(9*var(--u))]',
        styles.list
      )}
    >
      {rows.map((row) => {
        const ratio = row.count / largest;
        return (
          <li
            key={row.label}
            className={cn(
              'col-span-full grid min-h-9 grid-cols-subgrid items-center text-sm lg:min-h-0 lg:text-[calc(14*var(--u))]',
              styles.row
            )}
          >
            {renderIcon(row.label)}
            <span
              title={row.label}
              className={cn('truncate font-medium text-[#101828]', styles.name)}
            >
              {row.label}
            </span>
            <span
              aria-hidden
              className="h-2 overflow-hidden rounded-full bg-[#EEF0F4] lg:h-[calc(9*var(--u))]"
            >
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.round(ratio * 1000) / 10}%`,
                  backgroundColor: categoryBarColor(ratio)
                }}
              />
            </span>
            <span className="text-right font-bold whitespace-nowrap text-[#101828] tabular-nums">
              {formatCount(row.count)}
            </span>
            <span className="whitespace-nowrap text-[#667085]">
              ({formatShare(row.count, total)})
            </span>
          </li>
        );
      })}
    </ul>
  );
}
