import { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/Input';
import type { SettingsFormValues } from '../schemas/adminSettings';
import { useCanEditSettings } from './settingsEditContext';

type NumberField = {
  [K in keyof SettingsFormValues]: SettingsFormValues[K] extends number ? K : never;
}[keyof SettingsFormValues];

const INPUT =
  'w-full text-center lg:h-[calc(32*var(--u))] lg:min-h-0 lg:rounded-[calc(10*var(--u))] ' +
  'lg:px-[calc(8*var(--u))] lg:text-[calc(13*var(--u))]';

/** A compact number box with an optional unit label, wired to one numeric settings field. */
export function SettingsNumberControl({
  name,
  label,
  min,
  max,
  suffix,
  disabled
}: {
  name: NumberField;
  label: string;
  min: number;
  max: number;
  suffix?: string;
  disabled?: boolean;
}) {
  const {
    register,
    formState: { errors }
  } = useFormContext<SettingsFormValues>();
  const canEdit = useCanEditSettings();
  const errorId = useId();
  const message = errors[name]?.message;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 lg:gap-[calc(10*var(--u))]">
        <div className="w-24 shrink-0 lg:w-[calc(88*var(--u))]">
          <Input
            {...register(name, { valueAsNumber: true })}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            aria-label={label}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : undefined}
            disabled={!canEdit || disabled}
            className={INPUT}
          />
        </div>
        {suffix && (
          <span aria-hidden className="text-sm text-[#667085] lg:text-[calc(13*var(--u))]">
            {suffix}
          </span>
        )}
      </div>
      {message && (
        <p
          id={errorId}
          role="alert"
          className="max-w-40 text-right text-xs text-danger-600 lg:text-[calc(12*var(--u))]"
        >
          {message}
        </p>
      )}
    </div>
  );
}
