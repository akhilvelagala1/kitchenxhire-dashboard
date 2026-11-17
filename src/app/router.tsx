import { createBrowserRouter } from 'react-router';
import { RequireStaffSession } from '@/shared/auth/RequireStaffSession';
import { AppShell } from './layout/AppShell';
import { modules } from './modules';
import { PublicRoot } from './layout/PublicRoot';
import { NotFoundPage } from './NotFoundPage';
import { RouteError } from './RouteError';

export const router = createBrowserRouter(
  [
    {
      element: <PublicRoot />,
      errorElement: <RouteError />,
      children: modules.flatMap((m) => m.publicRoutes ?? [])
    },
    {
      element: (
        <RequireStaffSession>
          <AppShell />
        </RequireStaffSession>
      ),
      // A crashing page renders inside the shell instead of blanking the app.
      errorElement: <RouteError />,
      children: modules.flatMap((m) =>
        m.routes.map((r) => ({ ...r, errorElement: <RouteError /> }))
      )
    },
    { path: '*', element: <NotFoundPage /> }
  ],
  { basename: '/kitchenxhire-dashboard/' }
);
