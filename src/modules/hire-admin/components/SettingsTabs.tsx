import { useSearchParams } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { type SettingsTab, parseSettingsSearchParams } from './settingsPageParams';

/** Every pill under the Settings title. General through Notifications have screens. */
const ALL_TABS = [
  'General',
  'Hiring & Jobs',
  'Users & Roles',
  'Notifications',
  'Integrations',
  'Security',
  'Audit & Logs'
] as const;

const ENABLED: Record<string, SettingsTab> = {
  General: 'general',
  'Hiring & Jobs': 'hiring',
  'Users & Roles': 'users',
  Notifications: 'notifications',
  Integrations: 'integrations',
  Security: 'security',
  'Audit & Logs': 'audit'
};

const PILL =
  'inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-5 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 lg:h-[calc(40*var(--u))] lg:min-h-0 lg:px-[calc(23*var(--u))] lg:text-[calc(14*var(--u))]';

/**
 * The section pills under the Settings title. General, Hiring & Jobs, Users & Roles,
 * Notifications, Integrations, and Security switch the page content through the `tab` URL param.
 * Audit & Logs stays disabled with a "Coming soon" hint until its screen exists (UI-14). On a phone
 * the row scrolls sideways.
 */
export function SettingsTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tab: active } = parseSettingsSearchParams(searchParams);

  function select(next: SettingsTab) {
    const params = new URLSearchParams(searchParams);
    if (next === 'general') params.delete('tab');
    else params.set('tab', next);
    setSearchParams(params, { replace: true });
  }

  return (
    <div
      role="tablist"
      aria-label="Settings sections"
      className="-m-1 flex gap-2 overflow-x-auto p-1 lg:m-0 lg:gap-[calc(10*var(--u))] lg:overflow-visible lg:p-0"
    >
      {ALL_TABS.map((label) => {
        const key = ENABLED[label];
        const enabled = key !== undefined;
        const selected = enabled && key === active;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-disabled={!enabled || undefined}
            disabled={!enabled}
            title={enabled ? undefined : 'Coming soon'}
            tabIndex={selected ? 0 : -1}
            onClick={() => enabled && select(key)}
            className={cn(
              PILL,
              selected
                ? 'border-brand-600 bg-brand-600 text-white'
                : enabled
                  ? 'border-[#E2E6EF] bg-white text-[#111827] hover:border-brand-600'
                  : 'cursor-not-allowed border-[#E5E8EF] bg-white text-[#17191F]'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
