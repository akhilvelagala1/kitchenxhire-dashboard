import { Plus, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { HireMenu } from './HireMenu';
import { resumeFieldLabel } from './styles';

interface HireChipFieldProps {
  label: string;
  addLabel: string;
  values: string[];
  options: readonly { value: string; label: string }[];
  onChange: (next: string[]) => void;
  error?: { message?: string };
}

/** Multi-pick Hire listbox that stores choices as removable chips. */
export function HireChipField({
  label,
  addLabel,
  values,
  options,
  onChange,
  error
}: HireChipFieldProps) {
  const reactId = useId();
  const triggerId = `${label.replace(/[^\w-]+/g, '-')}-${reactId}`;
  const listId = `${triggerId}-menu`;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const remaining = options.filter((opt) => !values.includes(opt.value));

  return (
    <div className="flex flex-col gap-2">
      <p id={triggerId} className={resumeFieldLabel}>
        {label}
      </p>
      {values.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => {
            const item = options.find((opt) => opt.value === value);
            return (
              <li key={value}>
                <button
                  type="button"
                  onClick={() => onChange(values.filter((current) => current !== value))}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-[13px] font-bold text-brand-600"
                >
                  {item?.label ?? value}
                  <X className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Remove {item?.label ?? value}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {remaining.length > 0 ? (
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-labelledby={triggerId}
            onClick={() => setOpen((current) => !current)}
            className="inline-flex min-h-10 items-center gap-1.5 text-[14px] font-extrabold text-brand-600 hover:underline"
          >
            <Plus className="size-4" aria-hidden="true" />
            {addLabel}
          </button>
          <HireMenu
            id={listId}
            labelledBy={triggerId}
            open={open}
            value=""
            options={remaining}
            triggerRef={triggerRef}
            minWidth={220}
            onClose={() => setOpen(false)}
            onChange={(next) => {
              onChange([...values, next]);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-[12px] font-medium text-danger-600">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
