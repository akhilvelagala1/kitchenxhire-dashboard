import { ChevronDown } from 'lucide-react';
import type { FormEvent, RefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import { Spinner } from '@/shared/ui/Spinner';
import { COUNTRY_CODES } from '../lib/phone';
import type { HireLoginIntent } from '../schemas/hireLogin';
import {
  authSheetError,
  authSheetFieldFocus,
  authSheetSub,
  authSheetSubmit,
  authSheetTitle
} from './authSheetStyles';
import { AuthRoleToggle } from './AuthRoleToggle';

interface AuthSheetPhoneStepProps {
  intent: HireLoginIntent;
  onIntentChange: (next: HireLoginIntent) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  phoneError: string;
  phoneValid: boolean;
  phoneSubmitting: boolean;
  phoneRef: RefObject<HTMLInputElement | null>;
  onSubmit: (event: FormEvent) => void;
}

export function AuthSheetPhoneStep({
  intent,
  onIntentChange,
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
  phoneError,
  phoneValid,
  phoneSubmitting,
  phoneRef,
  onSubmit
}: AuthSheetPhoneStepProps) {
  return (
    <div>
      <h2 className={authSheetTitle}>Continue with mobile</h2>
      <p className={authSheetSub}>Choose how you want to use KitchenX.</p>
      <div className="mt-5">
        <AuthRoleToggle intent={intent} onChange={onIntentChange} />
      </div>
      <form noValidate autoComplete="off" onSubmit={onSubmit} className="mt-5 grid gap-3.5">
        <div
          className={cn(
            'flex h-[52px] items-stretch overflow-hidden rounded-[14px] border border-line bg-canvas',
            authSheetFieldFocus
          )}
        >
          <div className="relative w-[84px] flex-none border-r border-line">
            <select // guard-allow: the prototype's country-code select inside the phone field
              aria-label="Country code"
              value={countryCode}
              onChange={(event) => onCountryCodeChange(event.target.value)}
              className="h-full w-full cursor-pointer appearance-none bg-transparent font-hire pr-[22px] pl-3.5 text-base font-extrabold text-ink outline-none"
            >
              {COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  +{code}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 stroke-[2.2] text-ink-400" />
          </div>
          <input
            ref={phoneRef}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={15}
            aria-label="Mobile number"
            placeholder={countryCode === '91' ? '10-digit mobile number' : 'Mobile number'}
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, '').slice(0, 15))}
            className="h-full min-w-0 flex-1 border-0 bg-transparent font-hire px-3.5 text-base font-semibold tracking-[0.02em] text-ink outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-400"
          />
        </div>
        {phoneError && <p className={authSheetError}>{phoneError}</p>}
        <button type="submit" disabled={!phoneValid || phoneSubmitting} className={authSheetSubmit}>
          {phoneSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2 text-white">
              <Spinner size="sm" />
              Continue
            </span>
          ) : (
            'Continue'
          )}
        </button>
        <p className="text-center text-[13px] font-medium text-ink-400">
          You&apos;ll receive an OTP on your mobile number.
        </p>
      </form>
    </div>
  );
}
