import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import type { SortDirection } from '@/shared/api/types';
import type { RowSelection } from '@/shared/hooks/useRowSelection';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Pagination, type PaginationProps } from './Pagination';

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Server sort key. Omit for columns the API cannot sort by. */
  sortKey?: string;
  /** Applied to the header and every cell of the column, so it is the place for widths and alignment. */
  className?: string;
}

type Density = 'comfortable' | 'compact';

/**
 * Cell spacing per density. `compact` is for dashboard tables: single-line 24px rows from lg up.
 * Below lg it keeps tap-sized rows and the wrapper scrolls sideways instead of squeezing (UI-07).
 * Sizes follow the Tailwind spacing scale and the dense text tokens, so on a `.fit-scale` page they
 * grow with the screen. A column that should absorb the squeeze and end in an ellipsis takes
 * `lg:max-w-0 lg:min-w-16` in its `className`; every other column fits its content.
 */
const CELL: Record<Density, { th: string; td: string; pick: string }> = {
  comfortable: {
    th: 'px-4 py-3',
    td: 'px-4 py-3 text-sm',
    pick: 'w-12 px-4 py-3'
  },
  compact: {
    th: 'px-3 py-2.5 whitespace-nowrap lg:h-5.5 lg:overflow-hidden lg:px-1 lg:py-0 lg:text-dense-2xs lg:text-ellipsis',
    td: 'px-3 py-2.5 text-sm whitespace-nowrap lg:h-[calc(23*var(--u))] lg:overflow-hidden lg:px-1 lg:py-0 lg:text-dense-xs lg:text-ellipsis',
    pick: 'w-10 px-2 py-0 lg:w-7 lg:px-0.5'
  }
};

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  /** When false, render only the table (pagination is the caller's responsibility). */
  showPagination?: boolean;
  sort?: {
    key: string | undefined;
    order: SortDirection | undefined;
    onChange: (key: string, order: SortDirection) => void;
  };
  selection?: RowSelection;
  /** Omit when the caller draws its own pager. */
  pagination?: PaginationProps;
  empty: { title: string; description?: string; action?: ReactNode };
  caption: string;
  /** `compact` gives dense single-line rows on desktop. Defaults to `comfortable`. */
  density?: Density;
  /** Set false when the table already sits inside a card that draws the border. */
  framed?: boolean;
}

function PickBox({
  label,
  checked,
  onChange,
  compact
}: {
  label: string;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  compact: boolean;
}) {
  const box = (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={onChange}
      className="size-4"
    />
  );
  // The whole cell becomes the click target, so a 24px row still has a comfortable hit area.
  return compact ? (
    <label className="flex h-11 min-w-11 cursor-pointer items-center justify-center lg:h-6 lg:min-w-6">
      {box}
    </label>
  ) : (
    box
  );
}

/**
 * The list table for every entity page: server sort, selection, pagination and
 * the loading/empty/error states are built in so no page can forget them (UI-04).
 */
export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns,
    rows,
    getRowId,
    isLoading,
    error,
    onRetry,
    sort,
    selection,
    pagination,
    showPagination = true,
    empty,
    caption,
    density = 'comfortable',
    framed = true
  } = props;
  const compact = density === 'compact';
  const cell = CELL[density];
  const ids = rows?.map(getRowId) ?? [];
  const allSelected =
    selection !== undefined && ids.length > 0 && ids.every((id) => selection.selected.has(id));
  const colCount = columns.length + (selection ? 1 : 0);

  function header(col: Column<T>) {
    if (!sort || !col.sortKey) return col.header;
    const active = sort.key === col.sortKey;
    const next: SortDirection = active && sort.order === 'asc' ? 'desc' : 'asc';
    const SortIcon = !active ? ArrowUpDown : sort.order === 'asc' ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        className="group/sort inline-flex items-center gap-1 font-medium"
        onClick={() => sort.onChange(col.sortKey!, next)}
      >
        {col.header}
        <SortIcon
          className={cn(
            'size-3.5',
            compact && 'lg:size-3',
            !active && 'text-ink-soft',
            // Dense tables only draw the arrow on the sorted column, or on hover and focus.
            compact &&
              !active &&
              'lg:hidden lg:group-hover/sort:block lg:group-focus-visible/sort:block'
          )}
        />
      </button>
    );
  }

  function body() {
    if (error) {
      return (
        <tr>
          <td colSpan={colCount}>
            <ErrorState error={error} onRetry={onRetry} />
          </td>
        </tr>
      );
    }
    if (isLoading || !rows) {
      return Array.from({ length: 5 }, (_, i) => (
        <tr key={i}>
          {Array.from({ length: colCount }, (_, j) => (
            <td key={j} className={compact ? cell.td : 'px-4 py-3'}>
              <Skeleton className="h-4 w-full lg:h-3" />
            </td>
          ))}
        </tr>
      ));
    }
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan={colCount}>
            <EmptyState {...empty} />
          </td>
        </tr>
      );
    }
    return rows.map((row) => {
      const id = getRowId(row);
      return (
        <tr key={id} className="border-t border-line hover:bg-muted/50">
          {selection && (
            <td className={cell.pick}>
              <PickBox
                label={`Select row ${id}`}
                checked={selection.selected.has(id)}
                onChange={() => selection.toggle(id)}
                compact={compact}
              />
            </td>
          )}
          {columns.map((col) => (
            <td key={col.id} className={cn(cell.td, 'text-ink', col.className)}>
              {col.cell(row)}
            </td>
          ))}
        </tr>
      );
    });
  }

  return (
    <div className={cn(framed && 'rounded-lg border border-line bg-surface')}>
      {/* `relative` so absolutely positioned screen-reader text is clipped here, not left to widen the page. */}
      <div className="relative overflow-x-auto">
        <table
          data-density={density}
          className={cn('w-full text-left', compact && 'min-w-[860px] lg:min-w-0')}
        >
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-muted text-xs text-ink-soft uppercase">
            <tr>
              {selection && (
                <th scope="col" className={cell.pick}>
                  <PickBox
                    label="Select all rows on this page"
                    checked={allSelected}
                    onChange={(e) => selection.setAll(ids, e.target.checked)}
                    compact={compact}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={
                    sort?.key === col.sortKey && col.sortKey
                      ? sort?.order === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(cell.th, col.className)}
                >
                  {header(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{body()}</tbody>
        </table>
      </div>
      {!error && showPagination && pagination && <Pagination {...pagination} />}
    </div>
  );
}
