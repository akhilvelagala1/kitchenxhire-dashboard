import { describe, expect, it } from 'vitest';
import type { ShellRouteHandle } from '@/shared/types/module';
import { hireAdminRoutes } from './routes';

const FIT_PAGES = ['admin/jobs', 'admin/reports', 'admin/settings'];

function findRoute(path: string) {
  return hireAdminRoutes.find((route) => route.path === path);
}

function fitOf(path: string) {
  return (findRoute(path)?.handle as ShellRouteHandle | undefined)?.fit;
}

describe('hireAdminRoutes fit layout', () => {
  it('gives the Post a Job form the full shell area', () => {
    const route = findRoute('admin/jobs/new');

    expect(route).toBeDefined();
    expect(route?.handle).toEqual({ fit: true });
  });

  it.each(FIT_PAGES)('keeps %s on the fit layout', (path) => {
    expect(fitOf(path)).toBe(true);
  });

  it('leaves the job edit form as a normal scrolling page', () => {
    expect(findRoute('admin/jobs/:id/edit')).toBeDefined();
    expect(fitOf('admin/jobs/:id/edit')).toBeFalsy();
  });
});
