export const CATEGORY_STATUSES = ['active', 'inactive', 'archived'] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export const CATEGORY_STATUS_LABELS: Record<CategoryStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived'
};

/** The kind of business a category stands for. `Kitchen` covers central kitchens. */
export const CATEGORY_BUSINESS_TYPES = [
  'Restaurant',
  'Cloud Kitchen',
  'Food Court',
  'Warehouse',
  'Kitchen'
] as const;
export type CategoryBusinessType = (typeof CATEGORY_BUSINESS_TYPES)[number];

/** Which vector icon the tile in the table shows (lucide: Utensils, Cloud, Store, Warehouse, Truck). */
export const CATEGORY_ICONS = ['utensils', 'cloud', 'store', 'warehouse', 'truck'] as const;
export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

export const CATEGORY_ICON_LABELS: Record<CategoryIcon, string> = {
  utensils: 'Utensils',
  cloud: 'Cloud',
  store: 'Store',
  warehouse: 'Warehouse',
  truck: 'Truck'
};

export interface HireAdminCategory {
  /** For example `CAT001`. */
  category_id: string;
  name: string;
  /** Upper case letters, digits and underscores, for example `CLOUD_KITCHEN`. Unique. */
  code: string;
  business_type: CategoryBusinessType;
  icon: CategoryIcon;
  description: string;
  /** Businesses filed under this category. */
  businesses: number;
  /** Outlets of those businesses. */
  outlets: number;
  status: CategoryStatus;
}

/** What the add and edit dialogs send. A new category starts `active` with no businesses. */
export interface CategoryInput {
  name: string;
  code: string;
  business_type: CategoryBusinessType;
  icon: CategoryIcon;
  description: string;
}

/** Roles are either in use or switched off. */
export type RoleStatus = 'active' | 'inactive';

/** The screens a role can be given access to. */
export const PERMISSION_MODULES = [
  'jobs',
  'applications',
  'recruiters',
  'job_seekers',
  'businesses',
  'users',
  'categories_roles',
  'reports',
  'settings'
] as const;
export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_MODULE_LABELS: Record<PermissionModule, string> = {
  jobs: 'Jobs',
  applications: 'Applications',
  recruiters: 'Recruiters',
  job_seekers: 'Job Seekers',
  businesses: 'Businesses / Outlets',
  users: 'User Management',
  categories_roles: 'Categories & Roles',
  reports: 'Reports & Analytics',
  settings: 'Settings'
};

export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete', 'export'] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export'
};

/** For each module, the actions the role may do. A missing or empty list means no access. */
export type RolePermissions = Record<PermissionModule, PermissionAction[]>;

export interface HireAdminRole {
  /** For example `ROLE001`. */
  role_id: string;
  name: string;
  description: string;
  /** People who have this role. */
  users: number;
  status: RoleStatus;
  /** Super Admin and Admin. Their permissions cannot be changed and they cannot be deactivated or deleted. */
  protected: boolean;
  permissions: RolePermissions;
}

/** What the add and edit role dialogs send. A new role starts `active` with no access at all. */
export interface RoleInput {
  name: string;
  description: string;
}

export type CategoriesRolesSummaryKey = 'categories' | 'roles';

export interface HireCategoriesRolesSummary {
  /** Every category, whatever its status. */
  categories: number;
  /** Every role, whatever its status. */
  roles: number;
  /** Percent change against last month. */
  growth_pct: Record<CategoriesRolesSummaryKey, number>;
}
