import { LogOut, UserRound } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { useHireLanguage } from '../hooks/useHireLanguage';
import { useJobSeekerSession } from '../lib/jobSeekerSession';
import { homeButton } from './styles';

interface JobSeekerAccountMenuProps {
  /** Compact circle in the header, full-width block, or a flat phone list. */
  variant?: 'header' | 'block' | 'inline';
  /** Close a parent drawer after My Profile or Log out. */
  onNavigate?: () => void;
}

export function JobSeekerAccountMenu({
  variant = 'header',
  onNavigate
}: JobSeekerAccountMenuProps) {
  const { session, clearSession } = useJobSeekerSession();
  const { tx } = useHireLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!session) return null;

  const { profile } = session;

  function closeAndLeave() {
    setOpen(false);
    onNavigate?.();
  }

  function logout() {
    clearSession();
    closeAndLeave();
    navigate('/');
  }

  if (variant === 'inline') {
    return (
      <div className="mb-3 flex flex-col gap-1 border-b border-line pb-3">
        <p className="px-3 py-1 text-sm font-bold text-ink-600">{profile.displayName}</p>
        <Link
          to="/user/profile"
          onClick={closeAndLeave}
          className="block rounded-xl px-3 py-2.5 text-sm font-bold text-ink-700"
        >
          {tx('My Profile')}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl px-3 py-2.5 text-left text-sm font-bold text-ink-700"
        >
          {tx('Log out')}
        </button>
      </div>
    );
  }

  const panel = (
    <div
      id={menuId}
      role="menu"
      className={cn(
        'absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface py-1 shadow-card',
        variant === 'block' ? 'right-0 left-0' : 'right-0 min-w-[200px]'
      )}
    >
      <p className="px-4 py-2.5 text-[13px] font-bold text-ink-600">{profile.displayName}</p>
      <Link
        to="/user/profile"
        role="menuitem"
        onClick={closeAndLeave}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] font-bold text-ink-700 hover:bg-muted"
      >
        <UserRound className="size-4 text-ink-500" />
        {tx('My Profile')}
      </Link>
      <button
        type="button"
        role="menuitem"
        onClick={logout}
        className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-[14px] font-bold text-ink-700 hover:bg-muted"
      >
        <LogOut className="size-4 text-ink-500" />
        {tx('Log out')}
      </button>
    </div>
  );

  if (variant === 'block') {
    return (
      <div ref={rootRef} className="relative w-full">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          className={cn(homeButton('login-block'), 'flex items-center justify-center gap-2.5')}
        >
          <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-[11px] font-extrabold text-white">
            {profile.initials}
          </span>
          {profile.displayName}
        </button>
        {open ? panel : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={`Account menu for ${profile.displayName}`}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="grid size-9 place-items-center rounded-full bg-brand-600 text-[12px] font-extrabold text-white"
      >
        {profile.initials}
      </button>
      {open ? panel : null}
    </div>
  );
}
