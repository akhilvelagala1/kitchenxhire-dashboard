import { Suspense, useState } from 'react';
import { Outlet, useMatches } from 'react-router';
import { cn } from '@/shared/lib/cn';
import type { ShellRouteHandle } from '@/shared/types/module';
import { Spinner } from '@/shared/ui/Spinner';
import { AdminTopbar } from './AdminTopbar';
import { Sidebar } from './Sidebar';

/**
 * Owns header and navigation; pages render only their body (UI-03).
 * From lg the shell is exactly one viewport tall and only <main> scrolls, so the header and
 * sidebar stay put. Below lg the page scrolls normally, as before.
 */
export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const fit = useMatches().some((match) => (match.handle as ShellRouteHandle | undefined)?.fit);

  const page = (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[#F5F6F8] lg:h-dvh lg:overflow-hidden">
      <a href="#main" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <AdminTopbar onOpenNav={() => setNavOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
        <main
          id="main"
          data-layout={fit ? 'fit' : undefined}
          className={cn('min-w-0 flex-1 overflow-y-auto', !fit && 'px-4 py-5 md:px-7')}
        >
          {fit ? (
            <div className="flex min-h-full flex-col px-4 py-5 md:px-7 lg:h-full lg:p-0">
              {page}
            </div>
          ) : (
            page
          )}
        </main>
      </div>
    </div>
  );
}
