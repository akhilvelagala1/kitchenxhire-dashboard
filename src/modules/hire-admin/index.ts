import {
  Briefcase,
  ClipboardList,
  PieChart,
  Settings,
  Store,
  UserCog,
  UserRound,
  UsersRound
} from 'lucide-react';
import type { AppModule } from '@/shared/types/module';
import { HIRE_ADMIN_PERMISSIONS as P } from './permissions';
import { hireAdminRoutes } from './routes';

export const hireAdminModule: AppModule = {
  id: 'hire-admin',
  nav: [
    {
      label: 'Jobs',
      to: '/admin/jobs',
      permission: P.view,
      section: 'Talent & Hiring',
      icon: Briefcase
    },
    {
      label: 'Applications',
      to: '/admin/applications',
      permission: P.view,
      section: 'Talent & Hiring',
      icon: ClipboardList
    },
    {
      label: 'Job Seekers',
      to: '/admin/job-seekers',
      permission: P.view,
      section: 'Users & Organizations',
      icon: UserRound
    },
    {
      label: 'Businesses / Outlets',
      to: '/admin/businesses',
      permission: P.view,
      section: 'Users & Organizations',
      icon: Store
    },
    {
      label: 'Recruiter Management',
      to: '/admin/recruiters',
      permission: P.view,
      section: 'Users & Organizations',
      icon: UsersRound
    },
    {
      label: 'User Management',
      to: '/admin/users',
      permission: P.view,
      section: 'Users & Organizations',
      icon: UserCog
    },
    {
      label: 'Reports & Analytics',
      to: '/admin/reports',
      permission: P.view,
      section: 'Platform Management',
      icon: PieChart
    },
    {
      label: 'Settings',
      to: '/admin/settings',
      permission: P.view,
      section: 'Platform Management',
      icon: Settings
    }
  ],
  routes: hireAdminRoutes
};
