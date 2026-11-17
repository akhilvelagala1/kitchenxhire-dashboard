import { Bell, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { BrandMark } from './BrandMark';
import { JobSeekerAccountMenu } from './JobSeekerAccountMenu';
import { LanguagePicker } from './LanguagePicker';
import { LocationPicker } from './LocationPicker';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { pageWrap } from './styles';

/** Persona links only — “Hiring” lives on BrandMark like the public homepage header. */
const NAV = [
  { label: 'Find Jobs', to: '/user' },
  { label: 'My Applications', to: '/user/applications' },
  { label: 'My Resume', to: '/user/resume' }
] as const;

/** Match SiteHeader: brand → gap → links (ml-6 / ml-28, gap-4 / gap-11). */
const desktopNavClass =
  'ml-6 hidden items-center gap-4 min-[980px]:flex min-[1280px]:ml-28 min-[1280px]:gap-11';

export function UserSiteHeader() {
  const { tx } = useHireLanguage();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  function isActive(to: string): boolean {
    if (to === '/user') return pathname === '/user' || pathname === '/user/';
    return pathname.startsWith(to);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line-header bg-surface/95 backdrop-blur-xl">
      <div className={cn(pageWrap, 'flex h-14 items-center gap-2')}>
        <Link to="/" aria-label="KitchenX Hiring home" className="flex flex-none items-center">
          <BrandMark />
        </Link>
        <nav aria-label="Job seeker" className={desktopNavClass}>
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'text-[13px] font-semibold whitespace-nowrap transition-colors duration-[160ms] hover:text-brand-600',
                isActive(item.to)
                  ? 'border-b-2 border-brand-600 pb-0.5 text-brand-600'
                  : 'border-b-2 border-transparent pb-0.5 text-ink-700'
              )}
            >
              {tx(item.label)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 min-[980px]:flex">
          <LocationPicker />
          <LanguagePicker />
          <button
            type="button"
            aria-label={tx('Notifications, 2 unread')}
            className="relative grid size-9 place-items-center rounded-full hover:bg-muted"
          >
            <Bell className="size-[18px]" />
            <span className="absolute top-1 right-1 grid min-w-[16px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-extrabold text-white">
              2
            </span>
          </button>
          <JobSeekerAccountMenu />
        </div>
        <button
          type="button"
          aria-label={menuOpen ? tx('Close menu') : tx('Open menu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto grid size-10 place-items-center rounded-full min-[980px]:hidden"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {menuOpen && (
        <nav
          aria-label="Job seeker mobile"
          className="border-t border-line bg-surface px-4 py-3 min-[980px]:hidden"
        >
          <ul className="flex flex-col gap-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'block rounded-xl px-3 py-2.5 text-sm font-bold',
                    isActive(item.to) ? 'bg-brand-50 text-brand-600' : 'text-ink-700'
                  )}
                >
                  {tx(item.label)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-line pt-3">
            <JobSeekerAccountMenu variant="inline" onNavigate={() => setMenuOpen(false)} />
            <div className="mt-3">
              <LanguagePicker />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
