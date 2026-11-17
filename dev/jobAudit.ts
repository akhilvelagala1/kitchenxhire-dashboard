interface AuditEvent {
  id: string;
  action: string;
  actor_name: string;
  occurred_at: string;
  reason: string | null;
  changes: { field: string; from: string | null; to: string | null }[];
}

const store = new Map<string, AuditEvent[]>();

export function recordHireJobAudit(jobId: string, action: string, reason: unknown = null) {
  const list = store.get(jobId) ?? [];
  list.unshift({
    id: crypto.randomUUID(),
    action,
    actor_name: 'Dev Admin',
    occurred_at: new Date().toISOString(),
    reason: typeof reason === 'string' ? reason : null,
    changes: []
  });
  store.set(jobId, list);
}

export function getHireJobAudit(jobId: string): AuditEvent[] {
  return store.get(jobId) ?? [];
}
