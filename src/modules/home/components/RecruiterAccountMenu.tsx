import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { recruiterInitials, useRecruiterProfile } from '../lib/recruiterOnboarding';
import { useRecruiterSession } from '../lib/recruiterSession';

export function RecruiterAccountMenu() {
  const { session, clearSession } = useRecruiterSession();
  const profile = useRecruiterProfile(session?.phone);
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

  const displayName = profile?.fullName ?? 'Recruiter';
  const initials = profile ? recruiterInitials(profile.fullName) : 'R';

  function logout() {
    clearSession();
    setOpen(false);
    navigate('/');
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full pl-0.5 pr-1 hover:bg-muted"
      >
        <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-[12px] font-extrabold text-white">
          {initials}
        </span>
        <ChevronDown className="size-3.5 text-ink-500" />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute top-[calc(100%+6px)] right-0 z-50 min-w-[200px] rounded-xl border border-line bg-surface p-1.5 shadow-card"
        >
          <p className="px-2.5 py-2 text-[12px] font-bold text-ink-500">{displayName}</p>
          <Link
            to="/recruiter/account-settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-bold text-ink-700 hover:bg-muted'
            )}
          >
            <UserRound className="size-4" />
            My Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border-t border-line px-2.5 py-2 text-left text-[13px] font-bold text-ink-700 hover:bg-muted'
            )}
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
