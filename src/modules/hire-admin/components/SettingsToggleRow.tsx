import { useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Switch } from '@/shared/ui/Switch';
import type { SettingsFormValues, SettingsSwitchField } from '../schemas/adminSettings';
import { useCanEditSettings } from './settingsEditContext';
import { SettingsRow, type SettingsRowProps } from './SettingsRow';

interface SettingsToggleRowProps extends Pick<
  SettingsRowProps,
  'icon' | 'tone' | 'title' | 'description' | 'className'
> {
  /** Which on/off field of the settings form this row flips. */
  name: SettingsSwitchField;
  /** Extra lock, for example when a parent switch is off. */
  disabled?: boolean;
}

/** A Settings row whose control is a switch wired to the page's form. Read-only without hire.admin.manage. */
export function SettingsToggleRow({ name, disabled, ...row }: SettingsToggleRowProps) {
  const { control } = useFormContext<SettingsFormValues>();
  const canEdit = useCanEditSettings();
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <SettingsRow {...row} titleId={titleId} descriptionId={descriptionId}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={!canEdit || disabled}
            aria-labelledby={titleId}
            aria-describedby={row.description ? descriptionId : undefined}
          />
        )}
      />
    </SettingsRow>
  );
}
