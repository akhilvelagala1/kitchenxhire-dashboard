import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

/** Lays out search, filters and the reset control the same way on every list page. */
export function FilterBar({
  children,
  onReset,
  hasActive,
  inline
}: {
  children: ReactNode;
  onReset: () => void;
  hasActive: boolean;
  /** For a toolbar row beside a title: wraps when narrow, no bottom margin, denser controls on desktop. */
  inline?: boolean;
}) {
  return (
    <div
      role="search"
      className={cn(
        'flex gap-2',
        inline
          ? 'min-w-0 flex-wrap items-center'
          : 'mb-4 flex-col md:flex-row md:flex-wrap md:items-center'
      )}
    >
      {children}
      {hasActive && (
        <Button
          variant="ghost"
          onClick={onReset}
          className={inline ? 'lg:min-h-8 lg:px-2 lg:text-xs' : undefined}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
