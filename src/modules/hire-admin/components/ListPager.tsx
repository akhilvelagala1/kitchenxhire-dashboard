import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Select } from '@/shared/ui/Input';
import { pagerItems } from './jobsPagerItems';
import { LIST_PAGE_SIZES } from './listParams';

const BTN =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-lg border px-2 text-sm font-medium transition ' +
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 ' +
  'disabled:cursor-not-allowed disabled:opacity-40 lg:h-8.5 lg:min-w-8.5 lg:px-2.5 lg:text-dense-md';
const IDLE = 'border-[#E3E6EC] bg-white text-[#202A3A] hover:bg-[#FAFBFD]';

const grouped = (n: number) => n.toLocaleString('en-IN');

interface ListPagerProps {
  page: number;
  pageSize: number;
  /** Undefined until the first list has arrived. */
  total: number | undefined;
  /** Plural name of the rows, lower case: `applications`, `recruiters`. */
  noun: string;
  onPageChange: (page: number) => void;
  /** The page-size picker is drawn only when this is given. Leave it out for a fixed page size. */
  onPageSizeChange?: (size: number) => void;
  /** Words on the previous and next buttons and no page-size picker, as in the Users picture. */
  labelledNav?: boolean;
}

/** `Showing 1 – 5 of 8,672 applications`, or `Showing 0 applications` when there are none. */
function showingText(page: number, pageSize: number, total: number, noun: string): string {
  if (total === 0) return `Showing 0 ${noun}`;
  const last = Math.min(page * pageSize, total);
  const first = Math.min((page - 1) * pageSize + 1, last);
  return `Showing ${grouped(first)} – ${grouped(last)} of ${grouped(total)} ${noun}`;
}

/**
 * One footer row: the count on the left, previous / numbered / next buttons and the page-size
 * picker (when `onPageSizeChange` is given) on the right. `total` is undefined until the first list
 * has arrived, and then only the page-size picker shows. A single page has no numbered buttons, but
 * keeps the text.
 */
export function ListPager({
  page,
  pageSize,
  total,
  noun,
  onPageChange,
  onPageSizeChange,
  labelledNav
}: ListPagerProps) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const navName = `${noun.charAt(0).toUpperCase()}${noun.slice(1)} pagination`;

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:mt-3.5">
      <p className="text-sm text-ink-600 lg:text-dense-md">
        {total === undefined ? '' : showingText(page, pageSize, total, noun)}
      </p>
      <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
        {total !== undefined && totalPages > 1 && (
          <nav aria-label={navName} className="flex flex-wrap items-center gap-1.25">
            <button
              type="button"
              aria-label="Previous page"
              className={cn(BTN, IDLE, labelledNav && 'px-3.5! lg:px-3.5!')}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {labelledNav ? 'Previous' : <ChevronLeft aria-hidden className="size-4" />}
            </button>
            {pagerItems(page, totalPages).map((item) =>
              typeof item === 'string' ? (
                <span key={item} aria-hidden className="px-1.5 text-[#7C8799]">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-label={`Page ${grouped(item)}`}
                  aria-current={item === page ? 'page' : undefined}
                  className={cn(
                    BTN,
                    item === page ? 'border-brand-600 bg-brand-600 text-white' : IDLE
                  )}
                  onClick={() => onPageChange(item)}
                >
                  {grouped(item)}
                </button>
              )
            )}
            <button
              type="button"
              aria-label="Next page"
              className={cn(BTN, IDLE, labelledNav && 'px-3.5! lg:px-3.5!')}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {labelledNav ? 'Next' : <ChevronRight aria-hidden className="size-4" />}
            </button>
          </nav>
        )}
        {onPageSizeChange && !labelledNav && (
          <Select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="w-auto! lg:h-8.5 lg:min-h-0 lg:rounded-lg lg:py-0 lg:text-dense-md"
          >
            {LIST_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}
