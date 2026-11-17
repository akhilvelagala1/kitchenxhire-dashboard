/**
 * In-memory mock categories and roles for the dev mock API (/hire/admin/categories, /hire/admin/roles).
 * Not used in production builds.
 *
 * The demo data is the reference picture: 12 categories (5 on a page) and 8 roles. The list, the summary
 * and the export all read these two stores, so they always agree. Nothing here reads the clock or
 * Math.random(). The types match src/modules/hire-admin/schemas/adminCategoryRole.ts field for field.
 */

export const CATEGORY_STATUSES = ['active', 'inactive', 'archived'] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export const CATEGORY_STATUS_LABELS: Record<CategoryStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived'
};

export const CATEGORY_BUSINESS_TYPES = [
  'Restaurant',
  'Cloud Kitchen',
  'Food Court',
  'Warehouse',
  'Kitchen'
] as const;
type CategoryBusinessType = (typeof CATEGORY_BUSINESS_TYPES)[number];

export const CATEGORY_ICONS = ['utensils', 'cloud', 'store', 'warehouse', 'truck'] as const;
type CategoryIcon = (typeof CATEGORY_ICONS)[number];

export interface HireAdminCategory {
  category_id: string;
  name: string;
  code: string;
  business_type: CategoryBusinessType;
  icon: CategoryIcon;
  description: string;
  businesses: number;
  outlets: number;
  status: CategoryStatus;
}

/** What the add and edit dialogs send. */
export interface CategoryInput {
  name: string;
  code: string;
  business_type: CategoryBusinessType;
  icon: CategoryIcon;
  description: string;
}

export const ROLE_STATUSES = ['active', 'inactive'] as const;
export type RoleStatus = (typeof ROLE_STATUSES)[number];

export const PERMISSION_MODULE_LABELS = {
  jobs: 'Jobs',
  applications: 'Applications',
  recruiters: 'Recruiters',
  job_seekers: 'Job Seekers',
  businesses: 'Businesses / Outlets',
  users: 'User Management',
  categories_roles: 'Categories & Roles',
  reports: 'Reports & Analytics',
  settings: 'Settings'
} as const;
export type PermissionModule = keyof typeof PERMISSION_MODULE_LABELS;
export const PERMISSION_MODULES = Object.keys(PERMISSION_MODULE_LABELS) as PermissionModule[];

export const PERMISSION_ACTION_LABELS = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export'
} as const;
export type PermissionAction = keyof typeof PERMISSION_ACTION_LABELS;
export const PERMISSION_ACTIONS = Object.keys(PERMISSION_ACTION_LABELS) as PermissionAction[];

export type RolePermissions = Record<PermissionModule, PermissionAction[]>;

export interface HireAdminRole {
  role_id: string;
  name: string;
  description: string;
  users: number;
  status: RoleStatus;
  protected: boolean;
  permissions: RolePermissions;
}

export interface RoleInput {
  name: string;
  description: string;
}

const pad = (n: number) => String(n).padStart(3, '0');
const nextId = (prefix: string, ids: readonly string[]) =>
  `${prefix}${pad(ids.reduce((max, id) => Math.max(max, Number(id.slice(prefix.length))), 0) + 1)}`;

/** name | code | type | icon | businesses | outlets | status | description */
const CATEGORY_SEEDS = [
  'Restaurant|RESTAURANT|Restaurant|utensils|248|1024|active|Dine-in and takeaway restaurants.',
  'Cloud Kitchen|CLOUD_KITCHEN|Cloud Kitchen|cloud|182|642|active|Delivery-only kitchens.',
  'Food Court|FOOD_COURT|Food Court|store|56|210|active|Stalls inside malls and food courts.',
  'Warehouse|WAREHOUSE|Warehouse|warehouse|24|24|active|Storage and supply warehouses.',
  'Central Kitchen|CENTRAL_KITCHEN|Kitchen|truck|18|72|active|Shared kitchens that supply many outlets.',
  'Bakery|BAKERY|Restaurant|store|64|88|active|Bakeries and patisseries.',
  'Catering|CATERING|Kitchen|truck|41|57|active|Event and bulk catering services.',
  'Dark Kitchen|DARK_KITCHEN|Cloud Kitchen|cloud|27|39|active|Kitchens that run several delivery brands.',
  'Food Truck|FOOD_TRUCK|Restaurant|truck|33|33|active|Mobile food trucks.',
  'Canteen|CANTEEN|Food Court|store|19|46|inactive|Office and campus canteens.',
  'Pop-up Kiosk|POP_UP_KIOSK|Food Court|store|12|12|active|Short-term kiosks at events.',
  'Franchise Outlet|FRANCHISE_OUTLET|Restaurant|utensils|9|31|archived|Franchise outlets of national brands.'
];

/** Every module gets `actions`, except the modules in `without`, which get none. */
function matrix(
  actions: readonly PermissionAction[],
  without: readonly PermissionModule[] = []
): RolePermissions {
  return Object.fromEntries(
    PERMISSION_MODULES.map((m) => [m, without.includes(m) ? [] : [...actions]])
  ) as RolePermissions;
}

const only = (modules: readonly PermissionModule[], actions: readonly PermissionAction[]) =>
  matrix(
    actions,
    PERMISSION_MODULES.filter((m) => !modules.includes(m))
  );

const TEAM_MODULES: PermissionModule[] = ['jobs', 'applications', 'recruiters', 'job_seekers'];
const VIEW_EDIT: PermissionAction[] = ['view', 'edit'];
const VIEW_CREATE_EDIT: PermissionAction[] = ['view', 'create', 'edit'];

/** The starting matrix of each seeded role. */
const SEED_PERMISSIONS: Record<string, RolePermissions> = {
  'Super Admin': matrix(PERMISSION_ACTIONS),
  Admin: matrix(PERMISSION_ACTIONS),
  'Business Owner': only(['businesses', 'jobs', 'applications'], VIEW_EDIT),
  'Outlet Manager': only(['businesses', 'jobs', 'applications'], VIEW_EDIT),
  'HR Manager': only(TEAM_MODULES, VIEW_CREATE_EDIT),
  'Hiring Manager': only(TEAM_MODULES, VIEW_CREATE_EDIT),
  Recruiter: only(['jobs', 'applications'], VIEW_CREATE_EDIT),
  Viewer: matrix(['view'], ['settings', 'categories_roles'])
};

/** name | users | protected | description */
const ROLE_SEEDS = [
  'Super Admin|3|yes|Full access to everything, including roles and settings.',
  'Admin|12|yes|Runs the platform day to day with full access.',
  'Business Owner|586|no|Owns a business and its outlets.',
  'Outlet Manager|1312|no|Manages one outlet and its hiring.',
  'HR Manager|28|no|Leads hiring across jobs and candidates.',
  'Recruiter|46|no|Posts jobs and works applications.',
  'Hiring Manager|34|no|Reviews candidates for open jobs.',
  'Viewer|102|no|Read-only access.'
];

let categories: HireAdminCategory[] | undefined;
let roles: HireAdminRole[] | undefined;

export function getCategoriesStore(): HireAdminCategory[] {
  categories ??= CATEGORY_SEEDS.map((line, i) => {
    const [name, code, type, icon, businesses, outlets, status, description] = line.split('|');
    return {
      category_id: `CAT${pad(i + 1)}`,
      name: name!,
      code: code!,
      business_type: type as CategoryBusinessType,
      icon: icon as CategoryIcon,
      description: description!,
      businesses: Number(businesses),
      outlets: Number(outlets),
      status: status as CategoryStatus
    };
  });
  return categories;
}

export function getRolesStore(): HireAdminRole[] {
  roles ??= ROLE_SEEDS.map((line, i) => {
    const [name, users, isProtected, description] = line.split('|');
    return {
      role_id: `ROLE${pad(i + 1)}`,
      name: name!,
      description: description!,
      users: Number(users),
      status: 'active',
      protected: isProtected === 'yes',
      permissions: SEED_PERMISSIONS[name!]!
    };
  });
  return roles;
}

export const findCategory = (id: string) => getCategoriesStore().find((c) => c.category_id === id);
export const findRole = (id: string) => getRolesStore().find((r) => r.role_id === id);

/** The category that already has this code (any case), other than `exceptId`. */
export const categoryWithCode = (code: string, exceptId?: string) =>
  getCategoriesStore().find((c) => c.code === code && c.category_id !== exceptId);

/** The role that already has this name (any case), other than `exceptId`. */
export const roleWithName = (name: string, exceptId?: string) =>
  getRolesStore().find(
    (r) => r.name.toLowerCase() === name.toLowerCase() && r.role_id !== exceptId
  );

export function updateCategory(
  id: string,
  patch: Partial<CategoryInput> & { status?: CategoryStatus }
): HireAdminCategory | undefined {
  const rows = getCategoriesStore();
  const i = rows.findIndex((c) => c.category_id === id);
  if (i < 0) return undefined;
  rows[i] = { ...rows[i]!, ...patch };
  return rows[i];
}

/** A new category: active, no businesses or outlets yet, the next id after the highest. */
export function createCategory(input: CategoryInput): HireAdminCategory {
  const rows = getCategoriesStore();
  const row: HireAdminCategory = {
    category_id: nextId(
      'CAT',
      rows.map((c) => c.category_id)
    ),
    ...input,
    businesses: 0,
    outlets: 0,
    status: 'active'
  };
  rows.push(row);
  return row;
}

export function updateRole(
  id: string,
  patch: Partial<RoleInput> & { status?: RoleStatus; permissions?: RolePermissions }
): HireAdminRole | undefined {
  const rows = getRolesStore();
  const i = rows.findIndex((r) => r.role_id === id);
  if (i < 0) return undefined;
  rows[i] = { ...rows[i]!, ...patch };
  return rows[i];
}

/** A new role: active, nobody has it yet, and no access to any module. */
export function createRole(input: RoleInput): HireAdminRole {
  const rows = getRolesStore();
  const row: HireAdminRole = {
    role_id: nextId(
      'ROLE',
      rows.map((r) => r.role_id)
    ),
    ...input,
    users: 0,
    status: 'active',
    protected: false,
    permissions: matrix([])
  };
  rows.push(row);
  return row;
}

export function deleteRole(id: string): boolean {
  const rows = getRolesStore();
  const i = rows.findIndex((r) => r.role_id === id);
  if (i < 0) return false;
  rows.splice(i, 1);
  return true;
}
