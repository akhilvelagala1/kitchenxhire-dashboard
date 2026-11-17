/**
 * In-memory Users & Roles Settings for the dev mock. Restarting the server resets them.
 * Mirrors the 1536×960 reference: three demo users, Admin/Recruiter/User, six permission rows,
 * and the Access & Security toggles.
 */
import type {
  SettingsManagedRole,
  SettingsManagedUser,
  SettingsPermissionMatrix,
  SettingsUsersRoles
} from '../src/modules/hire-admin/schemas/adminSettingsUsersRoles.ts';

const DEFAULT_PERMISSIONS: SettingsPermissionMatrix = {
  manage_users: { Admin: true, Recruiter: false, User: false },
  manage_roles: { Admin: true, Recruiter: false, User: false },
  create_manage_jobs: { Admin: true, Recruiter: true, User: false },
  view_own_applications: { Admin: true, Recruiter: true, User: true },
  schedule_interviews: { Admin: true, Recruiter: true, User: false },
  view_platform_reports: { Admin: true, Recruiter: true, User: false }
};

const DEFAULT_USERS: SettingsManagedUser[] = [
  {
    id: 'su-1',
    name: 'Sarah Khan',
    email: 'sarah.khan@kitchenx.com',
    role: 'Admin',
    status: 'active',
    last_login: '2 hours ago',
    avatar_initials: 'SK'
  },
  {
    id: 'su-2',
    name: 'John Doe',
    email: 'john.doe@kitchenx.com',
    role: 'Recruiter',
    status: 'active',
    last_login: 'Yesterday',
    avatar_initials: 'JD'
  },
  {
    id: 'su-3',
    name: 'Priya Sharma',
    email: 'priya.sharma@kitchenx.com',
    role: 'User',
    status: 'inactive',
    last_login: '3 days ago',
    avatar_initials: 'PS'
  }
];

const DEFAULT_ROLES: SettingsManagedRole[] = [
  {
    id: 'sr-admin',
    name: 'Admin',
    description: 'Full system access and configuration',
    is_system: true
  },
  {
    id: 'sr-recruiter',
    name: 'Recruiter',
    description: 'Manage jobs, applications & interviews',
    is_system: true
  },
  {
    id: 'sr-user',
    name: 'User',
    description: 'Apply to jobs and track applications',
    is_system: true
  }
];

const DEFAULTS: SettingsUsersRoles = {
  users: DEFAULT_USERS,
  roles: DEFAULT_ROLES,
  permissions: DEFAULT_PERMISSIONS,
  two_factor_auth: true,
  session_timeout_minutes: 60,
  user_activity_logging: true,
  ip_access_restriction: false
};

let store: SettingsUsersRoles = structuredClone(DEFAULTS);
let nextUser = 4;
let nextRole = 1;

export function getUsersRolesSettings(): SettingsUsersRoles {
  return structuredClone(store);
}

export function replaceUsersRolesSettings(next: SettingsUsersRoles): SettingsUsersRoles {
  store = structuredClone(next);
  return getUsersRolesSettings();
}

/** Reset to picture defaults (tests). */
export function resetUsersRolesSettings(): SettingsUsersRoles {
  store = structuredClone(DEFAULTS);
  nextUser = 4;
  nextRole = 1;
  return getUsersRolesSettings();
}

function allocateUserId(): string {
  const id = `su-${nextUser}`;
  nextUser += 1;
  return id;
}

function allocateRoleId(): string {
  const id = `sr-custom-${nextRole}`;
  nextRole += 1;
  return id;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const PLATFORM = new Set(['Admin', 'Recruiter', 'User']);
const PERMISSION_KEYS = [
  'manage_users',
  'manage_roles',
  'create_manage_jobs',
  'view_own_applications',
  'schedule_interviews',
  'view_platform_reports'
] as const;

/**
 * Validates a full replace body for PUT /hire/admin/settings/users-roles.
 * Returns field errors when anything is wrong; otherwise the normalised payload.
 */
export function validateUsersRolesBody(body: unknown): {
  value?: SettingsUsersRoles;
  fields: Record<string, string>;
} {
  const fields: Record<string, string> = {};
  if (!isRecord(body)) {
    return { fields: { body: 'Send the Users & Roles settings as a JSON object' } };
  }

  if (!Array.isArray(body.users)) fields.users = 'Send a users list';
  if (!Array.isArray(body.roles)) fields.roles = 'Send a roles list';
  if (!isRecord(body.permissions)) fields.permissions = 'Send the permissions matrix';

  const timeout = body.session_timeout_minutes;
  if (typeof timeout !== 'number' || !Number.isInteger(timeout) || timeout < 5 || timeout > 480) {
    fields.session_timeout_minutes = 'Session timeout must be a whole number from 5 to 480';
  }

  for (const key of [
    'two_factor_auth',
    'user_activity_logging',
    'ip_access_restriction'
  ] as const) {
    if (typeof body[key] !== 'boolean') fields[key] = 'Must be true or false';
  }

  if (Object.keys(fields).length > 0) return { fields };

  const users = (body.users as unknown[]).map((row, index) => {
    if (!isRecord(row)) {
      fields[`users.${index}`] = 'Each user must be an object';
      return null;
    }
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    const email = typeof row.email === 'string' ? row.email.trim() : '';
    const role = typeof row.role === 'string' ? row.role.trim() : '';
    const status = row.status === 'active' || row.status === 'inactive' ? row.status : '';
    const id = typeof row.id === 'string' && row.id ? row.id : allocateUserId();
    const last_login =
      typeof row.last_login === 'string' && row.last_login.trim()
        ? row.last_login.trim()
        : 'Just now';
    const avatar_initials =
      typeof row.avatar_initials === 'string' && row.avatar_initials.trim()
        ? row.avatar_initials.trim().slice(0, 2).toUpperCase()
        : '??';
    if (name.length < 2) fields[`users.${index}.name`] = 'Enter the full name';
    if (!email.includes('@')) fields[`users.${index}.email`] = 'Enter a valid e-mail address';
    if (!role) fields[`users.${index}.role`] = 'Choose a role';
    if (!status) fields[`users.${index}.status`] = 'Choose active or inactive';
    return {
      id,
      name,
      email,
      role,
      status: status as 'active' | 'inactive',
      last_login,
      avatar_initials
    };
  });

  const roles = (body.roles as unknown[]).map((row, index) => {
    if (!isRecord(row)) {
      fields[`roles.${index}`] = 'Each role must be an object';
      return null;
    }
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    const description = typeof row.description === 'string' ? row.description.trim() : '';
    const id = typeof row.id === 'string' && row.id ? row.id : allocateRoleId();
    const is_system = PLATFORM.has(name) ? true : Boolean(row.is_system);
    if (name.length < 2) fields[`roles.${index}.name`] = 'Enter a role name';
    if (description.length < 2) fields[`roles.${index}.description`] = 'Enter a description';
    return { id, name, description, is_system };
  });

  const permissions = {} as SettingsPermissionMatrix;
  const rawPerms = body.permissions as Record<string, unknown>;
  for (const key of PERMISSION_KEYS) {
    const cell = rawPerms[key];
    if (!isRecord(cell)) {
      fields[`permissions.${key}`] = 'Each permission needs Admin, Recruiter and User flags';
      continue;
    }
    permissions[key] = {
      Admin: Boolean(cell.Admin),
      Recruiter: Boolean(cell.Recruiter),
      User: Boolean(cell.User)
    };
  }

  if (Object.keys(fields).length > 0) return { fields };

  const systemNames = new Set(
    (roles.filter(Boolean) as SettingsManagedRole[])
      .filter((role) => role.is_system)
      .map((role) => role.name)
  );
  for (const name of PLATFORM) {
    if (!systemNames.has(name)) {
      fields.roles = `Keep the system role “${name}”`;
      return { fields };
    }
  }

  return {
    value: {
      users: users.filter(Boolean) as SettingsManagedUser[],
      roles: roles.filter(Boolean) as SettingsManagedRole[],
      permissions,
      two_factor_auth: body.two_factor_auth as boolean,
      session_timeout_minutes: timeout as number,
      user_activity_logging: body.user_activity_logging as boolean,
      ip_access_restriction: body.ip_access_restriction as boolean
    },
    fields
  };
}
