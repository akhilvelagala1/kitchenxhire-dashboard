/**
 * Audit events for categories (hire_category) and roles (hire_role), newest first, in the shape of
 * dev/recruiterAudit.ts.
 *
 * Every seeded category and role has a small history that matches how it was seeded: it was created, and
 * an inactive or archived category was switched later. Changes made through the mock API are recorded on
 * top of that by recordCategoriesRolesAudit, stamped from the mock clock (one minute after the evening of
 * 24 Jun 2024, then one more per event), so the order is the same on every start. The entity id "all"
 * returns every event of that type, with the name of the category or role in the action text.
 */
import { CATEGORY_STATUS_LABELS, getCategoriesStore, getRolesStore } from './categoriesMockData.ts';
import { MOCK_NOW_MS, toIstIso } from './businessesMockData.ts';

export type CategoriesRolesAuditType = 'hire_category' | 'hire_role';

export interface AuditChange {
  field: string;
  from: string | null;
  to: string | null;
}

interface StoredEvent {
  id: string;
  entity_type: CategoriesRolesAuditType;
  entity_id: string;
  entity_name: string;
  action: string;
  actor_name: string;
  occurred_at: string;
  reason: string | null;
  changes: AuditChange[];
}

const DAY = 24 * 60 * 60_000;
const events: StoredEvent[] = [];
let ticks = 0;

function push(event: Omit<StoredEvent, 'id'>) {
  events.push({ id: `${event.entity_type}-${events.length + 1}`, ...event });
}

function seedHistory() {
  const created = Date.parse('2024-02-01T10:00:00+05:30');
  getCategoriesStore().forEach((c, i) => {
    const base = {
      entity_type: 'hire_category',
      entity_id: c.category_id,
      entity_name: c.name
    } as const;
    const at = created + i * 3 * DAY;
    push({
      ...base,
      action: 'CREATED',
      actor_name: 'Platform Admin',
      occurred_at: toIstIso(at),
      reason: null,
      changes: []
    });
    if (c.status === 'active') return;
    const when =
      c.status === 'archived' ? '2024-06-10T11:30:00+05:30' : '2024-05-20T16:00:00+05:30';
    push({
      ...base,
      action: 'STATUS_UPDATED',
      actor_name: 'Platform Admin',
      occurred_at: toIstIso(Date.parse(when)),
      reason: null,
      changes: [
        {
          field: 'Status',
          from: CATEGORY_STATUS_LABELS.active,
          to: CATEGORY_STATUS_LABELS[c.status]
        }
      ]
    });
  });
  getRolesStore().forEach((r, i) => {
    const at = Date.parse('2024-01-15T09:00:00+05:30') + i * 60 * 60_000;
    push({
      entity_type: 'hire_role',
      entity_id: r.role_id,
      entity_name: r.name,
      action: 'CREATED',
      actor_name: 'Platform Admin',
      occurred_at: toIstIso(at),
      reason: null,
      changes: []
    });
  });
  const hr = getRolesStore().find((r) => r.name === 'HR Manager')!;
  push({
    entity_type: 'hire_role',
    entity_id: hr.role_id,
    entity_name: hr.name,
    action: 'PERMISSIONS_UPDATED',
    actor_name: 'Platform Admin',
    occurred_at: toIstIso(Date.parse('2024-06-18T15:45:00+05:30')),
    reason: null,
    changes: [{ field: 'Recruiters', from: 'View', to: 'View, Create, Edit' }]
  });
}

seedHistory();

/** Records one event for a category or role, stamped from the mock clock. */
export function recordCategoriesRolesAudit(
  entityType: CategoriesRolesAuditType,
  entityId: string,
  entityName: string,
  action: string,
  changes: AuditChange[] = []
) {
  ticks += 1;
  push({
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    action,
    actor_name: 'Dev Admin',
    occurred_at: toIstIso(MOCK_NOW_MS + ticks * 60_000),
    reason: null,
    changes
  });
}

const KIND = { hire_category: 'CATEGORY', hire_role: 'ROLE' } as const;

/** The events of one category or role, or of every one of that type for the id "all", newest first. */
export function getCategoriesRolesAudit(entityType: CategoriesRolesAuditType, entityId: string) {
  const everything = entityId === 'all';
  return events
    .map((e, order) => ({ e, order }))
    .filter(({ e }) => e.entity_type === entityType && (everything || e.entity_id === entityId))
    .sort((a, b) => b.e.occurred_at.localeCompare(a.e.occurred_at) || b.order - a.order)
    .map(({ e }) => ({
      ...e,
      action: everything
        ? `${e.action}_${KIND[entityType]}_${e.entity_name.toUpperCase()}`
        : e.action
    }));
}
