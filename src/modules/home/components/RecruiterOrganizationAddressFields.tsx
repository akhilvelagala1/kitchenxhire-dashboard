import { MapPin } from 'lucide-react';
import {
  RECRUITER_ORG_CITY_OPTIONS,
  RECRUITER_STATE_OPTIONS
} from '../content/recruiterOrgFormOptions';
import { OrgFieldError, OrgFieldLabel } from './RecruiterOrgFieldStatus';
import { RecruiterIconSelect } from './RecruiterIconSelect';
import { recruiterOrgFieldClass } from './recruiterOrganizationFormStyles';

type RecruiterOrgAddressField = 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'pinCode';

interface RecruiterOrganizationAddressFieldsProps {
  compact?: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  onAddressLine1Change: (value: string) => void;
  onAddressLine2Change: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onPinCodeChange: (value: string) => void;
  onBlur: (field: RecruiterOrgAddressField) => void;
  errors?: Partial<Record<RecruiterOrgAddressField, string>>;
  success?: Partial<Record<RecruiterOrgAddressField, boolean>>;
}

export function RecruiterOrganizationAddressFields({
  compact = false,
  addressLine1,
  addressLine2,
  city,
  state,
  pinCode,
  onAddressLine1Change,
  onAddressLine2Change,
  onCityChange,
  onStateChange,
  onPinCodeChange,
  onBlur,
  errors,
  success
}: RecruiterOrganizationAddressFieldsProps) {
  const gap = compact ? 'gap-1' : 'gap-2';
  const gridGap = compact ? 'gap-x-5 gap-y-2.5' : 'gap-4';
  const errorId = (field: RecruiterOrgAddressField) => `recruiter-org-${field}-error`;

  return (
    <>
      <label className={`grid ${gap}`}>
        <OrgFieldLabel label="Address Line 1" required success={success?.addressLine1} />
        <input
          id="recruiter-org-addressLine1"
          autoComplete="address-line1"
          value={addressLine1}
          onChange={(e) => onAddressLine1Change(e.target.value)}
          onBlur={() => onBlur('addressLine1')}
          placeholder="e.g., Hitech City Main Road, Plot No. 12"
          className={recruiterOrgFieldClass}
          aria-invalid={Boolean(errors?.addressLine1)}
          aria-describedby={errors?.addressLine1 ? errorId('addressLine1') : undefined}
        />
        <OrgFieldError id={errorId('addressLine1')} message={errors?.addressLine1} />
      </label>
      <label className={`grid ${gap}`}>
        <OrgFieldLabel label="Address Line 2" optional success={success?.addressLine2} />
        <input
          id="recruiter-org-addressLine2"
          autoComplete="address-line2"
          value={addressLine2}
          onChange={(e) => onAddressLine2Change(e.target.value)}
          onBlur={() => onBlur('addressLine2')}
          placeholder="e.g., Near Cyber Towers"
          className={recruiterOrgFieldClass}
          aria-invalid={Boolean(errors?.addressLine2)}
          aria-describedby={errors?.addressLine2 ? errorId('addressLine2') : undefined}
        />
        <OrgFieldError id={errorId('addressLine2')} message={errors?.addressLine2} />
      </label>
      <div className={`grid ${gridGap} min-[768px]:grid-cols-3`}>
        <label className={`grid ${gap}`}>
          <OrgFieldLabel label="City" required success={success?.city} />
          <RecruiterIconSelect
            id="recruiter-org-city"
            icon={MapPin}
            size="large"
            value={city}
            invalid={Boolean(errors?.city)}
            describedBy={errors?.city ? errorId('city') : undefined}
            onChange={onCityChange}
            onBlur={() => onBlur('city')}
          >
            {!city && (
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
          <OrgFieldError id={errorId('city')} message={errors?.city} />
        </label>
        <label className={`grid ${gap}`}>
          <OrgFieldLabel label="State" required success={success?.state} />
          <select // guard-allow: recruiter org state enum matches prototype native select
            id="recruiter-org-state"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            onBlur={() => onBlur('state')}
            className={recruiterOrgFieldClass}
            aria-invalid={Boolean(errors?.state)}
            aria-describedby={errors?.state ? errorId('state') : undefined}
          >
            {RECRUITER_STATE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <OrgFieldError id={errorId('state')} message={errors?.state} />
        </label>
        <label className={`grid ${gap}`}>
          <OrgFieldLabel label="PIN Code" required success={success?.pinCode} />
          <input
            id="recruiter-org-pinCode"
            value={pinCode}
            onChange={(e) => onPinCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onBlur={() => onBlur('pinCode')}
            placeholder="e.g., 500081"
            className={recruiterOrgFieldClass}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            aria-invalid={Boolean(errors?.pinCode)}
            aria-describedby={errors?.pinCode ? errorId('pinCode') : undefined}
          />
          <OrgFieldError id={errorId('pinCode')} message={errors?.pinCode} />
        </label>
      </div>
    </>
  );
}
