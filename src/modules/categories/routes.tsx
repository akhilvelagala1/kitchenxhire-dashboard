import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { RequirePermission } from '@/shared/components/PermissionGate';
import { CATEGORY_PERMISSIONS as P } from './permissions';

const CategoryListPage = lazy(() =>
  import('./pages/CategoryListPage').then((m) => ({ default: m.CategoryListPage }))
);
const CategoryDetailPage = lazy(() =>
  import('./pages/CategoryDetailPage').then((m) => ({ default: m.CategoryDetailPage }))
);
const CategoryFormPage = lazy(() =>
  import('./pages/CategoryFormPage').then((m) => ({ default: m.CategoryFormPage }))
);

export const categoryRoutes: RouteObject[] = [
  {
    path: 'catalogue/categories',
    element: (
      <RequirePermission permission={P.view}>
        <CategoryListPage />
      </RequirePermission>
    )
  },
  {
    path: 'catalogue/categories/new',
    element: (
      <RequirePermission permission={P.create}>
        <CategoryFormPage />
      </RequirePermission>
    )
  },
  {
    path: 'catalogue/categories/:id',
    element: (
      <RequirePermission permission={P.view}>
        <CategoryDetailPage />
      </RequirePermission>
    )
  },
  {
    path: 'catalogue/categories/:id/edit',
    element: (
      <RequirePermission permission={P.update}>
        <CategoryFormPage />
      </RequirePermission>
    )
  }
];
