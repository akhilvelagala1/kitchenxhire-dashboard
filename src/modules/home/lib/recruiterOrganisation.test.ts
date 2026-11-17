import { beforeEach, describe, expect, it } from 'vitest';
import { recruiterOrganisationSchema } from '../schemas/recruiterOrganisation';
import { isRecruiterOrgSetupComplete } from './recruiterOrgSetup';
import {
  readRecruiterOrganisationRecord,
  writeRecruiterOrganisationComplete,
  writeRecruiterOrganisationDraft
} from './recruiterOrganisationStorage';

const sampleOrg = {
  name: 'Spice Route Restaurant',
  businessType: 'restaurant',
  gstNumber: '36AABCU9603R1ZO',
  gstCertificate: {
    fileName: 'gst.pdf',
    mimeType: 'application/pdf' as const,
    sizeBytes: 1200
  },
  addressLine1: 'Hitec City Main Road',
  city: 'Hyderabad',
  state: 'Telangana',
  pinCode: '500081'
};

describe('recruiterOrganisationSchema', () => {
  it('accepts a valid organisation payload', () => {
    expect(recruiterOrganisationSchema.safeParse(sampleOrg).success).toBe(true);
  });

  it('accepts a payload without the optional GST certificate', () => {
    expect(
      recruiterOrganisationSchema.safeParse({ ...sampleOrg, gstCertificate: undefined }).success
    ).toBe(true);
  });

  it('rejects an invalid PIN code', () => {
    expect(recruiterOrganisationSchema.safeParse({ ...sampleOrg, pinCode: '012345' }).success).toBe(
      false
    );
  });

  it('rejects a GST number that fails its checksum', () => {
    expect(
      recruiterOrganisationSchema.safeParse({ ...sampleOrg, gstNumber: '36AABCU9603R1ZM' }).success
    ).toBe(false);
  });

  it('rejects a GST number registered in a different state', () => {
    expect(
      recruiterOrganisationSchema.safeParse({ ...sampleOrg, gstNumber: '27AAPFU0939F1ZV' }).success
    ).toBe(false);
  });

  it('rejects a city that does not belong to the selected state', () => {
    expect(
      recruiterOrganisationSchema.safeParse({ ...sampleOrg, state: 'Karnataka' }).success
    ).toBe(false);
  });

  it('rejects a business type outside the configured options', () => {
    expect(
      recruiterOrganisationSchema.safeParse({ ...sampleOrg, businessType: 'nightclub' }).success
    ).toBe(false);
  });

  it('rejects an organisation name with control characters', () => {
    expect(
      recruiterOrganisationSchema.safeParse({ ...sampleOrg, name: 'Spice\u0000Route' }).success
    ).toBe(false);
  });

  it('rejects address line 1 shorter than five characters', () => {
    expect(
      recruiterOrganisationSchema.safeParse({ ...sampleOrg, addressLine1: 'Hite' }).success
    ).toBe(false);
  });
});

describe('recruiter organisation storage', () => {
  const accountId = '919876543210';

  beforeEach(() => {
    localStorage.clear();
  });

  it('tracks IN_PROGRESS drafts and COMPLETED setup', () => {
    expect(isRecruiterOrgSetupComplete(accountId)).toBe(false);
    writeRecruiterOrganisationDraft(accountId, { name: 'Draft Kitchen' });
    expect(readRecruiterOrganisationRecord(accountId).status).toBe('IN_PROGRESS');
    expect(writeRecruiterOrganisationComplete(accountId, sampleOrg)).toBe(true);
    expect(isRecruiterOrgSetupComplete(accountId)).toBe(true);
  });
});
