import type { RecruiterOrganisation } from '../schemas/recruiterOrganisation';
import { recruiterOrganisationSchema } from '../schemas/recruiterOrganisation';
import { readRecruiterOrganisationRecord } from './recruiterOrganisationStorage';

export function isRecruiterOrgSetupComplete(accountId: string): boolean {
  const record = readRecruiterOrganisationRecord(accountId);
  return record.status === 'COMPLETED' && Boolean(record.organisation);
}

export function getCompletedRecruiterOrganisation(accountId: string): RecruiterOrganisation | null {
  const record = readRecruiterOrganisationRecord(accountId);
  if (record.status !== 'COMPLETED' || !record.organisation) return null;
  const parsed = recruiterOrganisationSchema.safeParse(record.organisation);
  return parsed.success ? parsed.data : null;
}
