import { NavLink } from 'react-router';
import { usePermissions } from '@/shared/auth/usePermissions';
import { cn } from '@/shared/lib/cn';
import type { NavItem, NavSection } from '@/shared/types/module';
import { modules } from '../modules';
import { StaffSignOutButton } from './StaffSignOutButton';

const SECTIONS: NavSection[] = [
  'Dashboard',
  'Talent & Hiring',
  'Users & Organizations',
  'Platform Management'
];

const PLATFORM_NAV_ORDER = ['/admin/reports', '/admin/settings'];

function sortSectionLinks(section: NavSection, links: NavItem[]): NavItem[] {
  if (section !== 'Platform Management') return links;
  return [...links].sort((a, b) => {
    const ia = PLATFORM_NAV_ORDER.indexOf(a.to);
    const ib = PLATFORM_NAV_ORDER.indexOf(b.to);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { can } = usePermissions();
  const items = modules.flatMap((m) => m.nav).filter((n) => can(n.permission));

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onNavigate}
        />
      )}
      <nav
        aria-label="Primary"
        className={cn(
          'fixed top-12 bottom-0 left-0 z-40 flex w-[264px] shrink-0 flex-col border-r border-line bg-surface transition-transform lg:static lg:top-auto lg:z-auto lg:min-h-0 lg:w-[224px]',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-3 lg:py-3">
          {SECTIONS.map((section) => {
            const links = sortSectionLinks(
              section,
              items.filter((n) => n.section === section)
            );
            if (links.length === 0) return null;
            return (
              <div key={section} className="mb-5 lg:mb-5">
                {section !== 'Dashboard' && (
                  <p className="mb-2 px-3 text-xs font-medium text-[#667085] lg:mb-2 lg:px-2.5 lg:text-[11px]">
                    {section}
                  </p>
                )}
                {links.map((n) => (
                  <SidebarLink key={n.to} item={n} onNavigate={onNavigate} />
                ))}
              </div>
            );
          })}
        </div>
        <div className="mt-auto border-t border-line p-3 lg:hidden">
          <StaffSignOutButton />
        </div>
      </nav>
    </>
  );
}

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin/dashboard'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative mb-0.5 flex min-h-[42px] items-center gap-3 rounded-[10px] px-3 text-sm font-medium lg:min-h-[34px] lg:gap-2.5 lg:px-2.5 lg:text-[13px]',
          isActive
            ? 'bg-[#FFF0E9] text-brand-600 before:absolute before:top-2 before:bottom-2 before:left-0 before:w-0.5 before:rounded-full before:bg-brand-600'
            : 'text-[#17191C] hover:bg-muted'
        )
      }
    >
      {({ isActive }) => (
        <>
          {Icon ? (
            <Icon
              className={cn(
                'size-5 shrink-0 lg:size-4',
                isActive ? 'text-brand-600' : 'text-[#596273]'
              )}
              strokeWidth={1.75}
              aria-hidden
            />
          ) : null}
          <span className="whitespace-nowrap">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}
