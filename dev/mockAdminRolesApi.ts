import type { IncomingMessage, ServerResponse } from 'node:http';
import { recordCategoriesRolesAudit, type AuditChange } from './categoriesAudit.ts';
import {
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  PERMISSION_MODULES,
  PERMISSION_MODULE_LABELS,
  ROLE_STATUSES,
  createRole,
  deleteRole,
  findRole,
  getRolesStore,
  roleWithName,
  updateRole,
  type HireAdminRole,
  type PermissionAction,
  type RolePermissions,
  type RoleStatus
} from './categoriesMockData.ts';
import {
  conflict,
  forbidden,
  invalid,
  listParams,
  notFound,
  ok,
  readJson
} from './categoriesHttp.ts';

const BASE = '/hire/admin/roles';
const STATUS_LABELS: Record<RoleStatus, string> = { active: 'Active', inactive: 'Inactive' };
const STATUS_HINT = 'Status must be Active or Inactive.';

const isStatus = (value: unknown): value is RoleStatus =>
  (ROLE_STATUSES as readonly unknown[]).includes(value);

function nameError(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  return text.length >= 2 && text.length <= 40 ? undefined : 'Name must be 2 to 40 characters.';
}

function descriptionError(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return 'Description must be text.';
  return value.trim().length <= 200 ? undefined : 'Description must be 200 characters or fewer.';
}

/**
 * Reads a permission matrix: modules and actions must be known, a missing module means no access, and
 * each list comes back in the canonical action order without repeats.
 */
function readPermissions(value: unknown): RolePermissions | string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return 'Permissions must be an object of module to actions.';
  }
  const given = value as Record<string, unknown>;
  const unknownModule = Object.keys(given).find(
    (k) => !(PERMISSION_MODULES as string[]).includes(k)
  );
  if (unknownModule) return `Unknown module: ${unknownModule}.`;
  const matrix = {} as RolePermissions;
  for (const module of PERMISSION_MODULES) {
    const actions = given[module] ?? [];
    if (!Array.isArray(actions)) return `Actions for ${module} must be a list.`;
    const bad = actions.find((a) => !(PERMISSION_ACTIONS as unknown[]).includes(a));
    if (bad !== undefined) return `Unknown action for ${module}: ${String(bad)}.`;
    matrix[module] = PERMISSION_ACTIONS.filter((a) => actions.includes(a));
  }
  return matrix;
}

const actionsText = (actions: readonly PermissionAction[]) =>
  actions.length > 0 ? actions.map((a) => PERMISSION_ACTION_LABELS[a]).join(', ') : 'None';

/** One change line for each module whose actions differ, for example `Jobs: View, Edit -> View, Create, Edit`. */
function permissionChanges(before: RolePermissions, after: RolePermissions): AuditChange[] {
  return PERMISSION_MODULES.filter((m) => actionsText(before[m]) !== actionsText(after[m])).map(
    (m) => ({
      field: PERMISSION_MODULE_LABELS[m],
      from: actionsText(before[m]),
      to: actionsText(after[m])
    })
  );
}

const duplicateName = (res: ServerResponse) =>
  conflict(res, 'A role with this name already exists.', { name: 'This name is already used.' });

function recordEdit(before: HireAdminRole, after: HireAdminRole) {
  const changes: AuditChange[] = [];
  if (before.name !== after.name)
    changes.push({ field: 'Name', from: before.name, to: after.name });
  if (before.description !== after.description) {
    changes.push({
      field: 'Description',
      from: before.description || null,
      to: after.description || null
    });
  }
  if (changes.length > 0)
    recordCategoriesRolesAudit('hire_role', after.role_id, after.name, 'UPDATED', changes);
  if (before.status !== after.status) {
    const change = {
      field: 'Status',
      from: STATUS_LABELS[before.status],
      to: STATUS_LABELS[after.status]
    };
    recordCategoriesRolesAudit('hire_role', after.role_id, after.name, 'STATUS_UPDATED', [change]);
  }
}

/** Everything under /hire/admin/roles. Returns false for a route it does not know. */
export async function handleAdminRolesMock(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  method: string,
  url: URL
): Promise<boolean> {
  const rest = path.slice(BASE.length);

  if (rest === '' && method === 'GET') {
    const { q, status, page, page_size } = listParams(url, 100);
    const needle = q?.trim().toLowerCase();
    const rows = getRolesStore().filter(
      (r) => (!status || r.status === status) && (!needle || r.name.toLowerCase().includes(needle))
    );
    const size = Math.min(100, Math.max(1, Math.floor(page_size) || 100));
    const at = Math.max(1, Math.floor(page) || 1);
    ok(res, rows.slice((at - 1) * size, at * size), {
      page: at,
      page_size: size,
      total: rows.length
    });
    return true;
  }

  if (rest === '' && method === 'POST') {
    const body = await readJson(req);
    const fields: Record<string, string> = {};
    const name = nameError(body.name);
    const description = descriptionError(body.description);
    if (name) fields.name = name;
    if (description) fields.description = description;
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
    } else if (roleWithName(String(body.name).trim())) {
      duplicateName(res);
    } else {
      const text = typeof body.description === 'string' ? body.description.trim() : '';
      const row = createRole({ name: String(body.name).trim(), description: text });
      recordCategoriesRolesAudit('hire_role', row.role_id, row.name, 'CREATED');
      ok(res, row);
    }
    return true;
  }

  const permissionsOf = rest.match(/^\/([^/]+)\/permissions$/);
  if (permissionsOf && method === 'PATCH') {
    const before = findRole(permissionsOf[1]!);
    if (!before) return (notFound(res, 'Role'), true);
    if (before.protected) {
      return (forbidden(res, `${before.name} permissions cannot be changed.`), true);
    }
    const permissions = readPermissions((await readJson(req)).permissions);
    if (typeof permissions === 'string') return (invalid(res, permissions, { permissions }), true);
    const changes = permissionChanges(before.permissions, permissions);
    const after = updateRole(before.role_id, { permissions })!;
    if (changes.length > 0) {
      recordCategoriesRolesAudit(
        'hire_role',
        after.role_id,
        after.name,
        'PERMISSIONS_UPDATED',
        changes
      );
    }
    ok(res, after);
    return true;
  }

  const byId = rest.match(/^\/([^/]+)$/);
  if (!byId) return false;
  const before = findRole(byId[1]!);

  if (method === 'GET') {
    if (before) ok(res, before);
    else notFound(res, 'Role');
    return true;
  }

  if (method === 'PATCH') {
    if (!before) return (notFound(res, 'Role'), true);
    const body = await readJson(req);
    const fields: Record<string, string> = {};
    const name = body.name === undefined ? undefined : nameError(body.name);
    const description = descriptionError(body.description);
    if (name) fields.name = name;
    if (description) fields.description = description;
    if (body.status !== undefined && !isStatus(body.status)) fields.status = STATUS_HINT;
    if (Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
    } else if (
      body.name === undefined &&
      body.description === undefined &&
      body.status === undefined
    ) {
      invalid(res, 'Send at least one field to change.', {
        name: 'Send a name, description or status.'
      });
    } else if (before.protected && body.status !== undefined && body.status !== before.status) {
      forbidden(res, `${before.name} cannot be deactivated.`);
    } else if (typeof body.name === 'string' && roleWithName(body.name.trim(), before.role_id)) {
      duplicateName(res);
    } else {
      const patch: Parameters<typeof updateRole>[1] = {};
      if (typeof body.name === 'string') patch.name = body.name.trim();
      if (typeof body.description === 'string') patch.description = body.description.trim();
      if (isStatus(body.status)) patch.status = body.status;
      const after = updateRole(before.role_id, patch)!;
      recordEdit(before, after);
      ok(res, after);
    }
    return true;
  }

  if (method === 'DELETE') {
    if (!before) return (notFound(res, 'Role'), true);
    if (before.protected) return (forbidden(res, `${before.name} cannot be deleted.`), true);
    if (before.users > 0) {
      return (
        conflict(res, `${before.name} still has ${before.users} users. Move them first.`),
        true
      );
    }
    deleteRole(before.role_id);
    recordCategoriesRolesAudit('hire_role', before.role_id, before.name, 'DELETED');
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}
