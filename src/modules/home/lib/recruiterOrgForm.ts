import { useWatch, type Control } from 'react-hook-form';
import { CITY_TO_DEFAULT_STATE } from '../content/recruiterOrgFormOptions';
import {
  recruiterOrganisationSchema,
  type RecruiterOrganisation,
  type RecruiterOrganisationDraft
} from '../schemas/recruiterOrganisation';
import { RECRUITER_ORG_FIELD_ORDER, type RecruiterOrgField } from './recruiterOrgValidation';

export interface OrgFormValues {
  name: string;
  businessType: string;
  gstNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
}

export type OrgCertificate = NonNullable<RecruiterOrganisation['gstCertificate']>;

/** Subscribe to the form once and fill any not-yet-mounted field from its default. */
export function useOrgFormValues(
  control: Control<OrgFormValues>,
  defaults: OrgFormValues
): OrgFormValues {
  const watched = useWatch({ control, defaultValue: defaults });
  return {
    name: watched.name ?? defaults.name,
    businessType: watched.businessType ?? defaults.businessType,
    gstNumber: watched.gstNumber ?? defaults.gstNumber,
    addressLine1: watched.addressLine1 ?? defaults.addressLine1,
    addressLine2: watched.addressLine2 ?? defaults.addressLine2,
    city: watched.city ?? defaults.city,
    state: watched.state ?? defaults.state,
    pinCode: watched.pinCode ?? defaults.pinCode
  };
}

export function recruiterOrgDefaults(draft?: RecruiterOrganisationDraft): OrgFormValues {
  return {
    name: draft?.name ?? '',
    businessType: draft?.businessType ?? 'restaurant',
    gstNumber: draft?.gstNumber ?? '',
    addressLine1: draft?.addressLine1 ?? '',
    addressLine2: draft?.addressLine2 ?? '',
    city: draft?.city ?? 'Hyderabad',
    state: draft?.state ?? CITY_TO_DEFAULT_STATE.Hyderabad ?? 'Telangana',
    pinCode: draft?.pinCode ?? ''
  };
}

/** Drafts written before depth checks may carry a partial certificate — drop it. */
export function initialRecruiterCertificate(
  draft?: RecruiterOrganisationDraft
): OrgCertificate | null {
  const certificate = draft?.gstCertificate;
  if (!certificate?.fileName || !certificate.mimeType || !certificate.sizeBytes) return null;
  return {
    fileName: certificate.fileName,
    mimeType: certificate.mimeType,
    sizeBytes: certificate.sizeBytes
  };
}

export type RecruiterOrgIssues =
  | { ok: true; data: RecruiterOrganisation; issues: Partial<Record<RecruiterOrgField, string>> }
  | { ok: false; data: null; issues: Partial<Record<RecruiterOrgField, string>> };

/** The one place field errors are produced; blur and submit both call it. */
export function recruiterOrgIssues(
  values: OrgFormValues,
  certificate: OrgCertificate | null
): RecruiterOrgIssues {
  const parsed = recruiterOrganisationSchema.safeParse({
    ...values,
    gstCertificate: certificate ?? undefined
  });
  const issues: Partial<Record<RecruiterOrgField, string>> = {};
  if (parsed.success) return { ok: true, data: parsed.data, issues };
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key !== 'string') continue;
    if (!RECRUITER_ORG_FIELD_ORDER.includes(key as RecruiterOrgField)) continue;
    const field = key as RecruiterOrgField;
    if (!issues[field]) issues[field] = issue.message;
  }
  return { ok: false, data: null, issues };
}
