import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

export function BulkActionBar({
  count,
  onClear,
  children,
  compact
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
  /** Tighter padding for dense desktop tables. The caller sizes its own action buttons. */
  compact?: boolean;
}) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        'mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-brand-50 px-4 py-2',
        compact && 'lg:mb-2 lg:px-3 lg:py-1'
      )}
    >
      <span className="text-sm font-medium text-brand-600">{count} selected</span>
      {children}
      <Button
        variant="ghost"
        onClick={onClear}
        className={compact ? 'lg:min-h-8 lg:text-xs' : undefined}
      >
        Clear selection
      </Button>
    </div>
  );
}
