/**
 * Audit events per application, newest first, in the shape of dev/jobAudit.ts.
 *
 * Every application has a derived history that matches the status it was seeded with: it was submitted,
 * then a recruiter moved it through each stage. Changes made through the mock API are recorded on top
 * of that by recordHireApplicationAudit. They are stamped from the mock clock (one minute after the
 * evening of 24 Jun 2026, then one more per event), so the order is the same on every start.
 */
import {
  APPLICATION_STATUS_LABELS,
  HIRE_APPLICATION_STATUSES,
  MOCK_NOW_MS,
  findApplication,
  toIstIso,
  type HireAdminApplication,
  type HireApplicationStatus
} from './applicationsMockData.ts';

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

/** The stages an application passed on the way to each status. */
const STAGES: Record<HireApplicationStatus, HireApplicationStatus[]> = {
  pending_review: [],
  reviewed: ['reviewed'],
  shortlisted: ['reviewed', 'shortlisted'],
  interview_scheduled: ['reviewed', 'shortlisted', 'interview_scheduled'],
  hired: ['reviewed', 'shortlisted', 'interview_scheduled', 'hired'],
  rejected: ['reviewed', 'rejected']
};

const HOUR = 60 * 60_000;
const recorded = new Map<string, AuditEvent[]>();
let clockTicks = 0;

export function recordHireApplicationAudit(
  applicationId: string,
  action: string,
  changes: AuditChange[] = [],
  reason: string | null = null
) {
  clockTicks += 1;
  const events = recorded.get(applicationId) ?? [];
  events.unshift({
    id: `${applicationId}-edit-${clockTicks}`,
    action,
    actor_name: 'Dev Admin',
    occurred_at: toIstIso(MOCK_NOW_MS + clockTicks * 60_000),
    reason,
    changes
  });
  recorded.set(applicationId, events);
}

/** The status the application was seeded with: the `from` of its oldest recorded status change. */
function seededStatus(row: HireAdminApplication, events: AuditEvent[]): HireApplicationStatus {
  for (const event of [...events].reverse()) {
    const from = event.changes.find((c) => c.field === 'status')?.from;
    const status = HIRE_APPLICATION_STATUSES.find((s) => APPLICATION_STATUS_LABELS[s] === from);
    if (status) return status;
  }
  return row.status;
}

function derivedHistory(row: HireAdminApplication, status: HireApplicationStatus): AuditEvent[] {
  const seed = Number(row.application_id.slice(3));
  const label = APPLICATION_STATUS_LABELS;
  const events: AuditEvent[] = [
    {
      id: `${row.application_id}-step-0`,
      action: 'APPLICATION_SUBMITTED',
      actor_name: row.candidate_name,
      occurred_at: row.applied_at,
      reason: null,
      changes: [{ field: 'status', from: null, to: label.pending_review }]
    }
  ];
  let at = Date.parse(row.applied_at);
  let previous: HireApplicationStatus = 'pending_review';
  STAGES[status].forEach((stage, k) => {
    at = Math.min(at + (2 + ((seed + k * 3) % 20)) * HOUR, MOCK_NOW_MS);
    events.push({
      id: `${row.application_id}-step-${k + 1}`,
      action: stage.toUpperCase(),
      actor_name: row.recruiter_name,
      occurred_at: toIstIso(at),
      reason: null,
      changes: [{ field: 'status', from: label[previous], to: label[stage] }]
    });
    previous = stage;
  });
  return events.reverse();
}

export function getHireApplicationAudit(applicationId: string): AuditEvent[] {
  const events = recorded.get(applicationId) ?? [];
  const row = findApplication(applicationId);
  return row ? [...events, ...derivedHistory(row, seededStatus(row, events))] : events;
}
