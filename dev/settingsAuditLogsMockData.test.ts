import { afterEach, describe, expect, it } from 'vitest';
import { getAuditLogs, resetAuditLogs } from './settingsAuditLogsMockData.ts';

afterEach(() => {
  resetAuditLogs();
});

describe('settingsAuditLogsMockData', () => {
  it('returns all 5 fixed entries and the real total when no filters are applied', () => {
    const { items, total, page, page_size } = getAuditLogs({ page: 1, page_size: 25 });

    expect(items).toHaveLength(5);
    expect(total).toBe(248);
    expect(page).toBe(1);
    expect(page_size).toBe(25);
  });

  it('filters by search across user, module, resource and details', () => {
    const { items } = getAuditLogs({ page: 1, page_size: 25, search: 'Ramesh' });

    expect(items).toHaveLength(2);
    expect(items.every((entry) => entry.user_name === 'Ramesh Kumar')).toBe(true);
  });

  it('filters by action', () => {
    const { items } = getAuditLogs({ page: 1, page_size: 25, action: 'Created' });

    expect(items).toHaveLength(1);
    expect(items[0]?.action).toBe('Created');
  });

  it('filters by module', () => {
    const { items } = getAuditLogs({ page: 1, page_size: 25, module: 'Jobs' });

    expect(items).toHaveLength(1);
    expect(items[0]?.module).toBe('Jobs');
  });

  it('resets without throwing', () => {
    expect(() => resetAuditLogs()).not.toThrow();
  });
});
