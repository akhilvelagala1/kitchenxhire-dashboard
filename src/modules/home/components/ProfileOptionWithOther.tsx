import { List, type LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FieldError } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import {
  PROFILE_OTHER_VALUE,
  isPresetProfileOption,
  withOtherOption
} from '../content/profileFormOptions';
import { ProfileIconSelect } from './ProfileIconSelect';

interface ProfileOptionWithOtherProps {
  label: string;
  icon: LucideIcon;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: FieldError;
  options: readonly { value: string; label: string }[];
  customPlaceholder: string;
  /** Digits-only entry when the user chooses Other (Expected Salary). */
  mode?: 'text' | 'salary';
  required?: boolean;
}

/**
 * Preset ProfileIconSelect that swaps in-place to an icon text input when the user
 * picks Other / Enter manually — same footprint, no stacked second field.
 */
export function ProfileOptionWithOther({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  error,
  options,
  customPlaceholder,
  mode = 'text',
  required = false
}: ProfileOptionWithOtherProps) {
  const isPreset = isPresetProfileOption(options, value);
  const [manualOpen, setManualOpen] = useState(
    value === PROFILE_OTHER_VALUE || (!isPreset && value.length > 0)
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = value === PROFILE_OTHER_VALUE ? '' : isPreset && manualOpen ? '' : value;

  function enterManual() {
    setManualOpen(true);
    onChange(PROFILE_OTHER_VALUE);
    queueMicrotask(() => inputRef.current?.focus());
  }

  function returnToList() {
    setManualOpen(false);
    onChange('');
  }

  if (manualOpen) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={name} className="text-[14px] font-bold text-ink">
          {label}
          {required ? <span className="text-danger-600"> *</span> : null}
        </label>
        <div className="relative w-full">
          <Icon
            className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-[19px] -translate-y-1/2 text-brand-600"
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            id={name}
            value={displayValue}
            inputMode={mode === 'salary' ? 'numeric' : undefined}
            autoComplete="off"
            onChange={(event) => {
              const next = event.target.value;
              if (mode === 'salary') {
                onChange(next.replace(/\D/g, ''));
                return;
              }
              onChange(next);
            }}
            placeholder={customPlaceholder}
            aria-invalid={Boolean(error)}
            className={cn(
              'h-[52px] rounded-xl pl-11 pr-11 text-[14px] font-semibold',
              error && 'border-danger-600'
            )}
          />
          <button
            type="button"
            aria-label="Choose from list"
            title="Choose from list"
            onClick={returnToList}
            className="absolute top-1/2 right-2.5 z-10 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            <List className="size-4" aria-hidden="true" />
          </button>
        </div>
        {error ? (
          <p role="alert" className="text-[12px] font-medium text-danger-600">
            {error.message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <ProfileIconSelect
      label={label}
      icon={Icon}
      name={name}
      value={isPreset ? value : ''}
      required={required}
      onChange={(next) => {
        if (next === PROFILE_OTHER_VALUE) {
          enterManual();
          return;
        }
        setManualOpen(false);
        onChange(next);
      }}
      error={error}
      options={withOtherOption(options)}
    />
  );
}
