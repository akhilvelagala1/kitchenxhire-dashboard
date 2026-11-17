/**
 * Audit events per recruiter, newest first, in the shape of dev/applicationAudit.ts.
 *
 * Every seeded recruiter has a derived history that matches the status it was seeded with: it registered,
 * then the team approved it, and an inactive one was switched off later. Changes made through the mock
 * API are recorded on top of that by recordRecruiterAudit. They are stamped from the mock clock (one
 * minute after the evening of 24 Jun 2024, then one more per event), so the order is the same on every
 * start. A recruiter created through the API has only its recorded events.
 */
import {
  MOCK_NOW_MS,
  RECRUITER_STATUSES,
  RECRUITER_STATUS_LABELS,
  findRecruiter,
  toIstIso,
  type HireAdminRecruiter,
  type RecruiterStatus
} from './recruitersMockData.ts';

interface AuditChange {
  field: string;
  from: string | null;
  to: string | null;
}

interface AuditEvent {
  id: string;
  action: string;
  actor_name: string;
  occurred_at: string;
  reason: string | null;
  changes: AuditChange[];
}

const HOUR = 60 * 60_000;
const DAY = 24 * HOUR;
const recorded = new Map<string, AuditEvent[]>();
let clockTicks = 0;

export function recordRecruiterAudit(
  recruiterId: string,
  action: string,
  changes: AuditChange[] = [],
  reason: string | null = null
) {
  clockTicks += 1;
  const events = recorded.get(recruiterId) ?? [];
  events.unshift({
    id: `${recruiterId}-edit-${clockTicks}`,
    action,
    actor_name: 'Dev Admin',
    occurred_at: toIstIso(MOCK_NOW_MS + clockTicks * 60_000),
    reason,
    changes
  });
  recorded.set(recruiterId, events);
}

/** The status the recruiter was seeded with: the `from` of its oldest recorded status change. */
function seededStatus(row: HireAdminRecruiter, events: AuditEvent[]): RecruiterStatus {
  for (const event of [...events].reverse()) {
    const from = event.changes.find((c) => c.field === 'Status')?.from;
    const status = RECRUITER_STATUSES.find((s) => RECRUITER_STATUS_LABELS[s] === from);
    if (status) return status;
  }
  return row.status;
}

function derivedHistory(row: HireAdminRecruiter, status: RecruiterStatus): AuditEvent[] {
  const seed = Number(row.recruiter_id.slice(3));
  const label = RECRUITER_STATUS_LABELS;
  const joinedMs = Date.parse(row.joined_at);
  const step = (
    k: number,
    action: string,
    actor: string,
    at: number,
    from: string | null,
    to: string
  ) => ({
    id: `${row.recruiter_id}-step-${k}`,
    action,
    actor_name: actor,
    occurred_at: toIstIso(Math.min(at, MOCK_NOW_MS)),
    reason: null,
    changes: [{ field: 'Status', from, to }]
  });
  const events = [step(0, 'RECRUITER_REGISTERED', row.owner_name, joinedMs, null, label.pending)];
  if (status !== 'pending') {
    const approvedMs = joinedMs + (2 + (seed % 20)) * HOUR;
    events.push(step(1, 'APPROVED', 'Onboarding Team', approvedMs, label.pending, label.active));
    if (status === 'inactive') {
      const at = approvedMs + (3 + (seed % 10)) * DAY;
      events.push(step(2, 'STATUS_UPDATED', 'Onboarding Team', at, label.active, label.inactive));
    }
    if (status === 'suspended') {
      const at = approvedMs + (3 + (seed % 10)) * DAY;
      events.push(step(2, 'STATUS_UPDATED', 'Onboarding Team', at, label.active, label.suspended));
    }
  }
  return events.reverse();
}

export function getHireRecruiterAudit(recruiterId: string): AuditEvent[] {
  const events = recorded.get(recruiterId) ?? [];
  const row = findRecruiter(recruiterId);
  const created = events.some((e) => e.action === 'RECRUITER_CREATED');
  return row && !created ? [...events, ...derivedHistory(row, seededStatus(row, events))] : events;
}
