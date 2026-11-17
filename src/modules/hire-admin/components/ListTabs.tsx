import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface ListTab {
  key: string;
  label: string;
  /** Shown as `Label (8,672)` once known. */
  count?: number;
}

interface ListTabsProps {
  tabs: readonly ListTab[];
  active: string;
  onChange: (key: string) => void;
  /** Names the tab list for assistive technology, for example `Application stage`. */
  ariaLabel: string;
  /**
   * `applications` matches the Applications redesign: even 13px tabs, orange active underline,
   * and a slightly taller tab row. Other lists keep the default density.
   */
  variant?: 'default' | 'applications';
  children: ReactNode;
}

/** The tab an arrow, Home or End key moves to (wrapping at both ends), or undefined for any other key. */
function keyForKey(keys: readonly string[], current: string, key: string): string | undefined {
  const index = keys.indexOf(current);
  const last = keys.length - 1;
  if (key === 'ArrowRight') return keys[index === last ? 0 : index + 1];
  if (key === 'ArrowLeft') return keys[index <= 0 ? last : index - 1];
  if (key === 'Home') return keys[0];
  if (key === 'End') return keys[last];
  return undefined;
}

function tabLabel({ label, count }: ListTab): string {
  return count === undefined ? label : `${label} (${count.toLocaleString('en-IN')})`;
}

/**
 * Tabs of a list card, each with the number of rows behind it. The selection follows the focus,
 * so the arrow keys both move and choose. On a narrow screen the row scrolls sideways inside the
 * card. The light line under the row is drawn behind the tablist so the orange underline of the
 * active tab covers it. `children` is the content of the selected tab: the filters, table and
 * pager, which all show what is chosen here.
 */
export function ListTabs({
  tabs,
  active,
  onChange,
  ariaLabel,
  variant = 'default',
  children
}: ListTabsProps) {
  const base = useId();
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelId = `${base}-panel`;
  const tabId = (key: string) => `${base}-tab-${key}`;
  const applications = variant === 'applications';

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next = keyForKey(
      tabs.map((tab) => tab.key),
      active,
      event.key
    );
    if (next === undefined) return;
    event.preventDefault();
    onChange(next);
    buttons.current[next]?.focus();
  }

  return (
    <>
      <div className="relative">
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[#E7EAF0]" />
        <div
          role="tablist"
          aria-label={ariaLabel}
          onKeyDown={onKeyDown}
          className={cn(
            'relative flex overflow-x-auto [scrollbar-width:thin]',
            applications ? 'min-h-13.5 gap-0' : 'lg:gap-1'
          )}
        >
          {tabs.map((tab) => {
            const selected = tab.key === active;
            return (
              <button
                key={tab.key}
                ref={(element) => {
                  buttons.current[tab.key] = element;
                }}
                type="button"
                role="tab"
                id={tabId(tab.key)}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(tab.key)}
                className={cn(
                  'shrink-0 border-b-2 whitespace-nowrap transition-colors',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600',
                  applications
                    ? 'h-13.5 px-3.5 text-[13px] font-semibold'
                    : 'h-11 px-4 text-sm lg:h-11.5 lg:px-5 lg:text-[calc(14.5*var(--u))]',
                  selected
                    ? applications
                      ? 'border-brand-600 font-semibold text-brand-600'
                      : 'border-brand-600 font-bold text-brand-600'
                    : applications
                      ? 'border-transparent font-semibold text-[#475569] hover:text-brand-600'
                      : 'border-transparent font-medium text-[#4B5563] hover:text-[#111827]'
                )}
              >
                {tabLabel(tab)}
              </button>
            );
          })}
        </div>
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(active)}
        className="flex min-h-0 flex-1 flex-col"
      >
        {children}
      </div>
    </>
  );
}
