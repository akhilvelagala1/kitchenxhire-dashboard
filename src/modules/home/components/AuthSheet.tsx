import { ArrowLeft, X } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent
} from 'react';
import { cn } from '@/shared/lib/cn';
import { useCountdown } from '../hooks/useCountdown';
import { formatMobile, isValidMobile } from '../lib/phone';
import {
  clearPendingLoginIntent,
  readPendingLoginIntent,
  writePendingLoginIntent,
  type HireLoginIntent
} from '../schemas/hireLogin';
import { AuthLoginWave } from './AuthLoginWave';
import { AuthSheetOtpStep } from './AuthSheetOtpStep';
import { AuthSheetPhoneStep } from './AuthSheetPhoneStep';
import { BrandMark } from './BrandMark';

const OTP_LENGTH = 6;
const OTP_SECONDS = 120;
const EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const blankDigits = () => Array<string>(OTP_LENGTH).fill('');

export interface AuthVerifiedPayload {
  phone: string;
  intent: HireLoginIntent;
}

interface AuthSheetProps {
  onClose: () => void;
  onVerified: (payload: AuthVerifiedPayload) => void;
}

/**
 * Phone, then a six-digit code. UI only until the auth module exists: any six digits proceed, and
 * nothing is sent anywhere.
 */
export function AuthSheet({ onClose, onVerified }: AuthSheetProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [intent, setIntent] = useState<HireLoginIntent>(
    () => readPendingLoginIntent() ?? 'job_seeker'
  );
  const [countryCode, setCountryCode] = useState('91');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);
  const [shown, setShown] = useState('');
  const [digits, setDigits] = useState(blankDigits);
  const [otpError, setOtpError] = useState('');
  const [agree, setAgree] = useState(true);
  const [verifyDisabled, setVerifyDisabled] = useState(false);
  const attempts = useRef(0);
  const sentAt = useRef(0);
  const phoneRef = useRef<HTMLInputElement>(null);
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timer = useCountdown(OTP_SECONDS);
  const { start: startTimer, stop: stopTimer } = timer;

  const cleanPhone = phone.replace(/\D/g, '');
  const phoneValid = isValidMobile(countryCode, cleanPhone);

  useEffect(() => {
    (step === 'phone' ? phoneRef.current : boxRefs.current[0])?.focus();
  }, [step]);

  function startOtp() {
    setDigits(blankDigits());
    setOtpError('');
    setVerifyDisabled(false);
    attempts.current = 0;
    sentAt.current = Date.now();
    startTimer();
  }

  function submitPhone(event: FormEvent) {
    event.preventDefault();
    if (phoneSubmitting) return;
    if (!phoneValid) {
      setPhoneError(
        countryCode === '91' ? 'Enter a 10-digit mobile number.' : 'Enter a valid mobile number.'
      );
      return;
    }
    setPhoneSubmitting(true);
    writePendingLoginIntent(intent);
    setShown(formatMobile(countryCode, cleanPhone));
    startOtp();
    setStep('otp');
    setPhoneSubmitting(false);
  }

  function showPhone() {
    stopTimer();
    setStep('phone');
  }

  function back() {
    if (step === 'otp') showPhone();
    else onClose();
  }

  function closeSheet() {
    clearPendingLoginIntent();
    onClose();
  }

  function setDigit(index: number, raw: string) {
    const value = raw.replace(/\D/g, '').slice(-1);
    setDigits((prev) => prev.map((d, n) => (n === index ? value : d)));
    setOtpError('');
    if (value) boxRefs.current[index + 1]?.focus();
  }

  function onBoxKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !digits[index]) boxRefs.current[index - 1]?.focus();
  }

  function onPaste(event: ClipboardEvent) {
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    event.preventDefault();
    setDigits(Array.from({ length: OTP_LENGTH }, (_, n) => text[n] ?? ''));
    boxRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  }

  function resend() {
    if (timer.seconds > 0) return;
    startOtp();
    boxRefs.current[0]?.focus();
  }

  function confirm() {
    if (!agree) {
      setOtpError('Accept the terms & conditions to continue.');
      return;
    }
    if (Date.now() - sentAt.current > EXPIRY_MS) {
      setOtpError('This code has expired. Resend a new code.');
      return;
    }
    if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(digits.join(''))) {
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        setVerifyDisabled(true);
        setOtpError('Too many attempts. Resend a new code.');
        return;
      }
      setOtpError(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }
    stopTimer();
    const resolvedIntent = readPendingLoginIntent() ?? intent;
    clearPendingLoginIntent();
    onVerified({ phone: shown, intent: resolvedIntent });
  }

  return (
    <div className="relative z-10 w-full max-w-[min(100%,520px)] overflow-hidden bg-surface px-5 pt-4 pb-8 sm:rounded-[28px] sm:px-9 sm:pt-5 sm:pb-10 sm:shadow-auth">
      <div className="relative z-10">
        <div
          className={cn(
            'mb-6',
            step === 'otp'
              ? 'grid grid-cols-[40px_1fr_40px] items-center'
              : 'flex items-start justify-between gap-3'
          )}
        >
          {step === 'otp' ? (
            <button
              type="button"
              aria-label="Back"
              onClick={back}
              className="-ml-1 grid size-10 place-items-center rounded-full text-ink hover:bg-muted"
            >
              <ArrowLeft className="size-[18px] stroke-[2.4]" />
            </button>
          ) : (
            <BrandMark size="auth" />
          )}
          {step === 'otp' ? (
            <div className="flex justify-center">
              <BrandMark size="auth" />
            </div>
          ) : null}
          <button
            type="button"
            aria-label="Close login"
            onClick={closeSheet}
            className={cn(
              'grid size-10 place-items-center rounded-full text-ink-500 hover:bg-muted hover:text-ink',
              step === 'otp' ? '-mr-1 justify-self-end' : '-mr-1'
            )}
          >
            <X className="size-[18px] stroke-[2.4]" />
          </button>
        </div>

        {step === 'phone' ? (
          <AuthSheetPhoneStep
            intent={intent}
            onIntentChange={(next) => {
              setIntent(next);
              writePendingLoginIntent(next);
            }}
            countryCode={countryCode}
            onCountryCodeChange={(code) => {
              setCountryCode(code);
              setPhoneError('');
            }}
            phone={phone}
            onPhoneChange={(value) => {
              setPhone(value);
              setPhoneError('');
            }}
            phoneError={phoneError}
            phoneValid={phoneValid}
            phoneSubmitting={phoneSubmitting}
            phoneRef={phoneRef}
            onSubmit={submitPhone}
          />
        ) : (
          <AuthSheetOtpStep
            shown={shown}
            intent={intent}
            digits={digits}
            boxRefs={boxRefs}
            otpError={otpError}
            timerSeconds={timer.seconds}
            agree={agree}
            onAgreeChange={setAgree}
            verifyDisabled={verifyDisabled}
            onShowPhone={showPhone}
            onDigitChange={setDigit}
            onBoxKeyDown={onBoxKeyDown}
            onPaste={onPaste}
            onResend={resend}
            onConfirm={confirm}
          />
        )}
      </div>
      {step === 'phone' ? <AuthLoginWave /> : null}
    </div>
  );
}
