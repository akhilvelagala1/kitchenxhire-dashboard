import { Video } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { cn } from '@/shared/lib/cn';
import type { SettingsFormValues, SettingsSwitchField } from '../schemas/adminSettings';
import { useCanEditSettings } from './settingsEditContext';
import { SettingsRow } from './SettingsRow';

const OPTIONS: { name: SettingsSwitchField; label: string }[] = [
  { name: 'interview_type_online', label: 'Online (Video)' },
  { name: 'interview_type_phone', label: 'Phone' },
  { name: 'interview_type_in_person', label: 'In-person' }
];

/**
 * Interview Types: three checkboxes under one row. When Interview Scheduling is off, the boxes
 * stay visible but cannot be changed (the product rule from the Hiring & Jobs reference).
 */
export function SettingsInterviewTypesRow() {
  const { control } = useFormContext<SettingsFormValues>();
  const canEdit = useCanEditSettings();
  const schedulingOn = useWatch({ control, name: 'interview_scheduling' });
  const locked = !canEdit || !schedulingOn;

  return (
    <SettingsRow
      icon={Video}
      tone="blue"
      title="Interview Types"
      description="Select allowed interview modes"
      className="items-start py-3 lg:min-h-0! lg:flex-[1.35] lg:items-center lg:py-0"
    >
      <div
        role="group"
        aria-label="Interview types"
        className={cn(
          'flex flex-wrap items-center justify-end gap-x-4 gap-y-2 lg:gap-x-[calc(16*var(--u))]',
          locked && 'opacity-60'
        )}
      >
        {OPTIONS.map(({ name, label }) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <label className="inline-flex items-center gap-2 text-sm font-medium text-[#111827] lg:text-[calc(13*var(--u))]">
                <input
                  type="checkbox"
                  checked={field.value}
                  disabled={locked}
                  aria-label={label}
                  onChange={(event) => field.onChange(event.target.checked)}
                  className="size-5 rounded border-2 border-[#71809b] accent-brand-600 lg:size-[calc(20*var(--u))]"
                />
                {label}
              </label>
            )}
          />
        ))}
      </div>
    </SettingsRow>
  );
}
