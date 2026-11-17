import { useState, type Ref } from 'react';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import { formatSupportPhone } from './settingsPlatformInfo';

interface SettingsPhoneInputProps {
  /** Undefined only in the first render after the settings arrive, before the form is filled. */
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/**
 * The phone box with a fixed +91 drawn inside its left edge. While the person types it shows exactly
 * what was typed; at rest it shows a valid number grouped as 98785 43210. Only the display changes:
 * the form keeps what was typed, so looking at the field never marks the form as edited.
 */
export function SettingsPhoneInput({
  value,
  onChange,
  onBlur,
  className,
  ...rest
}: SettingsPhoneInputProps) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#17191F]">
        +91
      </span>
      <Input
        {...rest}
        type="tel"
        inputMode="tel"
        autoComplete="off"
        placeholder="98765 43210"
        value={editing ? (value ?? '') : formatSupportPhone(value ?? '')}
        onFocus={() => setEditing(true)}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          setEditing(false);
          onBlur();
        }}
        className={cn('pl-[calc(42*var(--u))]', className)}
      />
    </div>
  );
}
