import { CalendarDays, ChevronDown } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';

function formatHeaderDate(d: Date) {
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// A date input speaks local YYYY-MM-DD; toISOString() is UTC and can land on the wrong day.
function toInputValue(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function fromInputValue(value: string): Date | null {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function DashboardPageHeader() {
  const [selected, setSelected] = useState(() => new Date());
  const inputRef = useRef<HTMLInputElement>(null);
  const label = useMemo(() => formatHeaderDate(selected), [selected]);

  // Clicking a label never opens a date input's calendar, so ask the input to show it.
  function openPicker() {
    const input = inputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  }

  return (
    <PageHeader
      title="Admin Dashboard"
      titleClassName="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold leading-tight"
      description="Manage the entire KitchenX Hiring platform — jobs, users, applications and businesses."
      descriptionClassName="mt-2 text-base text-[#667085]"
      className="mb-[26px] md:items-start"
      actions={
        <div className="relative">
          <button
            type="button"
            onClick={openPicker}
            aria-label={`Dashboard date, ${label}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-surface px-3 text-sm text-ink shadow-sm hover:bg-muted"
          >
            <CalendarDays className="size-4 text-[#667085]" aria-hidden />
            <span className="font-medium">{label}</span>
            <ChevronDown className="size-4 text-[#667085]" aria-hidden />
          </button>
          <input
            ref={inputRef}
            type="date"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full opacity-0"
            value={toInputValue(selected)}
            onChange={(e) => {
              const next = fromInputValue(e.target.value);
              if (next) setSelected(next);
            }}
          />
        </div>
      }
    />
  );
}
