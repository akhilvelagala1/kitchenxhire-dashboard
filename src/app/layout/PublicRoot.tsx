import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Spinner } from '@/shared/ui/Spinner';

/** Boundary for public pages, which render outside AppShell and so outside its Suspense. */
export function PublicRoot() {
  return (
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
}
