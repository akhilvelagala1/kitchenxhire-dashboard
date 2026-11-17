import type { AppModule } from '@/shared/types/module';
import { adminAuthModule } from '@/modules/admin-auth';
import { categoriesModule } from '@/modules/categories';
import { hireAdminModule } from '@/modules/hire-admin';
import { homeModule } from '@/modules/home';
import { overviewModule } from '@/modules/overview';

/** Register a module here and nowhere else. `npm run new:module` appends to this list. */
export const modules: AppModule[] = [
  adminAuthModule,
  overviewModule,
  hireAdminModule,
  categoriesModule,
  homeModule
];
