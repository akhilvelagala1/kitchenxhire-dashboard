import {
  ChefHat,
  ConciergeBell,
  FileText,
  FolderOpen,
  ScrollText,
  Settings,
  UserRound,
  type LucideIcon
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';

const ITEMS: { label: string; to: string; icon: LucideIcon; exact?: boolean }[] = [
  { label: 'My Profile', to: '/user/profile', icon: UserRound, exact: true },
  { label: 'My Applications', to: '/user/applications', icon: FileText },
  { label: 'My Resume', to: '/user/resume', icon: ScrollText },
  { label: 'My Documents', to: '/user/documents', icon: FolderOpen },
  { label: 'Account Settings', to: '/user/settings', icon: Settings }
];

function isActive(pathname: string, to: string, exact?: boolean): boolean {
  if (to === '/user/resume') return pathname.startsWith('/user/resume');
  return exact ? pathname === to : pathname.startsWith(to);
}

/**
 * Job-seeker section nav. Mounted once by `UserProfileLayout`, so every section shares
 * the same card, the same height, the same spacing and the same promo position.
 */
export function UserSidebarNav() {
  const { pathname } = useLocation();

  return (
    <aside className="flex h-full w-full flex-col">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[18px] border border-line bg-surface shadow-card">
        <nav
          aria-label="Profile sections"
          className="flex shrink-0 flex-col gap-1 p-4 pt-5 min-[1280px]:gap-1.5 min-[1280px]:px-5 min-[1280px]:pt-7"
        >
          {ITEMS.map(({ label, to, icon: Icon, exact }) => {
            const on = isActive(pathname, to, exact);
            return (
              <Link
                key={to}
                to={to}
                aria-current={on ? 'page' : undefined}
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
              </Link>
            );
          })}
        </nav>

        <div className="flex min-h-0 flex-1 flex-col px-4 pt-2 pb-6 min-[1280px]:px-5 min-[1280px]:pb-7">
          <div className="flex min-h-[140px] flex-1 flex-col rounded-2xl bg-brand-50 p-4">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-brand-600 shadow-[0_2px_8px_rgb(255_79_24/0.12)]">
                <ChefHat className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <p className="text-[13px] leading-snug font-bold text-ink-700">
                Complete your profile to get better job opportunities
              </p>
            </div>
            <div className="grid flex-1 place-items-center pt-3" aria-hidden="true">
              <ConciergeBell
                className="size-20 text-brand-600/28 min-[1280px]:size-28"
                strokeWidth={1.1}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
