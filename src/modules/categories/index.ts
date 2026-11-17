import type { AppModule } from '@/shared/types/module';
import { categoryRoutes } from './routes';

/** The Categories & Roles nav item now points at the Hire admin screen (/admin/roles), so this module adds none. */
export const categoriesModule: AppModule = {
  id: 'categories',
  nav: [],
  routes: categoryRoutes
};
