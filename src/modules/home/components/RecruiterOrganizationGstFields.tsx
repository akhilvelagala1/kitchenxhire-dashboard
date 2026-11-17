import { CircleCheck, CloudUpload, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { GST_CERTIFICATE_ACCEPT } from '../content/recruiterOrgFormOptions';
import { normalizeGstin } from '../lib/gstin';
import { formatFileSize, inspectCertificateFile } from '../lib/recruiterOrgValidation';
import type { RecruiterOrganisation } from '../schemas/recruiterOrganisation';
import { OrgFieldError, OrgFieldLabel } from './RecruiterOrgFieldStatus';
import { recruiterOrgFieldClass } from './recruiterOrganizationFormStyles';
import {
  recruiterSetupAddFileButton,
  recruiterSetupSecondaryButtonOrgFit,
  recruiterSetupUploadBoxOrg,
  recruiterSetupUploadIconOrg
} from './recruiterSetupStyles';

interface RecruiterOrganizationGstFieldsProps {
  compact?: boolean;
  gstNumber: string;
  gstNumberError?: string;
  gstNumberSuccess?: boolean;
  onGstNumberChange: (value: string) => void;
  onGstBlur: () => void;
  certificate: NonNullable<RecruiterOrganisation['gstCertificate']> | null;
  certificateError?: string;
  certificateSuccess?: boolean;
  onCertificateChange: (cert: NonNullable<RecruiterOrganisation['gstCertificate']> | null) => void;
}

export function RecruiterOrganizationGstFields({
  compact = false,
  gstNumber,
  gstNumberError,
  gstNumberSuccess,
  onGstNumberChange,
  onGstBlur,
  certificate,
  certificateError,
  certificateSuccess,
  onCertificateChange
}: RecruiterOrganizationGstFieldsProps) {
  const [uploadError, setUploadError] = useState('');
  const [checking, setChecking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFilePick(file: File | undefined) {
    setUploadError('');
    if (!file) return;
    setChecking(true);
    const result = await inspectCertificateFile(file);
    setChecking(false);
    if (!result.ok) {
      setUploadError(result.message);
      return;
    }
    onCertificateChange({
      fileName: file.name,
      mimeType: result.mimeType,
      sizeBytes: file.size
    });
  }

  const displayError = uploadError || certificateError;
  const labelGap = compact ? 'gap-1.5' : 'gap-2';

  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] ${labelGap}`}>
      <label className={`grid ${labelGap}`}>
        <OrgFieldLabel label="GST Number" required success={gstNumberSuccess} />
        <input
          id="recruiter-org-gstNumber"
          value={gstNumber}
          onChange={(e) => onGstNumberChange(normalizeGstin(e.target.value).slice(0, 15))}
          onBlur={onGstBlur}
          placeholder="15-character GSTIN"
          className={recruiterOrgFieldClass}
          maxLength={15}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
          aria-invalid={Boolean(gstNumberError)}
          aria-describedby={gstNumberError ? 'recruiter-org-gstNumber-error' : undefined}
        />
      </label>
      <OrgFieldError id="recruiter-org-gstNumber-error" message={gstNumberError} />

      <div className={recruiterSetupUploadBoxOrg}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className={recruiterSetupUploadIconOrg}>
            <CloudUpload className="size-6 stroke-[1.5]" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[16px] font-bold leading-tight text-ink min-[1024px]:text-[17px]">
                Upload GST Certificate (PDF, JPG or PNG)
              </p>
              {certificateSuccess && !displayError && (
                <CircleCheck className="size-4 flex-none text-success-700" />
              )}
            </div>
            <p className="text-[14px] font-medium text-ink-500">Optional · Max size: 5 MB</p>
            {certificate && (
              <p className="truncate text-[13px] font-semibold text-ink-700">
                {certificate.fileName} · {formatFileSize(certificate.sizeBytes)}
              </p>
            )}
            <OrgFieldError id="recruiter-org-gstCertificate-error" message={displayError} />
            {checking && <p className="text-[12px] font-semibold text-ink-500">Checking file…</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-stretch min-[640px]:self-center">
          {certificate && (
            <button
              type="button"
              onClick={() => {
                setUploadError('');
                onCertificateChange(null);
              }}
              className={recruiterSetupSecondaryButtonOrgFit()}
              aria-label="Remove GST certificate"
            >
              <X className="size-4" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file" // guard-allow: recruiter GST certificate upload on organization setup
            accept={GST_CERTIFICATE_ACCEPT}
            aria-label="GST certificate file"
            className="sr-only"
            onChange={(e) => {
              void onFilePick(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            id="recruiter-org-certificate"
            type="button"
            disabled={checking}
            onClick={() => fileRef.current?.click()}
            className={recruiterSetupAddFileButton()}
          >
            {!certificate && <Plus className="size-4 text-ink" strokeWidth={2.5} />}
            {certificate ? 'Replace' : 'Add File'}
          </button>
        </div>
      </div>
    </div>
  );
}
