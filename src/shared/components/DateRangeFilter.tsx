import { Input } from '@/shared/ui/Input';

interface DateRangeFilterProps {
  from: string | undefined;
  to: string | undefined;
  onChange: (from: string | undefined, to: string | undefined) => void;
  label?: string;
}

/** Inclusive YYYY-MM-DD range. The server interprets it in the business timezone. */
export function DateRangeFilter({ from, to, onChange, label = 'Date' }: DateRangeFilterProps) {
  return (
    <fieldset className="flex items-center gap-2">
      <legend className="sr-only">{label} range</legend>
      <Input
        type="date"
        aria-label={`${label} from`}
        value={from ?? ''}
        max={to}
        onChange={(e) => onChange(e.target.value || undefined, to)}
        className="w-auto"
      />
      <span aria-hidden className="text-ink-soft">
        –
      </span>
      <Input
        type="date"
        aria-label={`${label} to`}
        value={to ?? ''}
        min={from}
        onChange={(e) => onChange(from, e.target.value || undefined)}
        className="w-auto"
      />
    </fieldset>
  );
}
