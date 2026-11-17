import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { FieldError } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import { PROFILE_SKILLS_MAX } from '../content/profileFormOptions';
import { hireMenu, hireMenuOption } from './styles';
import { popoverStyle, useAnchoredPopover, usePopoverPortalRoot } from './useAnchoredPopover';

interface ProfileSkillsMultiSelectProps {
  label: string;
  name: string;
  values: string[];
  options: readonly { value: string; label: string }[];
  onChange: (next: string[]) => void;
  error?: FieldError;
  helperText?: string;
  required?: boolean;
  max?: number;
}

/** Bordered multi-select with chips inside the control and searchable Hire listbox. */
export function ProfileSkillsMultiSelect({
  label,
  name,
  values,
  options,
  onChange,
  error,
  helperText = 'Select one or more skills',
  required = false,
  max = PROFILE_SKILLS_MAX
}: ProfileSkillsMultiSelectProps) {
  const reactId = useId();
  const labelId = `${name}-label-${reactId}`;
  const listId = `${name}-list-${reactId}`;
  const searchId = `${name}-search-${reactId}`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const position = useAnchoredPopover({ open, triggerRef, minWidth: 280 });
  const portalRoot = usePopoverPortalRoot(open, triggerRef);

  const selected = new Set(values);
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  function closeMenu() {
    setOpen(false);
    setQuery('');
  }

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => searchRef.current?.focus());
    function onDocClick(event: MouseEvent) {
      const node = event.target as Node;
      if (triggerRef.current?.contains(node) || menuRef.current?.contains(node)) return;
      closeMenu();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMenu();
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function toggle(value: string) {
    if (selected.has(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    if (values.length >= max) return;
    onChange([...values, value]);
  }

  function remove(value: string) {
    onChange(values.filter((item) => item !== value));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label id={labelId} htmlFor={name} className="text-[14px] font-bold text-ink">
          {label}
          {required ? <span className="text-danger-600"> *</span> : null}
        </label>
        {helperText ? (
          <span className="text-[12px] font-semibold text-ink-500">{helperText}</span>
        ) : null}
      </div>
      <div
        ref={triggerRef}
        id={name}
        role="combobox"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId}
        aria-invalid={Boolean(error)}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
        className={cn(
          'flex min-h-[52px] w-full cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-left',
          'focus-visible:outline-2 focus-visible:outline-brand-600',
          open && 'outline-2 outline-brand-600',
          error && 'border-danger-600'
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {values.length === 0 ? (
            <span className="text-[14px] font-semibold text-ink-soft">Select skills</span>
          ) : (
            values.map((value) => {
              const item = options.find((opt) => opt.value === value);
              return (
                <span
                  key={value}
                  className="inline-flex max-w-full items-center gap-1 rounded-lg bg-[#FFF3ED] px-2 py-1 text-[12.5px] font-bold text-brand-700"
                >
                  <span className="truncate">{item?.label ?? value}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item?.label ?? value}`}
                    className="grid size-4 shrink-0 place-items-center rounded text-brand-600 hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-brand-600"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      remove(value);
                    }}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-400 transition-transform duration-[160ms]',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </div>
      {error ? (
        <p role="alert" className="text-[12px] font-medium text-danger-600">
          {error.message}
        </p>
      ) : null}

      {open && portalRoot && position
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              aria-multiselectable="true"
              aria-labelledby={labelId}
              style={popoverStyle(position)}
              className={cn('fixed z-[200] flex flex-col overflow-hidden', hireMenu)}
            >
              <div className="relative shrink-0 border-b border-line p-1.5">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search skills..."
                  className="h-10 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-[13px] font-semibold text-ink placeholder:text-ink-soft focus-visible:outline-2 focus-visible:outline-brand-600"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
                {filtered.length === 0 ? (
                  <p className="px-2.5 py-3 text-[13px] font-semibold text-ink-500">
                    No skills found
                  </p>
                ) : (
                  filtered.map((opt) => {
                    const isOn = selected.has(opt.value);
                    const atMax = !isOn && values.length >= max;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isOn}
                        disabled={atMax}
                        className={cn(
                          hireMenuOption,
                          isOn && 'bg-brand-50 text-ink',
                          atMax && 'cursor-not-allowed opacity-50'
                        )}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (atMax) return;
                          toggle(opt.value);
                        }}
                      >
                        <span className="min-w-0 flex-1 truncate text-left">{opt.label}</span>
                        <Check
                          className={cn(
                            'ml-auto size-4 shrink-0 stroke-[2.4] text-brand-600',
                            isOn ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>,
            portalRoot
          )
        : null}
    </div>
  );
}
