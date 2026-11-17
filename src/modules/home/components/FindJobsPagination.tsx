import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';

interface FindJobsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Override layout (e.g. flush end-aligned footer inside a results card). */
  className?: string;
}

/** Reference-style page strip: 1 … window … last when there are many pages. */
function pageWindow(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];
  if (current <= 4) {
    for (let p = 2; p <= 5; p += 1) pages.push(p);
    pages.push('ellipsis', total);
    return pages;
  }
  if (current >= total - 3) {
    pages.push('ellipsis');
    for (let p = total - 4; p <= total; p += 1) pages.push(p);
    return pages;
  }

  pages.push('ellipsis');
  for (let p = current - 1; p <= current + 1; p += 1) pages.push(p);
  pages.push('ellipsis', total);
  return pages;
}

const pageBtn =
  'grid size-9 place-items-center rounded-full text-[13px] font-extrabold transition-colors';

export function FindJobsPagination({
  page,
  totalPages,
  onPageChange,
  className
}: FindJobsPaginationProps) {
  const { tx } = useHireLanguage();
  const items = pageWindow(page, totalPages);

  return (
    <nav
      aria-label={tx('Job results pages')}
      className={cn(
        'mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-line pt-6',
        className
      )}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex h-10 items-center gap-1 rounded-md px-3 text-[13px] font-bold text-ink-600 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ChevronLeft className="size-4" />
        {tx('Previous')}
      </button>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`e-${index}`} className="px-1.5 text-[13px] font-bold text-ink-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                pageBtn,
                item === page
                  ? 'bg-brand-600 text-white shadow-btn-orange-slim'
                  : 'text-ink-700 hover:bg-muted'
              )}
            >
              {item}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex h-10 items-center gap-1 rounded-md px-3 text-[13px] font-bold text-ink-600 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"
      >
        {tx('Next')}
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
