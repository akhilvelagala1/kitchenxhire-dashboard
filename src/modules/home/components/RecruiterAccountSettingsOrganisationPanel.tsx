import { MapPin, Store } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import {
  CITY_TO_DEFAULT_STATE,
  RECRUITER_BUSINESS_TYPES,
  RECRUITER_ORG_CITY_OPTIONS,
  RECRUITER_STATE_OPTIONS
} from '../content/recruiterOrgFormOptions';
import { normalizeGstin } from '../lib/gstin';
import {
  readRecruiterOrganisationRecord,
  writeRecruiterOrganisationComplete
} from '../lib/recruiterOrganisationStorage';
import {
  recruiterOrganisationSchema,
  type RecruiterOrganisation
} from '../schemas/recruiterOrganisation';
import { AccountSection } from './AccountSettingsControls';
import { recruiterOrgFieldClass } from './recruiterOrganizationFormStyles';
import { OrgFieldError, OrgFieldLabel } from './RecruiterOrgFieldStatus';
import { RecruiterIconSelect } from './RecruiterIconSelect';
import { homeButton } from './styles';

interface OrgPanelDraft {
  name: string;
  businessType: string;
  gstNumber: string;
  addressLine1: string;
  city: string;
  state: string;
  pinCode: string;
}

type OrgPanelField = keyof OrgPanelDraft;

function toDraft(organisation?: RecruiterOrganisation): OrgPanelDraft {
  return {
    name: organisation?.name ?? '',
    businessType: organisation?.businessType ?? RECRUITER_BUSINESS_TYPES[0].value,
    gstNumber: organisation?.gstNumber ?? '',
    addressLine1: organisation?.addressLine1 ?? '',
    city: organisation?.city ?? '',
    state: organisation?.state ?? '',
    pinCode: organisation?.pinCode ?? ''
  };
}

/** Shared label/input/error row for this panel's plain text fields (UI-09 error pattern). */
function OrgTextField({
  id,
  label,
  value,
  onChange,
  error,
  ...inputProps
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: 'numeric';
  spellCheck?: boolean;
  autoCapitalize?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <label className="grid gap-1">
      <OrgFieldLabel label={label} required />
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={recruiterOrgFieldClass}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      <OrgFieldError id={errorId} message={error} />
    </label>
  );
}

/** Recruiter Account Settings — Organisation tab (edits an already-completed organisation only). */
export function RecruiterAccountSettingsOrganisationPanel({ accountId }: { accountId: string }) {
  const [record] = useState(() => readRecruiterOrganisationRecord(accountId));
  const organisation = record.organisation;
  const [saved, setSaved] = useState(organisation);
  const [draft, setDraft] = useState<OrgPanelDraft>(() => toDraft(organisation));
  const [errors, setErrors] = useState<Partial<Record<OrgPanelField, string>>>({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  function setField(field: OrgPanelField, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice('');
  }

  function onCityChange(value: string) {
    const mappedState = CITY_TO_DEFAULT_STATE[value];
    setDraft((current) => ({ ...current, city: value, state: mappedState ?? current.state }));
    setErrors((current) => ({ ...current, city: undefined, state: undefined }));
    setNotice('');
  }

  function onStateChange(value: string) {
    setDraft((current) => {
      const cityDefaultState = CITY_TO_DEFAULT_STATE[current.city];
      const nextCity = cityDefaultState && cityDefaultState !== value ? '' : current.city;
      return { ...current, state: value, city: nextCity };
    });
    setErrors((current) => ({ ...current, state: undefined, city: undefined }));
    setNotice('');
  }

  function cancel() {
    setDraft(toDraft(saved));
    setErrors({});
    setFormError('');
    setNotice('');
  }

  function save() {
    if (!saved) return;
    const merged: RecruiterOrganisation = { ...saved, ...draft };
    const parsed = recruiterOrganisationSchema.safeParse(merged);
    if (!parsed.success) {
      const nextErrors: Partial<Record<OrgPanelField, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && key in draft) {
          const field = key as OrgPanelField;
          if (!nextErrors[field]) nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      setFormError('Fix the highlighted fields and try again.');
      return;
    }
    setErrors({});
    const ok = writeRecruiterOrganisationComplete(accountId, parsed.data);
    if (!ok) {
      setFormError('Could not save on this device. Free some storage and try again.');
      return;
    }
    setFormError('');
    setSaved(parsed.data);
    setNotice('Saved on this device.');
  }

  return (
    <AccountSection
      title="Organisation Information"
      lead="Update your business details for job postings."
    >
      {!organisation || !saved ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-line bg-canvas p-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <p className="text-[13px] font-medium text-ink-500">
            <span className="block text-[14px] font-extrabold text-ink">
              Set up your organisation details first.
            </span>
            Complete your organisation profile before editing it here.
          </p>
          <Link to="/recruiter/organization" className={homeButton('orange-slim')}>
            Go to Organisation Setup
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid gap-x-4 gap-y-3 min-[640px]:grid-cols-2">
            <OrgTextField
              id="recruiter-settings-org-name"
              label="Organisation / Restaurant Name"
              value={draft.name}
              onChange={(value) => setField('name', value)}
              error={errors.name}
              autoComplete="organization"
              placeholder="e.g., Spice Route Restaurant"
            />
            <label className="grid gap-1">
              <OrgFieldLabel label="Business Type" required />
              <RecruiterIconSelect
                id="recruiter-settings-org-businessType"
                icon={Store}
                size="large"
                value={draft.businessType}
                onChange={(value) => setField('businessType', value)}
                invalid={Boolean(errors.businessType)}
                describedBy={
                  errors.businessType ? 'recruiter-settings-org-businessType-error' : undefined
                }
              >
                {RECRUITER_BUSINESS_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </RecruiterIconSelect>
              <OrgFieldError
                id="recruiter-settings-org-businessType-error"
                message={errors.businessType}
              />
            </label>
          </div>

          <OrgTextField
            id="recruiter-settings-org-gstNumber"
            label="GST Number"
            value={draft.gstNumber}
            onChange={(value) => setField('gstNumber', normalizeGstin(value).slice(0, 15))}
            error={errors.gstNumber}
            placeholder="15-character GSTIN"
            maxLength={15}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="characters"
          />

          <OrgTextField
            id="recruiter-settings-org-addressLine1"
            label="Business Address"
            value={draft.addressLine1}
            onChange={(value) => setField('addressLine1', value)}
            error={errors.addressLine1}
            autoComplete="address-line1"
            placeholder="e.g., Hitech City Main Road, Plot No. 12"
          />

          <div className="grid gap-x-4 gap-y-3 min-[768px]:grid-cols-3">
            <label className="grid gap-1">
              <OrgFieldLabel label="City" required />
              <RecruiterIconSelect
                id="recruiter-settings-org-city"
                icon={MapPin}
                value={draft.city}
                onChange={onCityChange}
                invalid={Boolean(errors.city)}
                describedBy={errors.city ? 'recruiter-settings-org-city-error' : undefined}
              >
                {!draft.city && (
                  <option value="" disabled>
                    Choose a city
                  </option>
                )}
                {RECRUITER_ORG_CITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </RecruiterIconSelect>
              <OrgFieldError id="recruiter-settings-org-city-error" message={errors.city} />
            </label>
            <label className="grid gap-1">
              <OrgFieldLabel label="State" required />
              <select // guard-allow: recruiter settings organisation state enum matches prototype native select
                id="recruiter-settings-org-state"
                value={draft.state}
                onChange={(e) => onStateChange(e.target.value)}
                className={recruiterOrgFieldClass}
                aria-invalid={Boolean(errors.state)}
                aria-describedby={errors.state ? 'recruiter-settings-org-state-error' : undefined}
              >
                {RECRUITER_STATE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <OrgFieldError id="recruiter-settings-org-state-error" message={errors.state} />
            </label>
            <OrgTextField
              id="recruiter-settings-org-pinCode"
              label="PIN Code"
              value={draft.pinCode}
              onChange={(value) => setField('pinCode', value.replace(/\D/g, '').slice(0, 6))}
              error={errors.pinCode}
              placeholder="e.g., 500081"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
            />
          </div>

          {formError && (
            <p className="pt-1 text-[12px] font-medium text-danger-600" role="alert">
              {formError}
            </p>
          )}
          {notice && (
            <p className="pt-1 text-[12px] font-semibold text-success-700" role="status">
              {notice}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-3">
            <button type="button" onClick={cancel} className={homeButton('white-slim')}>
              Cancel
            </button>
            <button type="button" onClick={save} className={homeButton('orange-slim')}>
              Save Changes
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
    </AccountSection>
  );
}
