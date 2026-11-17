import { DEMO_RECRUITER_APPLICATIONS } from '../content/demoRecruiterApplications';
import type {
  RecruiterApplicationStatus,
  RecruiterInboundApplication
} from '../schemas/recruiterApplication';
import { recruiterScopedStorageKey } from './recruiterAccount';

const RECRUITER_APPLICATIONS_KEY_BASE = 'kx-hire-recruiter-applications-v2';

function storageKey(accountId: string) {
  return recruiterScopedStorageKey(RECRUITER_APPLICATIONS_KEY_BASE, accountId);
}

function cloneRows(rows: RecruiterInboundApplication[]) {
  return rows.map((row) => ({ ...row }));
}

export function readRecruiterApplications(accountId: string): RecruiterInboundApplication[] {
  try {
    const raw = localStorage.getItem(storageKey(accountId));
    if (raw) {
      const parsed = JSON.parse(raw) as RecruiterInboundApplication[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fall through to seed
  }
  const seed = cloneRows(DEMO_RECRUITER_APPLICATIONS);
  writeRecruiterApplications(accountId, seed);
  return seed;
}

function writeRecruiterApplications(accountId: string, rows: RecruiterInboundApplication[]) {
  try {
    localStorage.setItem(storageKey(accountId), JSON.stringify(rows));
  } catch {
    // private mode / test env
  }
}

function updateRecruiterApplicationStatus(
  accountId: string,
  id: string,
  status: RecruiterApplicationStatus
) {
  const rows = readRecruiterApplications(accountId);
  const next = rows.map((row) => (row.id === id ? { ...row, status } : row));
  writeRecruiterApplications(accountId, next);
  return next;
}

export function acceptRecruiterApplication(accountId: string, id: string) {
  const rows = readRecruiterApplications(accountId);
  const row = rows.find((r) => r.id === id);
  if (!row) return rows;
  const nextStatus: RecruiterApplicationStatus =
    row.status === 'new' || row.status === 'under-review'
      ? 'selected'
      : row.status === 'shortlisted' || row.status === 'interview'
        ? 'hired'
        : row.status;
  return updateRecruiterApplicationStatus(accountId, id, nextStatus);
}

export function rejectRecruiterApplication(accountId: string, id: string) {
  return updateRecruiterApplicationStatus(accountId, id, 'rejected');
}

export function updateRecruiterApplicationNotes(
  accountId: string,
  applicationId: string,
  notes: string
): void {
  const rows = readRecruiterApplications(accountId);
  const next = rows.map((row) =>
    row.id === applicationId ? { ...row, recruiterNotes: notes } : row
  );
  writeRecruiterApplications(accountId, next);
}
