import { describe, expect, it, beforeEach } from 'vitest';
import { normalizeRecruiterAccountId } from './recruiterAccount';
import {
  acceptRecruiterApplication,
  readRecruiterApplications
} from './recruiterApplicationsStore';
import { isRecruiterOrgSetupComplete } from './recruiterOrgSetup';
import { writeRecruiterOrganisationComplete } from './recruiterOrganisationStorage';

const phoneA = '+91 98765 43210';
const phoneB = '+91 91234 56789';
const accountA = normalizeRecruiterAccountId(phoneA);
const accountB = normalizeRecruiterAccountId(phoneB);

const sampleOrg = {
  name: 'Account A Kitchen',
  businessType: 'restaurant',
  gstNumber: '36AABCU9603R1ZM',
  gstCertificate: {
    fileName: 'gst.pdf',
    mimeType: 'application/pdf' as const,
    sizeBytes: 1200,
    dataUrl: 'data:application/pdf;base64,abc'
  },
  addressLine1: 'Road 1',
  city: 'Hyderabad',
  state: 'Telangana',
  pinCode: '500081'
};

describe('recruiter account isolation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes formatted session phones to stable account ids', () => {
    expect(accountA).toBe('919876543210');
    expect(accountB).toBe('919123456789');
    expect(accountA).not.toBe(accountB);
  });

  it('keeps applications and organisation separate per phone', () => {
    const rowsA = readRecruiterApplications(accountA);
    const firstId = rowsA[0]?.id;
    expect(firstId).toBeTruthy();
    const statusBeforeA = rowsA.find((r) => r.id === firstId)!.status;

    acceptRecruiterApplication(accountA, firstId!);
    const afterAcceptA = readRecruiterApplications(accountA).find((r) => r.id === firstId);
    expect(afterAcceptA?.status).not.toBe(statusBeforeA);

    const rowsB = readRecruiterApplications(accountB);
    const sameRowB = rowsB.find((r) => r.id === firstId);
    expect(sameRowB?.status).toBe(statusBeforeA);

    writeRecruiterOrganisationComplete(accountA, sampleOrg);
    expect(isRecruiterOrgSetupComplete(accountA)).toBe(true);
    expect(isRecruiterOrgSetupComplete(accountB)).toBe(false);
  });
});
