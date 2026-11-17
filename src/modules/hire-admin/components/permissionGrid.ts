import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type PermissionAction,
  type PermissionModule,
  type RolePermissions
} from '../schemas/adminCategoryRole';

/** Keeps the actions of a cell in the order of the columns, whatever order they were added in. */
function ordered(actions: Iterable<PermissionAction>): PermissionAction[] {
  const set = new Set(actions);
  return PERMISSION_ACTIONS.filter((action) => set.has(action));
}

function mapModules(
  permissions: RolePermissions,
  change: (module: PermissionModule, actions: PermissionAction[]) => PermissionAction[]
): RolePermissions {
  return Object.fromEntries(
    PERMISSION_MODULES.map((module) => [module, ordered(change(module, permissions[module] ?? []))])
  ) as RolePermissions;
}

function withAction(actions: PermissionAction[], action: PermissionAction, on: boolean) {
  if (!on) return action === 'view' ? [] : actions.filter((a) => a !== action);
  return [...actions, action, ...(action === 'view' ? [] : (['view'] as const))];
}

/** Grants or removes one action of one module. Granting anything grants View; removing View removes all. */
export function toggleCell(
  permissions: RolePermissions,
  module: PermissionModule,
  action: PermissionAction,
  on: boolean
): RolePermissions {
  return mapModules(permissions, (m, actions) =>
    m === module ? withAction(actions, action, on) : actions
  );
}

/** Grants every action of a module, or none. */
export function toggleRow(
  permissions: RolePermissions,
  module: PermissionModule,
  on: boolean
): RolePermissions {
  return mapModules(permissions, (m, actions) =>
    m === module ? (on ? [...PERMISSION_ACTIONS] : []) : actions
  );
}

/** Grants one action in every module, or removes it from every module. */
export function toggleColumn(
  permissions: RolePermissions,
  action: PermissionAction,
  on: boolean
): RolePermissions {
  return mapModules(permissions, (_m, actions) => withAction(actions, action, on));
}

/** How many of the cells are granted, and how many there are in all. */
export function countGranted(permissions: RolePermissions): { granted: number; total: number } {
  const granted = PERMISSION_MODULES.reduce(
    (sum, module) => sum + (permissions[module]?.length ?? 0),
    0
  );
  return { granted, total: PERMISSION_MODULES.length * PERMISSION_ACTIONS.length };
}

/** Which cells of a module or column are on: `all`, `some` or `none`. */
export type CheckState = 'all' | 'some' | 'none';

function stateOf(on: number, of: number): CheckState {
  return on === 0 ? 'none' : on === of ? 'all' : 'some';
}

export function rowState(permissions: RolePermissions, module: PermissionModule): CheckState {
  return stateOf(permissions[module]?.length ?? 0, PERMISSION_ACTIONS.length);
}

export function columnState(permissions: RolePermissions, action: PermissionAction): CheckState {
  const on = PERMISSION_MODULES.filter((m) => permissions[m]?.includes(action)).length;
  return stateOf(on, PERMISSION_MODULES.length);
}

/** The modules whose actions differ between the saved and the edited matrix. */
export function changedModules(
  saved: RolePermissions,
  edited: RolePermissions
): PermissionModule[] {
  return PERMISSION_MODULES.filter(
    (m) => ordered(saved[m] ?? []).join() !== ordered(edited[m] ?? []).join()
  );
}
