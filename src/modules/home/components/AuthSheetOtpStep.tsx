import { Pencil } from 'lucide-react';
import type { ClipboardEvent, KeyboardEvent, MutableRefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import { otpClock } from '../lib/phone';
import type { HireLoginIntent } from '../schemas/hireLogin';
import { authSheetError, authSheetSub, authSheetSubmit, authSheetTitle } from './authSheetStyles';
import { AuthOtpConsent } from './AuthOtpConsent';

interface AuthSheetOtpStepProps {
  shown: string;
  intent: HireLoginIntent;
  digits: string[];
  boxRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  otpError: string;
  timerSeconds: number;
  agree: boolean;
  onAgreeChange: (checked: boolean) => void;
  verifyDisabled: boolean;
  onShowPhone: () => void;
  onDigitChange: (index: number, raw: string) => void;
  onBoxKeyDown: (index: number, event: KeyboardEvent) => void;
  onPaste: (event: ClipboardEvent) => void;
  onResend: () => void;
  onConfirm: () => void;
}

export function AuthSheetOtpStep({
  shown,
  intent,
  digits,
  boxRefs,
  otpError,
  timerSeconds,
  agree,
  onAgreeChange,
  verifyDisabled,
  onShowPhone,
  onDigitChange,
  onBoxKeyDown,
  onPaste,
  onResend,
  onConfirm
}: AuthSheetOtpStepProps) {
  return (
    <div>
      <h2 className={authSheetTitle}>Enter the code</h2>
      <p className={authSheetSub}>
        Sent to <span className="font-extrabold text-ink">{shown}</span>
        <button
          type="button"
          aria-label="Change mobile number"
          onClick={onShowPhone}
          className="ml-1 inline-grid size-[26px] place-items-center rounded-full bg-brand-50 align-middle text-brand-600"
        >
          <Pencil className="size-3.5 stroke-[2.2]" />
        </button>
      </p>
      <p className="mt-1 text-[13px] font-semibold text-ink-500">
        {intent === 'recruiter' ? 'Hiring on KitchenX' : 'Finding a job on KitchenX'}
      </p>
      <div className="mt-6 grid grid-cols-6 gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              boxRefs.current[index] = el;
            }}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : undefined}
            maxLength={1}
            aria-label={`Digit ${index + 1}`}
            value={digit}
            onChange={(event) => onDigitChange(index, event.target.value)}
            onKeyDown={(event) => onBoxKeyDown(index, event)}
            onPaste={onPaste}
            className={cn(
              'h-[52px] w-full min-w-0 rounded-xl border border-line bg-canvas p-0 text-center font-hire text-xl font-extrabold text-ink outline-none',
              'focus:border-brand-600/70 focus:bg-surface focus:shadow-focus-ring'
            )}
          />
        ))}
      </div>
      {otpError && <p className={cn(authSheetError, 'mt-3')}>{otpError}</p>}
      <p className="mt-[18px] text-[15px] font-extrabold text-ink tabular-nums">
        {otpClock(timerSeconds)}
      </p>
      <p className="mt-1 text-[14px] font-medium text-ink-500">
        Didn&apos;t receive the OTP?{' '}
        <button
          type="button"
          disabled={timerSeconds > 0}
          onClick={onResend}
          className="inline [font-family:inherit] font-extrabold text-brand-600 disabled:cursor-default disabled:text-ink-400"
        >
          Resend now
        </button>
      </p>
      <AuthOtpConsent
        className="mt-5"
        checked={agree}
        onChange={(event) => onAgreeChange(event.target.checked)}
      >
        I agree to KitchenX Hiring{' '}
        <a href="#login" onClick={(event) => event.preventDefault()}>
          terms &amp; conditions
        </a>
      </AuthOtpConsent>
      <AuthOtpConsent className="mt-3.5" defaultChecked>
        Send me offers and updates on WhatsApp
      </AuthOtpConsent>
      <button
        type="button"
        disabled={verifyDisabled}
        onClick={onConfirm}
        className={cn(authSheetSubmit, 'mt-[22px]')}
      >
        Verify
      </button>
    </div>
  );
}
