import { Bell, Shield, Store, UserRound, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export type RecruiterAccountSettingsTab =
  'personal' | 'organisation' | 'security' | 'notifications';

interface RecruiterAccountSettingsSidebarProps {
  active: RecruiterAccountSettingsTab;
  onSelect: (tab: RecruiterAccountSettingsTab) => void;
  displayName: string;
  initials: string;
}

const TABS: { id: RecruiterAccountSettingsTab; label: string; icon: LucideIcon }[] = [
  { id: 'personal', label: 'Personal Information', icon: UserRound },
  { id: 'organisation', label: 'Organisation Information', icon: Store },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell }
];

/**
 * Recruiter Account Settings section nav. Mirrors `UserSidebarNav`'s card and active-item
 * styling, but switches panels locally (no route change) since every section lives on one page.
 */
export function RecruiterAccountSettingsSidebar({
  active,
  onSelect,
  displayName,
  initials
}: RecruiterAccountSettingsSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[18px] border border-line bg-surface shadow-card">
        <div className="flex shrink-0 items-center gap-3 p-4 pt-5 min-[1280px]:px-5 min-[1280px]:pt-7">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-[14px] font-extrabold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold text-ink">{displayName}</p>
            <p className="text-[12px] font-bold text-ink-500">Recruiter</p>
          </div>
        </div>
        <div className="mx-4 border-t border-line min-[1280px]:mx-5" />
        <nav
          aria-label="Account settings sections"
          role="tablist"
          className="flex shrink-0 flex-col gap-1 p-4 pt-3 min-[1280px]:gap-1.5 min-[1280px]:px-5 min-[1280px]:pt-4"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const on = active === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onSelect(id)}
                className={cn(
                  'relative flex min-h-[48px] items-center gap-3.5 rounded-xl py-3 pr-3 pl-3 text-[15px] font-bold transition-colors duration-150 min-[1280px]:min-h-[52px] min-[1280px]:text-[16px]',
                  on
                    ? 'bg-brand-50 pl-[11px] text-brand-600 before:absolute before:top-2.5 before:bottom-2.5 before:left-0 before:w-[3px] before:rounded-full before:bg-brand-600 before:content-[""]'
                    : 'text-ink-700 hover:bg-muted/80 hover:text-ink'
                )}
              >
                <Icon
                  className={cn(
                    'size-[22px] shrink-0 min-[1280px]:size-6',
                    on ? 'text-brand-600' : 'text-ink-400'
                  )}
                />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
