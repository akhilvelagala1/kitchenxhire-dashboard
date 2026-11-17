import { afterEach, describe, expect, it } from 'vitest';
import {
  getUsersRolesSettings,
  replaceUsersRolesSettings,
  resetUsersRolesSettings,
  validateUsersRolesBody
} from './settingsUsersRolesMockData.ts';

afterEach(() => {
  resetUsersRolesSettings();
});

describe('settingsUsersRolesMockData', () => {
  it('starts with the reference users, three system roles, and access defaults', () => {
    const data = getUsersRolesSettings();

    expect(data.users.map((user) => user.name)).toEqual(['Sarah Khan', 'John Doe', 'Priya Sharma']);
    expect(data.roles.filter((role) => role.is_system).map((role) => role.name)).toEqual([
      'Admin',
      'Recruiter',
      'User'
    ]);
    expect(data.permissions.view_own_applications.User).toBe(true);
    expect(data.permissions.view_platform_reports.User).toBe(false);
    expect(data.permissions.create_manage_jobs.Recruiter).toBe(true);
    expect(data.permissions.manage_users.Recruiter).toBe(false);
    expect(data.two_factor_auth).toBe(true);
    expect(data.session_timeout_minutes).toBe(60);
    expect(data.ip_access_restriction).toBe(false);
  });

  it('rejects a payload that drops a system role', () => {
    const current = getUsersRolesSettings();
    const { fields } = validateUsersRolesBody({
      ...current,
      roles: current.roles.filter((role) => role.name !== 'Admin')
    });

    expect(fields.roles).toMatch(/Admin/);
  });

  it('saves a full replace when the body is valid', () => {
    const current = getUsersRolesSettings();
    const next = {
      ...current,
      two_factor_auth: false,
      session_timeout_minutes: 90
    };

    const { value, fields } = validateUsersRolesBody(next);
    expect(fields).toEqual({});
    expect(value).toBeDefined();
    expect(replaceUsersRolesSettings(value!).two_factor_auth).toBe(false);
    expect(getUsersRolesSettings().session_timeout_minutes).toBe(90);
  });
});
