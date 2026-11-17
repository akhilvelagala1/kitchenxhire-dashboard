import { z } from 'zod';
import {
  CITY_TO_DEFAULT_STATE,
  GST_CERTIFICATE_MAX_BYTES,
  RECRUITER_BUSINESS_TYPES,
  RECRUITER_ORG_CITY_OPTIONS,
  RECRUITER_STATE_OPTIONS
} from '../content/recruiterOrgFormOptions';
import { validateGstin } from '../lib/gstin';

/** Local prototype persistence only — bytes are not stored (see the upload field). */
const gstCertificateSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  sizeBytes: z.number().int().positive().max(GST_CERTIFICATE_MAX_BYTES)
});

const pinCodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code.');

const gstNumberSchema = z
  .string()
  .transform((value) => value.replace(/\s+/g, '').toUpperCase())
  .superRefine((value, ctx) => {
    const result = validateGstin(value);
    if (!result.valid) ctx.addIssue({ code: 'custom', message: result.message });
  });

const businessTypeSchema = z
  .string()
  .trim()
  .refine(
    (value) => RECRUITER_BUSINESS_TYPES.some((option) => option.value === value),
    'Choose a type of business.'
  );

const citySchema = z
  .string()
  .trim()
  .refine((value) => RECRUITER_ORG_CITY_OPTIONS.some((city) => city === value), 'Choose a city.');

const stateSchema = z
  .string()
  .trim()
  .refine((value) => RECRUITER_STATE_OPTIONS.some((state) => state === value), 'Choose a state.');

export const recruiterOrganisationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Enter your organisation name.')
      .max(100, 'Organisation name must be 100 characters or fewer.')
      .refine(
        (value) =>
          [...value].every((character) => {
            const code = character.charCodeAt(0);
            return code >= 32 && code !== 127;
          }),
        'Remove unsupported characters from the name.'
      ),
    businessType: businessTypeSchema,
    gstNumber: gstNumberSchema,
    gstCertificate: gstCertificateSchema.optional(),
    addressLine1: z
      .string()
      .trim()
      .min(5, 'Enter at least 5 characters for address line 1.')
      .max(150, 'Address line 1 must be 150 characters or fewer.'),
    addressLine2: z
      .string()
      .trim()
      .max(150, 'Address line 2 must be 150 characters or fewer.')
      .optional(),
    city: citySchema,
    state: stateSchema,
    pinCode: pinCodeSchema,
    logoDataUrl: z.string().optional()
  })
  .superRefine((value, ctx) => {
    const expectedState = CITY_TO_DEFAULT_STATE[value.city];
    if (expectedState && value.state && expectedState !== value.state) {
      ctx.addIssue({
        code: 'custom',
        path: ['city'],
        message: `Choose a city in ${value.state}.`
      });
    }
    const gstin = validateGstin(value.gstNumber);
    if (gstin.valid && value.state && gstin.state !== value.state) {
      ctx.addIssue({
        code: 'custom',
        path: ['gstNumber'],
        message: `This GST number is registered in ${gstin.state}, not ${value.state}.`
      });
    }
  });

export type RecruiterOrganisation = z.infer<typeof recruiterOrganisationSchema>;

type RecruiterOrgSetupStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type RecruiterOrganisationDraft = Partial<Omit<RecruiterOrganisation, 'gstCertificate'>> & {
  gstCertificate?: Partial<RecruiterOrganisation['gstCertificate']>;
};

export interface RecruiterOrganisationRecord {
  status: RecruiterOrgSetupStatus;
  updatedAt: string;
  organisation?: RecruiterOrganisation;
  draft?: RecruiterOrganisationDraft;
}
