import { Outlet } from 'react-router';
import { UserSidebarNav } from '../components/UserSidebarNav';

/**
 * Job-seeker dashboard frame. One grid owns the sidebar column, the main column and the
 * shared spacing, so switching sections only swaps the right column and never shifts the nav.
 */
export function UserProfileLayout() {
  return (
    <main id="main" className="w-full px-4 py-4 min-[1024px]:px-6 min-[1024px]:py-5">
      <div className="mx-auto grid w-full max-w-[1520px] grid-cols-1 gap-4 min-[1280px]:grid-cols-[280px_minmax(0,1fr)] min-[1280px]:items-stretch min-[1280px]:gap-6">
        <div className="min-w-0">
          <UserSidebarNav />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
