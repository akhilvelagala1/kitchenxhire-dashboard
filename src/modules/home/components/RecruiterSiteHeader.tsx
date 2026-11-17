import { Bell, Briefcase, Home, Store, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { BrandMark } from './BrandMark';
import { LanguagePicker } from './LanguagePicker';
import { LocationPicker } from './LocationPicker';
import { pageWrap } from './styles';
import { RecruiterAccountMenu } from './RecruiterAccountMenu';

export function RecruiterSiteHeader() {
  const { tx } = useHireLanguage();
  const { pathname } = useLocation();
  const homeActive = pathname === '/recruiter';
  const postJobActive = pathname.startsWith('/recruiter/post-job');
  const applicationsActive = pathname.startsWith('/recruiter/applications');
  const marketJobsActive = pathname.startsWith('/recruiter/market-jobs');

  return (
    <header className="sticky top-0 z-50 border-b border-line-header bg-surface/95 backdrop-blur-xl">
      <div className={cn(pageWrap, 'flex h-[60px] items-center gap-3')}>
        <Link
          to="/recruiter"
          aria-label="KitchenX Recruiter home"
          className="flex flex-none items-center gap-2.5"
        >
          <BrandMark hideHiringLabel />
          <span className="hidden rounded-full bg-muted px-2.5 py-1 text-[12px] font-extrabold text-ink-600 min-[768px]:inline">
            {tx('Recruiter')}
          </span>
        </Link>
        <nav
          aria-label="Recruiter"
          className="ml-6 hidden items-center gap-4 min-[900px]:flex min-[1280px]:ml-28 min-[1280px]:gap-11"
        >
          <Link
            to="/recruiter"
            className={cn(
              'inline-flex items-center gap-1.5 border-b-2 pb-0.5 text-[13px] font-extrabold transition-colors',
              homeActive
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-ink-700 hover:text-brand-600'
            )}
          >
            <Home className="size-4 stroke-[2.2]" aria-hidden="true" />
            {tx('Home')}
          </Link>
          <Link
            to="/recruiter/post-job"
            className={cn(
              'inline-flex items-center gap-1.5 border-b-2 pb-0.5 text-[13px] font-extrabold transition-colors',
              postJobActive
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-ink-700 hover:text-brand-600'
            )}
          >
            <Briefcase className="size-4 stroke-[2.2]" aria-hidden="true" />
            {tx('Post a Job')}
          </Link>
          <Link
            to="/recruiter/applications"
            className={cn(
              'inline-flex items-center gap-1.5 border-b-2 pb-0.5 text-[13px] font-extrabold transition-colors min-[1024px]:text-[15px]',
              applicationsActive
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-ink-700 hover:text-brand-600'
            )}
          >
            <Users className="size-4 stroke-[2.2]" aria-hidden="true" />
            {tx('Applications')}
          </Link>
          <Link
            to="/recruiter/market-jobs"
            className={cn(
              'inline-flex items-center gap-1.5 border-b-2 pb-0.5 text-[13px] font-extrabold transition-colors min-[1024px]:text-[15px]',
              marketJobsActive
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-ink-700 hover:text-brand-600'
            )}
          >
            <Store className="size-4 stroke-[2.2]" aria-hidden="true" />
            {tx('Market Jobs')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 min-[768px]:gap-3">
          <div className="hidden min-[768px]:block">
            <LocationPicker />
          </div>
          <LanguagePicker />
          <button
            type="button"
            aria-label={tx('Notifications, 1 unread')}
            className="relative grid size-9 place-items-center rounded-full hover:bg-muted"
          >
            <Bell className="size-[18px]" />
            <span className="absolute top-1 right-1 grid min-w-[16px] place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-extrabold text-white">
              1
            </span>
          </button>
          <RecruiterAccountMenu />
        </div>
      </div>
    </header>
  );
}
