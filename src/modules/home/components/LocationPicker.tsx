import { ChevronDown, MapPin } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { CITIES } from '../content/nav';
import { useHomeState } from '../hooks/useHomeState';
import { HireMenu } from './HireMenu';

const CITY_OPTIONS = CITIES.map((city) => ({ value: city, label: city }));

const DEFAULT_TRIGGER_CLASS =
  'inline-flex h-9 items-center gap-1.5 whitespace-nowrap px-0.5 text-[13.5px] font-bold text-ink-700';

/** Desktop city dropdown. Same HireMenu as language and form selects. */
export function LocationPicker({ triggerClassName }: { triggerClassName?: string }) {
  const { location, selectLocation } = useHomeState();
  const triggerId = useId();
  const listId = `${triggerId}-menu`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={triggerClassName ?? DEFAULT_TRIGGER_CLASS}
      >
        <MapPin className="size-4 shrink-0" />
        <span>{location}</span>
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
        value={location}
        options={CITY_OPTIONS}
        triggerRef={triggerRef}
        minWidth={220}
        onChange={selectLocation}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
