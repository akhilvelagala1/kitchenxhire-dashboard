import { Search, X } from 'lucide-react';
import { recruiterMyApplicationsFilterInput } from './recruiterMyApplicationsStyles';

interface RecruiterMyApplicationsJobsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecruiterMyApplicationsJobsSearch({
  value,
  onChange
}: RecruiterMyApplicationsJobsSearchProps) {
  return (
    <label className="relative block min-w-0 max-w-[420px]">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
        aria-hidden
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search job title..."
        className={`${recruiterMyApplicationsFilterInput} pl-9 pr-9`}
      />
      {value.trim() && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      )}
    </label>
  );
}
