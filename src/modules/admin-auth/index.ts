import { lazy, createElement } from 'react';
import { Navigate } from 'react-router';
import type { AppModule } from '@/shared/types/module';
import { ADMIN_LOGIN_PATH } from '@/shared/auth/staffPaths';

const AdminLoginPage = lazy(() =>
  import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);

export { KitchenXLogo } from './components/KitchenXLogo';

export const adminAuthModule: AppModule = {
  id: 'admin-auth',
  nav: [],
  routes: [],
  publicRoutes: [
    { path: 'admin-login', element: createElement(AdminLoginPage) },
    {
      path: 'admin',
      element: createElement(Navigate, { to: ADMIN_LOGIN_PATH, replace: true })
    }
  ]
};
