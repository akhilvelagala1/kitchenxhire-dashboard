import { useId } from 'react';
import { CloudUpload, Database, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Select } from '@/shared/ui/Input';
import { SETTINGS_RETENTION_MONTHS, type SettingsFormValues } from '../schemas/adminSettings';
import { SettingsCard } from './SettingsCard';
import { useCanEditSettings } from './settingsEditContext';
import { SettingsRow } from './SettingsRow';
import { SettingsToggleRow } from './SettingsToggleRow';

/** From lg up the three rows split the card body evenly, as in the picture. Below lg each is as tall as its text. */
const ROW_CLASS = 'lg:flex-1';

/**
 * System & Data: how long records are kept, whether reports and data can be exported, and whether
 * inactive jobs and users are archived on their own. Reads and writes the page's settings form.
 */
export function SettingsSystemCard() {
  const {
    register,
    formState: { errors }
  } = useFormContext<SettingsFormValues>();
  const canEdit = useCanEditSettings();
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const error = errors.data_retention_months?.message;

  return (
    <SettingsCard
      title="System & Data"
      description="Data management and platform maintenance."
      className="h-full min-h-0"
    >
      <SettingsRow
        icon={Database}
        tone="blue"
        title="Data Retention"
        description="Keep application and user data for"
        descriptionId={descriptionId}
        className={ROW_CLASS}
      >
        <div className="flex w-32 flex-col gap-1 lg:w-[calc(120*var(--u))] lg:gap-[calc(4*var(--u))]">
          <Select
            {...register('data_retention_months', { valueAsNumber: true })}
            aria-label="Data retention period"
            aria-describedby={error ? `${errorId} ${descriptionId}` : descriptionId}
            aria-invalid={Boolean(error)}
            disabled={!canEdit}
            className="disabled:cursor-not-allowed lg:h-[calc(36*var(--u))] lg:min-h-0 lg:rounded-[calc(9*var(--u))] lg:border-[#E5E8EF] lg:px-[calc(12*var(--u))] lg:text-[calc(14*var(--u))]"
          >
            {SETTINGS_RETENTION_MONTHS.map((months) => (
              <option key={months} value={months}>
                {`${months} months`}
              </option>
            ))}
          </Select>
          {error && (
            <p
              id={errorId}
              role="alert"
              className="text-right text-xs text-danger-600 lg:text-[calc(12.5*var(--u))]"
            >
              {error}
            </p>
          )}
        </div>
      </SettingsRow>
      <SettingsToggleRow
        name="allow_data_export"
        icon={CloudUpload}
        tone="green"
        title="Allow Data Export"
        description="Enable export of reports and platform data (CSV, Excel)"
        className={ROW_CLASS}
      />
      <SettingsToggleRow
        name="archive_inactive_records"
        icon={Trash2}
        tone="pink"
        title="Archive Inactive Records"
        description="Automatically archive inactive jobs and users"
        className={ROW_CLASS}
      />
    </SettingsCard>
  );
}
