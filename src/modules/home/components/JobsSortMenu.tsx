import { ChevronDown } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { SORT_OPTIONS } from '../content/filterOptions';
import type { SortOption } from '../schemas/findJobs';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { HireMenu } from './HireMenu';

interface JobsSortMenuProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

/** Compact sort control. The menu opens under the button, on the same row as the job count. */
export function JobsSortMenu({ value, onChange }: JobsSortMenuProps) {
  const { tx } = useHireLanguage();
  const triggerId = useId();
  const listId = `${triggerId}-menu`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selectedLabel =
    SORT_OPTIONS.find((option) => option.id === value)?.label ?? 'Most Relevant';

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={tx('Sort by')}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3 text-[13px] font-bold whitespace-nowrap text-ink"
      >
        <span>{tx(selectedLabel)}</span>
        <ChevronDown className="size-3.5 text-ink-400" aria-hidden="true" />
      </button>
      <HireMenu
        id={listId}
        labelledBy={triggerId}
        open={open}
        value={value}
        options={SORT_OPTIONS.map((option) => ({ value: option.id, label: tx(option.label) }))}
        triggerRef={triggerRef}
        minWidth={210}
        onChange={(next) => onChange(next as SortOption)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
