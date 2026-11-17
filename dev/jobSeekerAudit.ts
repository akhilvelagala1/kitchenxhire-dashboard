/**
 * Audit events per job seeker, newest first, in the shape of dev/applicationAudit.ts.
 *
 * Every seeded job seeker has a derived history that matches the status it was seeded with: the profile
 * was created, activated by the system and, for an inactive one, deactivated later. Changes made through
 * the mock API are recorded on top of that by recordJobSeekerAudit. They are stamped from the mock clock
 * (one minute after the evening of 24 Jun 2024, then one more per event), so the order is the same on
 * every start. A job seeker added through the API has no derived history: it has its recorded events.
 */
import {
  JOB_SEEKER_STATUS_LABELS,
  MOCK_NOW_MS,
  findJobSeeker,
  toIstIso,
  type HireAdminJobSeeker,
  type JobSeekerStatus
} from './jobSeekersMockData.ts';

export interface AuditChange {
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

export function recordJobSeekerAudit(
  jobSeekerId: string,
  action: string,
  changes: AuditChange[] = [],
  reason: string | null = null
) {
  clockTicks += 1;
  const events = recorded.get(jobSeekerId) ?? [];
  events.unshift({
    id: `${jobSeekerId}-edit-${clockTicks}`,
    action,
    actor_name: 'Dev Admin',
    occurred_at: toIstIso(MOCK_NOW_MS + clockTicks * 60_000),
    reason,
    changes
  });
  recorded.set(jobSeekerId, events);
}

/** The status the job seeker was seeded with: the `from` of its oldest recorded status change. */
function seededStatus(row: HireAdminJobSeeker, events: AuditEvent[]): JobSeekerStatus {
  for (const event of [...events].reverse()) {
    const from = event.changes.find((c) => c.field === 'status')?.from;
    for (const [key, label] of Object.entries(JOB_SEEKER_STATUS_LABELS)) {
      if (from === label) return key as JobSeekerStatus;
    }
  }
  return row.status;
}

function derivedHistory(row: HireAdminJobSeeker, status: JobSeekerStatus): AuditEvent[] {
  const seed = Number(row.job_seeker_id.slice(2));
  const label = JOB_SEEKER_STATUS_LABELS;
  const joined = Date.parse(row.joined_at);
  const activated = Math.min(joined + (1 + (seed % 3)) * HOUR, MOCK_NOW_MS);
  const events: AuditEvent[] = [
    {
      id: `${row.job_seeker_id}-step-0`,
      action: 'PROFILE_CREATED',
      actor_name: row.name,
      occurred_at: row.joined_at,
      reason: null,
      changes: [{ field: 'status', from: null, to: label.under_review }]
    }
  ];
  if (status === 'under_review') return events.reverse();

  events.push({
    id: `${row.job_seeker_id}-step-1`,
    action: 'PROFILE_ACTIVATED',
    actor_name: 'System',
    occurred_at: toIstIso(activated),
    reason: null,
    changes: [{ field: 'status', from: label.under_review, to: label.active }]
  });
  if (status === 'inactive' || status === 'suspended') {
    const at = Math.min(activated + (2 + (seed % 20)) * DAY, MOCK_NOW_MS);
    events.push({
      id: `${row.job_seeker_id}-step-2`,
      action: 'STATUS_UPDATED',
      actor_name: 'Platform Admin',
      occurred_at: toIstIso(at),
      reason: null,
      changes: [{ field: 'status', from: label.active, to: label[status] }]
    });
  }
  return events.reverse();
}

export function getHireJobSeekerAudit(jobSeekerId: string): AuditEvent[] {
  const events = recorded.get(jobSeekerId) ?? [];
  const row = findJobSeeker(jobSeekerId);
  if (!row || events.some((e) => e.action === 'PROFILE_CREATED')) return events;
  return [...events, ...derivedHistory(row, seededStatus(row, events))];
}
