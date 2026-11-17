import { LayoutDashboard } from 'lucide-react';
import type { AppModule } from '@/shared/types/module';
import { overviewRoutes } from './routes';

export const overviewModule: AppModule = {
  id: 'overview',
  nav: [
    {
      label: 'Dashboard',
      to: '/admin/dashboard',
      permission: 'overview.view',
      section: 'Dashboard',
      icon: LayoutDashboard
    }
  ],
  routes: overviewRoutes
};
