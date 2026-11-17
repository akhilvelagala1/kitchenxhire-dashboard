import { Controller, useFormContext } from 'react-hook-form';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import { SETTINGS_TIMEZONES, type SettingsFormValues } from '../schemas/adminSettings';
import { SettingsCard } from './SettingsCard';
import { useCanEditSettings } from './settingsEditContext';
import { SettingsLogoUploader } from './SettingsLogoUploader';
import { SettingsPhoneInput } from './SettingsPhoneInput';

/** From lg up the shared Input/Select shrink to 36 design px tall with a 9 design px radius; read-only looks greyed. */
const CONTROL =
  'disabled:cursor-not-allowed disabled:bg-muted disabled:text-[#667085] ' +
  'lg:h-[calc(36*var(--u))] lg:min-h-0 lg:rounded-[calc(9*var(--u))]';

/** Field labels are 13 design px / 600 and error lines 12.5 from lg up; Field draws both, so the grid restyles them. */
const FIELD_GRID =
  'mt-4 grid grid-cols-1 gap-4 [&_label]:font-semibold ' +
  'lg:mt-[calc(16*var(--u))] lg:grid-cols-2 lg:gap-x-[calc(16*var(--u))] lg:gap-y-[calc(14*var(--u))] ' +
  'lg:[&_label]:text-[calc(13*var(--u))] lg:[&_p]:text-[calc(12.5*var(--u))]';

/**
 * Top-left card of Settings, General tab: the logo with its upload button, then the platform name,
 * support phone, support email and timezone. Reads the page's form and edit permission from context.
 */
export function SettingsPlatformInfoCard({ logoUrl }: { logoUrl: string | null }) {
  const canEdit = useCanEditSettings();
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext<SettingsFormValues>();

  return (
    <SettingsCard
      title="Platform Information"
      description="Basic details and branding for your hiring platform."
      className="h-full min-h-0"
    >
      <SettingsLogoUploader logoUrl={logoUrl} />
      <div className={FIELD_GRID}>
        <Field label="Platform Name" required error={errors.platform_name?.message}>
          <Input
            {...register('platform_name')}
            disabled={!canEdit}
            aria-required
            autoComplete="off"
            className={CONTROL}
          />
        </Field>
        <Controller
          control={control}
          name="support_phone"
          render={({ field, fieldState }) => (
            <Field label="Support Phone" error={fieldState.error?.message}>
              <SettingsPhoneInput
                ref={field.ref}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={!canEdit}
                className={CONTROL}
              />
            </Field>
          )}
        />
        <Field label="Support Email" required error={errors.support_email?.message}>
          <Input
            {...register('support_email')}
            type="email"
            disabled={!canEdit}
            aria-required
            autoComplete="off"
            className={CONTROL}
          />
        </Field>
        <Field label="Timezone" error={errors.timezone?.message}>
          <Select
            {...register('timezone')}
            disabled={!canEdit}
            className={`${CONTROL} truncate lg:text-[calc(13*var(--u))]`}
          >
            {SETTINGS_TIMEZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </SettingsCard>
  );
}
