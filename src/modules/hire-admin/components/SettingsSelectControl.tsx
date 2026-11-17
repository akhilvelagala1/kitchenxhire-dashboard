import { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { Select } from '@/shared/ui/Input';
import type { SettingsFormValues } from '../schemas/adminSettings';
import { useCanEditSettings } from './settingsEditContext';

type StringField = {
  [K in keyof SettingsFormValues]: SettingsFormValues[K] extends string ? K : never;
}[keyof SettingsFormValues];

const SELECT =
  'lg:h-[calc(32*var(--u))] lg:min-h-0 lg:w-[calc(150*var(--u))] lg:rounded-[calc(10*var(--u))] ' +
  'lg:px-[calc(10*var(--u))] lg:text-[calc(12.5*var(--u))]';

/** A compact select wired to one string settings field. */
export function SettingsSelectControl({
  name,
  label,
  options,
  wide,
  disabled
}: {
  name: StringField;
  label: string;
  options: readonly string[];
  /** Wider box for long option labels (for example job visibility). */
  wide?: boolean;
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
      <Select
        {...register(name)}
        aria-label={label}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
        disabled={!canEdit || disabled}
        className={`${SELECT}${wide ? ' lg:w-[calc(170*var(--u))]' : ''}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
      {message && (
        <p
          id={errorId}
          role="alert"
          className="max-w-48 text-right text-xs text-danger-600 lg:text-[calc(12*var(--u))]"
        >
          {message}
        </p>
      )}
    </div>
  );
}
