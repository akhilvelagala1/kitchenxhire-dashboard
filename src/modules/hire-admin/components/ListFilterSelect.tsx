import { ChevronDown } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Select } from '@/shared/ui/Input';

/** Below lg the controls keep the standard tap size; from lg up they are 36 design px tall, radius 10. */
export const LIST_FIELD = 'lg:h-9 lg:min-h-0 lg:rounded-[calc(10*var(--u))] lg:text-dense-md';
const LIST_SLOT = 'min-w-[150px] flex-1 lg:min-w-0 lg:flex-none';

/** A native select with a chevron, an optional leading icon and an accessible name, for a list toolbar. */
export function ListFilterSelect({
  label,
  value,
  onChange,
  className,
  icon,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className={cn('relative', LIST_SLOT, className)}>
      {icon}
      <Select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn('appearance-none pr-8', icon ? 'pl-9' : undefined, LIST_FIELD)}
      >
        {children}
      </Select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-ink-600"
      />
    </div>
  );
}
