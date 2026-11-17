import type {
  RecruiterOrganisation,
  RecruiterOrganisationDraft,
  RecruiterOrganisationRecord
} from '../schemas/recruiterOrganisation';
import { recruiterScopedStorageKey } from './recruiterAccount';

const RECRUITER_ORG_KEY_BASE = 'kx-hire-recruiter-organisation-v2';

function storageKey(accountId: string) {
  return recruiterScopedStorageKey(RECRUITER_ORG_KEY_BASE, accountId);
}

function emptyRecord(): RecruiterOrganisationRecord {
  return { status: 'NOT_STARTED', updatedAt: new Date().toISOString() };
}

function parseRecord(raw: string): RecruiterOrganisationRecord | null {
  try {
    const data = JSON.parse(raw) as RecruiterOrganisationRecord;
    if (
      data &&
      (data.status === 'NOT_STARTED' ||
        data.status === 'IN_PROGRESS' ||
        data.status === 'COMPLETED')
    ) {
      return data;
    }
  } catch {
    return null;
  }
  return null;
}

export function readRecruiterOrganisationRecord(accountId: string): RecruiterOrganisationRecord {
  try {
    const raw = localStorage.getItem(storageKey(accountId));
    if (raw) {
      const parsed = parseRecord(raw);
      if (parsed) return parsed;
    }
  } catch {
    // private mode / test env
  }
  return emptyRecord();
}

function writeRecruiterOrganisationRecord(
  accountId: string,
  record: RecruiterOrganisationRecord
): boolean {
  try {
    localStorage.setItem(storageKey(accountId), JSON.stringify(record));
    return true;
  } catch {
    // private mode / quota / test env
    return false;
  }
}

export function writeRecruiterOrganisationDraft(
  accountId: string,
  draft: RecruiterOrganisationDraft
) {
  const current = readRecruiterOrganisationRecord(accountId);
  if (current.status === 'COMPLETED') return;
  writeRecruiterOrganisationRecord(accountId, {
    status: 'IN_PROGRESS',
    updatedAt: new Date().toISOString(),
    draft: { ...current.draft, ...draft },
    organisation: undefined
  });
}

export function writeRecruiterOrganisationComplete(
  accountId: string,
  organisation: RecruiterOrganisation
) {
  return writeRecruiterOrganisationRecord(accountId, {
    status: 'COMPLETED',
    updatedAt: new Date().toISOString(),
    organisation,
    draft: undefined
  });
}
