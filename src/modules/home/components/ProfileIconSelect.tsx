import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useId, useRef, useState, type ComponentType } from 'react';
import type { FieldError } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { HireMenu } from './HireMenu';
import { resumeFieldInput, resumeFieldLabel } from './styles';

interface ProfileIconSelectProps {
  label: string;
  icon?: LucideIcon;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: FieldError;
  options: readonly {
    value: string;
    label: string;
    icon?: LucideIcon | ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  }[];
  placeholder?: string;
  variant?: 'default' | 'resume' | 'inline' | 'settings';
  /** Shorter control for dense modals (e.g. onboarding). */
  compact?: boolean;
  /** Shows a red asterisk after the label when the field is required. */
  required?: boolean;
  className?: string;
}

export function ProfileIconSelect({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  onBlur,
  error,
  options,
  placeholder = 'Select',
  variant = 'default',
  compact = false,
  required = false,
  className
}: ProfileIconSelectProps) {
  const isResume = variant === 'resume';
  const isSettings = variant === 'settings';
  const isInline = variant === 'inline';
  const controlHeight = compact ? 'h-[46px]' : 'h-[52px]';
  const reactId = useId();
  const triggerId = `${name.replace(/[^\w-]+/g, '-')}-${reactId}`;
  const listId = `${triggerId}-menu`;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((opt) => opt.value === value);

  function close() {
    setOpen(false);
    onBlur?.();
  }

  return (
    <div
      className={cn(
        'flex',
        isInline ? 'items-center gap-2' : 'flex-col',
        !isInline && (isResume ? 'gap-2' : isSettings || compact ? 'gap-1' : 'gap-1.5'),
        className
      )}
    >
      <label
        htmlFor={triggerId}
        className={
          isInline
            ? 'text-[13px] font-semibold whitespace-nowrap text-ink-600'
            : isResume
              ? resumeFieldLabel
              : isSettings
                ? 'text-[13px] font-bold text-ink'
                : compact
                  ? 'text-[13.5px] font-bold text-ink'
                  : 'text-[14px] font-bold text-ink'
        }
      >
        {label}
        {required ? <span className="text-danger-600"> *</span> : null}
      </label>
      <div className="relative w-full">
        {Icon ? (
          <Icon className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-[19px] -translate-y-1/2 text-brand-600" />
        ) : null}
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={Boolean(error)}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'flex w-full items-center text-left',
            isInline
              ? 'h-9 min-w-[160px] rounded-full border border-line bg-surface px-3 pr-2 text-[13px] font-bold'
              : isSettings
                ? cn(
                    'h-10 rounded-xl border border-line bg-surface px-3 pr-3 text-[13px] font-semibold',
                    Icon && 'pl-9'
                  )
                : isResume
                  ? cn(resumeFieldInput, 'border border-line bg-surface pr-3', Icon && 'pl-11')
                  : cn(
                      controlHeight,
                      'rounded-xl border border-line bg-surface px-3 pr-3 text-[14px] font-semibold',
                      Icon && 'pl-11'
                    ),
            !selected && 'text-ink-soft',
            selected && 'text-ink',
            'focus-visible:outline-2 focus-visible:outline-brand-600',
            open && 'outline-2 outline-brand-600',
            error && 'border-danger-600'
          )}
        >
          <span className="min-w-0 flex-1 truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-ink-400 transition-transform duration-[160ms]',
              open && 'rotate-180'
            )}
          />
        </button>
        <HireMenu
          id={listId}
          labelledBy={triggerId}
          open={open}
          value={value}
          options={options}
          triggerRef={triggerRef}
          onChange={onChange}
          onClose={close}
        />
      </div>
      {error ? (
        <p role="alert" className="text-[12px] font-medium text-danger-600">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
