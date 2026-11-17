import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import type { TrendRange } from '../api/hireDashboardTypes';

const OPTIONS: { value: TrendRange; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' }
];

export function TrendRangeDropdown({
  value,
  onChange
}: {
  value: TrendRange;
  onChange: (next: TrendRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const label = OPTIONS.find((o) => o.value === value)?.label ?? 'Last 30 Days';

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-muted"
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <ChevronDown className="size-4 text-ink-soft" aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+4px)] right-0 z-20 min-w-[168px] rounded-xl border border-line bg-surface py-1 shadow-lg"
        >
          {OPTIONS.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-muted',
                  o.value === value && 'bg-brand-50 font-medium text-brand-600'
                )}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
