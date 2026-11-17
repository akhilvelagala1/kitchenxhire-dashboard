import { PERMISSION_MODULES, type RolePermissions } from '../schemas/adminCategoryRole';
import {
  changedModules,
  columnState,
  countGranted,
  rowState,
  toggleCell,
  toggleColumn,
  toggleRow
} from './permissionGrid';

const none = Object.fromEntries(
  PERMISSION_MODULES.map((m) => [m, []])
) as unknown as RolePermissions;

describe('permissionGrid', () => {
  it('turns View on together with any other action that is granted', () => {
    const next = toggleCell(none, 'jobs', 'edit', true);

    expect(next.jobs).toEqual(['view', 'edit']);
  });

  it('clears the whole row when View is turned off', () => {
    const full = toggleRow(none, 'jobs', true);

    expect(toggleCell(full, 'jobs', 'view', false).jobs).toEqual([]);
  });

  it('removes one action and keeps the others', () => {
    const full = toggleRow(none, 'jobs', true);

    expect(toggleCell(full, 'jobs', 'delete', false).jobs).toEqual([
      'view',
      'create',
      'edit',
      'export'
    ]);
  });

  it('does not touch other modules when one cell changes', () => {
    const next = toggleCell(none, 'jobs', 'view', true);

    expect(next.applications).toEqual([]);
  });

  it('grants and removes a whole row', () => {
    const on = toggleRow(none, 'reports', true);

    expect(on.reports).toEqual(['view', 'create', 'edit', 'delete', 'export']);
    expect(toggleRow(on, 'reports', false).reports).toEqual([]);
  });

  it('grants an action in every module together with View, and clears everything for View off', () => {
    const exportAll = toggleColumn(none, 'export', true);

    expect(exportAll.settings).toEqual(['view', 'export']);
    expect(columnState(exportAll, 'export')).toBe('all');
    expect(toggleColumn(exportAll, 'view', false)).toEqual(none);
  });

  it('counts granted cells out of all cells', () => {
    expect(countGranted(toggleRow(none, 'jobs', true))).toEqual({ granted: 5, total: 45 });
  });

  it('tells all, some and none for a row and a column', () => {
    const one = toggleCell(none, 'jobs', 'view', true);

    expect(rowState(one, 'jobs')).toBe('some');
    expect(rowState(one, 'users')).toBe('none');
    expect(columnState(one, 'view')).toBe('some');
  });

  it('lists the modules that differ from the saved matrix and ignores the order of actions', () => {
    const edited = toggleCell(none, 'users', 'view', true);

    expect(changedModules(none, edited)).toEqual(['users']);
    expect(changedModules(edited, { ...edited, users: [...edited.users] })).toEqual([]);
  });
});
