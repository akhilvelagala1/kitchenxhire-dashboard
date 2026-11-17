import { ChevronDown, Globe } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { HIRE_LANGUAGE_OPTIONS } from '../content/languages';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { HireMenu } from './HireMenu';

const DEFAULT_TRIGGER_CLASS =
  'inline-flex h-9 items-center gap-1.5 text-[13px] font-bold text-ink-700';

/** Header language control. Same HireMenu as form selects. */
export function LanguagePicker({ triggerClassName }: { triggerClassName?: string }) {
  const triggerId = useId();
  const listId = `${triggerId}-menu`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { language, setLanguage } = useHireLanguage();
  const [open, setOpen] = useState(false);
  const selected =
    HIRE_LANGUAGE_OPTIONS.find((opt) => opt.value === language) ?? HIRE_LANGUAGE_OPTIONS[0];

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Language"
        onClick={() => setOpen((current) => !current)}
        className={triggerClassName ?? DEFAULT_TRIGGER_CLASS}
      >
        <Globe className="size-4" />
        <span>{selected.label}</span>
        <ChevronDown
          className={cn(
            'size-3.5 text-ink-400 transition-transform duration-[160ms]',
            open && 'rotate-180'
          )}
        />
      </button>
      <HireMenu
        id={listId}
        labelledBy={triggerId}
        open={open}
        value={language}
        options={HIRE_LANGUAGE_OPTIONS}
        triggerRef={triggerRef}
        minWidth={160}
        onChange={(next) => {
          setLanguage(next === 'hi' ? 'hi' : 'en');
        }}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
