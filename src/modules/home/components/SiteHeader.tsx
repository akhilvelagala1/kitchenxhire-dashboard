import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { NAV_LINKS } from '../content/nav';
import { useHomeState } from '../hooks/useHomeState';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { BrandMark } from './BrandMark';
import { JobSeekerAccountMenu } from './JobSeekerAccountMenu';
import { LanguagePicker } from './LanguagePicker';
import { LocationPicker } from './LocationPicker';
import { MobileMenu } from './MobileMenu';
import { homeButton, pageWrap } from './styles';

interface SiteHeaderProps {
  onLogin: () => void;
}

export function SiteHeader({ onLogin }: SiteHeaderProps) {
  const { tx } = useHireLanguage();
  const { activeSection, setFlow } = useHomeState();
  const { session } = useJobSeekerSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  function login() {
    setMenuOpen(false);
    onLogin();
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-line-header bg-surface/95 backdrop-blur-xl transition-shadow duration-200',
        scrolled ? 'shadow-sm' : ''
      )}
    >
      <div className={cn(pageWrap, 'flex h-14 items-center gap-2')}>
        <a href="#top" aria-label="KitchenX Hiring" className="flex flex-none items-center">
          <BrandMark />
        </a>
        <nav
          aria-label="Primary"
          className="ml-6 hidden items-center gap-4 min-[980px]:flex min-[1280px]:ml-28 min-[1280px]:gap-11"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.target}
              href={`#${link.target}`}
              className={cn(
                'text-[13px] font-semibold whitespace-nowrap transition-colors duration-[160ms] hover:text-brand-600',
                activeSection === link.target ? 'text-brand-600' : 'text-ink-700'
              )}
            >
              {tx(link.label)}
            </a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2.5 min-[980px]:flex">
          <LocationPicker />
          <LanguagePicker />
          {session ? (
            <JobSeekerAccountMenu />
          ) : (
            <button type="button" onClick={login} className={homeButton('login-header')}>
              {tx('Login')}
            </button>
          )}
          <a
            href="#how"
            onClick={() => setFlow('employer')}
            className={homeButton('orange-header')}
          >
            {tx('Post a Job')}
          </a>
        </div>
        <button
          type="button"
          aria-label={menuOpen ? tx('Close menu') : tx('Open menu')}
          aria-expanded={menuOpen}
          aria-controls="mobileMenu"
          onClick={() => setMenuOpen((o) => !o)}
          className="ml-auto grid size-10 place-items-center rounded-full min-[980px]:hidden"
        >
          {menuOpen ? (
            <X className="size-6 stroke-[2.2]" />
          ) : (
            <Menu className="size-6 stroke-[2.2]" />
          )}
        </button>
      </div>
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} onLogin={login} />}
    </header>
  );
}
