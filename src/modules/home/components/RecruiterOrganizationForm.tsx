import { MapPin, Store } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  CITY_TO_DEFAULT_STATE,
  RECRUITER_BUSINESS_TYPES
} from '../content/recruiterOrgFormOptions';
import {
  initialRecruiterCertificate,
  recruiterOrgDefaults,
  recruiterOrgIssues,
  useOrgFormValues,
  type OrgCertificate
} from '../lib/recruiterOrgForm';
import { writeRecruiterOrganisationComplete } from '../lib/recruiterOrganisationStorage';
import {
  focusFirstOrgInvalid,
  RECRUITER_ORG_FIELD_ORDER,
  type RecruiterOrgField
} from '../lib/recruiterOrgValidation';
import type {
  RecruiterOrganisation,
  RecruiterOrganisationDraft
} from '../schemas/recruiterOrganisation';
import { OrgFieldError, OrgFieldLabel } from './RecruiterOrgFieldStatus';
import { RecruiterFormSection } from './RecruiterFormSection';
import { RecruiterIconSelect } from './RecruiterIconSelect';
import { RecruiterOrganizationAddressFields } from './RecruiterOrganizationAddressFields';
import { RecruiterOrganizationGstFields } from './RecruiterOrganizationGstFields';
import { recruiterOrgFieldClass } from './recruiterOrganizationFormStyles';
import { RecruiterSetupFormActions } from './RecruiterSetupFormActions';
import {
  recruiterSetupFormCardOrgFit,
  recruiterSetupFormLead,
  recruiterSetupFormTitle
} from './recruiterSetupStyles';

interface RecruiterOrganizationFormProps {
  accountId: string;
  initialDraft?: RecruiterOrganisationDraft;
  onCancel: () => void;
  onSaved: (organisation: RecruiterOrganisation) => void;
  onDraftChange?: (draft: RecruiterOrganisationDraft) => void;
}

export function RecruiterOrganizationForm({
  accountId,
  initialDraft,
  onCancel,
  onSaved,
  onDraftChange
}: RecruiterOrganizationFormProps) {
  const defaults = useMemo(() => recruiterOrgDefaults(initialDraft), [initialDraft]);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm({ defaultValues: defaults });
  const values = useOrgFormValues(control, defaults);
  const [certificate, setCertificate] = useState<OrgCertificate | null>(() =>
    initialRecruiterCertificate(initialDraft)
  );
  const [certificateError, setCertificateError] = useState('');
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState<Partial<Record<RecruiterOrgField, boolean>>>({});
  const [saving, setSaving] = useState(false);

  function syncDraft(cert: OrgCertificate | null = certificate) {
    const current = getValues();
    onDraftChange?.({
      ...current,
      addressLine2: current.addressLine2.trim() || undefined,
      gstCertificate: cert ?? undefined
    });
  }

  function onFieldBlur(field: RecruiterOrgField) {
    setTouched((current) => ({ ...current, [field]: true }));
    const { issues } = recruiterOrgIssues(getValues(), certificate);
    for (const key of RECRUITER_ORG_FIELD_ORDER) {
      if (key === 'gstCertificate') continue;
      const message = issues[key];
      const shown = Boolean(errors[key]) || key === field || touched[key];
      if (message && shown) setError(key, { type: 'validate', message });
      else if (shown) clearErrors(key);
    }
    syncDraft();
  }

  function onCertificateChange(next: OrgCertificate | null) {
    setCertificate(next);
    setCertificateError('');
    setTouched((current) => ({ ...current, gstCertificate: true }));
    syncDraft(next);
  }

  const submit = handleSubmit((formValues) => {
    setFormError('');
    setCertificateError('');
    const result = recruiterOrgIssues(formValues, certificate);
    if (!result.ok) {
      setCertificateError(result.issues.gstCertificate ?? '');
      for (const field of RECRUITER_ORG_FIELD_ORDER) {
        const message = result.issues[field];
        if (!message || field === 'gstCertificate') continue;
        setError(field, { type: 'validate', message });
      }
      setFormError('Fix the highlighted fields and try again.');
      focusFirstOrgInvalid(Object.keys(result.issues));
      return;
    }
    setSaving(true);
    const saved = writeRecruiterOrganisationComplete(accountId, result.data);
    setSaving(false);
    if (!saved) {
      setFormError('Could not save on this device. Free some storage and try again.');
      return;
    }
    onSaved(result.data);
  });

  return (
    <div className={recruiterSetupFormCardOrgFit}>
      <header className="mb-2 min-[1024px]:mb-2.5">
        <h1 // guard-allow: recruiter organization setup uses hire marketing form heading, not admin PageHeader
          className={recruiterSetupFormTitle}
        >
          Organization Details
        </h1>
        <p className={recruiterSetupFormLead}>Tell us about your restaurant or business.</p>
      </header>

      <form className="space-y-0" onSubmit={submit} noValidate>
        <div className="space-y-0">
          <div className="grid gap-x-5 gap-y-2 min-[768px]:grid-cols-2 min-[1024px]:pt-0.5">
            <label className="grid gap-1">
              <OrgFieldLabel
                label="Organization Name"
                required
                success={Boolean(touched.name && !errors.name && values.name.trim())}
              />
              <input
                id="recruiter-org-name"
                autoComplete="organization"
                {...register('name', { onChange: () => clearErrors('name') })}
                onBlur={() => onFieldBlur('name')}
                placeholder="e.g., Spice Route Restaurant"
                className={recruiterOrgFieldClass}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'recruiter-org-name-error' : undefined}
              />
              <OrgFieldError id="recruiter-org-name-error" message={errors.name?.message} />
            </label>
            <label className="grid gap-1">
              <OrgFieldLabel
                label="Type of Business"
                required
                success={Boolean(touched.businessType && !errors.businessType)}
              />
              <Controller
                control={control}
                name="businessType"
                render={({ field }) => (
                  <RecruiterIconSelect
                    id="recruiter-org-businessType"
                    icon={Store}
                    size="large"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      clearErrors('businessType');
                    }}
                    onBlur={() => onFieldBlur('businessType')}
                    invalid={Boolean(errors.businessType)}
                    describedBy={
                      errors.businessType ? 'recruiter-org-businessType-error' : undefined
                    }
                  >
                    {RECRUITER_BUSINESS_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </RecruiterIconSelect>
                )}
              />
              <OrgFieldError
                id="recruiter-org-businessType-error"
                message={errors.businessType?.message}
              />
            </label>
          </div>

          <div className="border-t border-line-soft pt-2.5 min-[1024px]:pt-2">
            <RecruiterOrganizationGstFields
              compact
              gstNumber={values.gstNumber}
              onGstNumberChange={(value) => {
                setValue('gstNumber', value);
                clearErrors('gstNumber');
              }}
              onGstBlur={() => onFieldBlur('gstNumber')}
              gstNumberError={errors.gstNumber?.message}
              gstNumberSuccess={Boolean(
                touched.gstNumber && !errors.gstNumber && values.gstNumber.length === 15
              )}
              certificate={certificate}
              onCertificateChange={onCertificateChange}
              certificateError={certificateError}
              certificateSuccess={Boolean(
                certificate && touched.gstCertificate && !certificateError
              )}
            />
          </div>

          <RecruiterFormSection
            icon={MapPin}
            title="Business Address"
            density="fit"
            iconVariant="plain"
            className="min-[1024px]:pt-2"
          >
            <RecruiterOrganizationAddressFields
              compact
              addressLine1={values.addressLine1}
              addressLine2={values.addressLine2}
              city={values.city}
              state={values.state}
              pinCode={values.pinCode}
              onAddressLine1Change={(value) => {
                setValue('addressLine1', value);
                clearErrors('addressLine1');
              }}
              onAddressLine2Change={(value) => {
                setValue('addressLine2', value);
                clearErrors('addressLine2');
              }}
              onCityChange={(value) => {
                setValue('city', value);
                clearErrors('city');
                const mapped = CITY_TO_DEFAULT_STATE[value];
                if (mapped) setValue('state', mapped);
              }}
              onStateChange={(value) => {
                setValue('state', value);
                clearErrors('state');
                const currentCity = getValues('city');
                if (currentCity && CITY_TO_DEFAULT_STATE[currentCity] !== value) {
                  setValue('city', '');
                  clearErrors('city');
                }
              }}
              onPinCodeChange={(value) => {
                setValue('pinCode', value);
                clearErrors('pinCode');
              }}
              onBlur={onFieldBlur}
              errors={{
                addressLine1: errors.addressLine1?.message,
                addressLine2: errors.addressLine2?.message,
                city: errors.city?.message,
                state: errors.state?.message,
                pinCode: errors.pinCode?.message
              }}
              success={{
                addressLine1: Boolean(
                  touched.addressLine1 && !errors.addressLine1 && values.addressLine1.trim()
                ),
                city: Boolean(touched.city && !errors.city && values.city),
                state: Boolean(touched.state && !errors.state && values.state),
                pinCode: Boolean(touched.pinCode && !errors.pinCode && values.pinCode)
              }}
            />
          </RecruiterFormSection>

          {formError && (
            <p className="pt-1 text-[12px] font-medium text-danger-600" role="alert">
              {formError}
            </p>
          )}
        </div>

        <div className="pt-3 min-[1024px]:pt-4">
          <RecruiterSetupFormActions
            onCancel={onCancel}
            primaryLabel="Save & Continue"
            submitting={saving}
            orgFit
          />
        </div>
      </form>
    </div>
  );
}
