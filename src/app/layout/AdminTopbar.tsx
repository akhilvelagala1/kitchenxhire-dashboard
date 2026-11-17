import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { KitchenXLogo } from '@/modules/admin-auth';
import {
  HireLanguageProvider,
  HomeStateProvider,
  LanguagePicker,
  LocationPicker
} from '@/modules/home';
import { ADMIN_LOGIN_PATH } from '@/shared/auth/staffPaths';
import { apiClient } from '@/shared/api/apiClient';
import { logoutStaff } from '@/shared/auth/staffAuth';
import { sessionKeys } from '@/shared/auth/sessionKeys';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

// Keeps the header's existing look on the reused Location and Language pickers.
const HEADER_PICKER_CLASS =
  'inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl px-2 text-sm text-ink-soft hover:bg-muted lg:min-h-9 lg:text-[13px]';

interface SearchHit {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
}

export function AdminTopbar({ onOpenNav }: { onOpenNav?: () => void }) {
  const listId = useId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: hits = [] } = useQuery({
    queryKey: ['hire', 'admin', 'search', query],
    queryFn: () => apiClient.get<SearchHit[]>('/hire/admin/search', { q: query }),
    enabled: query.trim().length >= 2
  });

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function goHit(hit: SearchHit) {
    setOpen(false);
    setQuery('');
    navigate(hit.href);
  }

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || hits.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % hits.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === 'Enter' && hits[activeIndex]) {
      e.preventDefault();
      goHit(hits[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function signOut() {
    logoutStaff();
    queryClient.removeQueries({ queryKey: sessionKeys.me });
    navigate(ADMIN_LOGIN_PATH, { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-surface px-4 max-[359px]:px-3 sm:gap-4 lg:gap-3 lg:px-5">
      {onOpenNav && (
        <Button
          type="button"
          variant="ghost"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenNav}
        >
          <Menu className="size-5" />
        </Button>
      )}
      <Link to="/admin/dashboard" className="flex shrink-0 items-center gap-2.5 lg:gap-2">
        <KitchenXLogo className="max-[359px]:h-4 min-[400px]:h-5 sm:h-6 lg:h-4" />
        <span className="hidden rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-ink-soft sm:inline lg:px-2 lg:text-[11px]">
          Hiring
        </span>
      </Link>
      <div
        ref={wrapRef}
        className="relative mx-auto hidden min-w-0 flex-1 md:block md:max-w-[565px] lg:max-w-[428px]"
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Search for jobs, applicants, users, restaurants..."
          className="min-h-11 w-full rounded-full border border-line bg-[#F7F8FC] py-2 pr-4 pl-10 text-sm text-ink placeholder:text-ink-soft focus:border-brand-600/70 focus:outline focus:outline-2 focus:outline-brand-600/30 lg:min-h-9 lg:py-1 lg:text-[13px]"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onSearchKeyDown}
        />
        {open && query.trim().length >= 2 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-[calc(100%+6px)] z-30 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-lg"
          >
            {hits.length === 0 ? (
              <li className="px-4 py-3 text-sm text-ink-soft">No matches for “{query.trim()}”.</li>
            ) : (
              hits.map((hit, i) => (
                <li key={hit.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full flex-col items-start px-4 py-2.5 text-left text-sm hover:bg-muted',
                      i === activeIndex && 'bg-brand-50'
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goHit(hit)}
                  >
                    <span className="font-medium text-ink">{hit.title}</span>
                    <span className="text-xs text-ink-soft">{hit.subtitle}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-1.5">
        <div className="hidden sm:block">
          <HomeStateProvider>
            <LocationPicker triggerClassName={HEADER_PICKER_CLASS} />
          </HomeStateProvider>
        </div>
        <div className="hidden md:block">
          <HireLanguageProvider>
            <LanguagePicker triggerClassName={HEADER_PICKER_CLASS} />
          </HireLanguageProvider>
        </div>
        <button
          type="button"
          className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl hover:bg-muted lg:min-h-9 lg:min-w-9"
          aria-label="Notifications, 1 unread"
        >
          <Bell className="size-5 text-ink-soft lg:size-[18px]" />
          <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white lg:top-1 lg:right-1 lg:size-3.5 lg:text-[9px]">
            1
          </span>
        </button>
        <details className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-1 hover:bg-muted lg:gap-1 lg:px-1.5 [&::-webkit-details-marker]:hidden">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 lg:size-8 lg:text-xs">
              SK
            </span>
            <ChevronDown className="hidden size-4 text-ink-soft sm:block" />
          </summary>
          <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-line bg-surface py-1 shadow-lg">
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
