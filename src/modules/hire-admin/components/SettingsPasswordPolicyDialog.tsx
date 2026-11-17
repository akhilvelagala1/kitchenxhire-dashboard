import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import {
  settingsPasswordPolicyFormSchema,
  type SettingsPasswordPolicyFormValues
} from '../schemas/adminSettingsSecurity';
import { useSecuritySettingsDraft } from './securitySettingsContext';

function Body({ onClose }: { onClose: () => void }) {
  const { draft, setPasswordPolicy } = useSecuritySettingsDraft();
  const { register, handleSubmit, control, formState } = useForm<SettingsPasswordPolicyFormValues>({
    resolver: zodResolver(settingsPasswordPolicyFormSchema),
    defaultValues: draft.password_policy
  });
  const errors = formState.errors;

  const submit = handleSubmit((values) => {
    setPasswordPolicy(values);
    onClose();
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Minimum length" error={errors.min_length?.message}>
          <Input
            type="number"
            inputMode="numeric"
            aria-invalid={Boolean(errors.min_length)}
            {...register('min_length', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Expires after (days, 0 = never)" error={errors.expiry_days?.message}>
          <Input
            type="number"
            inputMode="numeric"
            aria-invalid={Boolean(errors.expiry_days)}
            {...register('expiry_days', { valueAsNumber: true })}
          />
        </Field>
      </div>
      <Field label="Block reuse of the last N passwords" error={errors.reuse_count?.message}>
        <Input
          type="number"
          inputMode="numeric"
          aria-invalid={Boolean(errors.reuse_count)}
          {...register('reuse_count', { valueAsNumber: true })}
        />
      </Field>
      <div className="flex flex-col gap-3">
        {(
          [
            ['require_uppercase', 'Require an uppercase letter'],
            ['require_number', 'Require a number'],
            ['require_symbol', 'Require a symbol']
          ] as const
        ).map(([key, label]) => (
          <Controller
            key={key}
            name={key}
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">{label}</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} aria-label={label} />
              </div>
            )}
          />
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Check className="size-4" aria-hidden />
          Save
        </Button>
      </div>
    </form>
  );
}

/** Configure dialog for the Password Policy row; Save updates the Security Settings draft only. */
export function SettingsPasswordPolicyDialog({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Password Policy">
      {open ? <Body onClose={onClose} /> : null}
    </Dialog>
  );
}
