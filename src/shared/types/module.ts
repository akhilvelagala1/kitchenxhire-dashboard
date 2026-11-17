import type { LucideIcon } from 'lucide-react';
import type { RouteObject } from 'react-router';

export type NavSection =
  | 'Dashboard'
  | 'Talent & Hiring'
  | 'Users & Organizations'
  | 'Platform Management'
  | 'Catalogue'
  | 'Operations'
  | 'Customers'
  | 'Finance'
  | 'Platform';

export interface NavItem {
  label: string;
  to: string;
  /** Permission needed to see the nav entry. The route and API enforce it too. */
  permission: string;
  section: NavSection;
  icon?: LucideIcon;
}

/**
 * The `handle` a staff route can set so AppShell adapts to it.
 * `fit`: the page lays itself out to fill the viewport from lg up and brings its own gutters,
 * so the shell hands it the full scroll area. The shell still scrolls when the content cannot fit.
 */
export interface ShellRouteHandle {
  fit?: boolean;
}

/** What a module exposes to the app. Everything else in the module stays private (CS-02). */
export interface AppModule {
  id: string;
  nav: NavItem[];
  routes: RouteObject[];
  /** Public pages. Mounted outside AppShell, so no sidebar and no permission-filtered nav. */
  publicRoutes?: RouteObject[];
}
