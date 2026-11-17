import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input, Textarea } from '@/shared/ui/Input';
import {
  SETTINGS_PLATFORM_ROLES,
  settingsRoleFormSchema,
  type SettingsManagedRole,
  type SettingsRoleFormValues
} from '../schemas/adminSettingsUsersRoles';
import { newDraftRoleId } from './useUsersRolesSettings';
import { useUsersRolesSettingsDraft } from './usersRolesSettingsContext';

const EMPTY: SettingsRoleFormValues = { name: '', description: '' };
const PLATFORM = new Set<string>(SETTINGS_PLATFORM_ROLES);

function Body({
  existing,
  existingNames,
  onClose
}: {
  existing: SettingsManagedRole | undefined;
  existingNames: readonly string[];
  onClose: () => void;
}) {
  const { upsertRole } = useUsersRolesSettingsDraft();
  const defaults: SettingsRoleFormValues = existing
    ? { name: existing.name, description: existing.description }
    : EMPTY;

  const { register, handleSubmit, setError, formState } = useForm<SettingsRoleFormValues>({
    resolver: zodResolver(settingsRoleFormSchema),
    defaultValues: defaults
  });
  const errors = formState.errors;
  const lockedName = Boolean(existing?.is_system);

  const submit = handleSubmit((values) => {
    const name = values.name.trim();
    const taken = existingNames.some(
      (other) => other.toLowerCase() === name.toLowerCase() && other !== existing?.name
    );
    if (taken) {
      setError('name', { message: 'A role with this name already exists' });
      return;
    }
    const next: SettingsManagedRole = {
      id: existing?.id ?? newDraftRoleId(),
      name,
      description: values.description.trim(),
      is_system: existing?.is_system ?? PLATFORM.has(name)
    };
    upsertRole(next);
    onClose();
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4" aria-label="Role details">
      <Field
        label="Role name"
        required
        error={errors.name?.message}
        hint={lockedName ? 'System role names cannot be changed.' : undefined}
      >
        <Input {...register('name')} readOnly={lockedName} autoComplete="off" />
      </Field>
      <Field label="Description" required error={errors.description?.message}>
        <Textarea rows={3} {...register('description')} />
      </Field>
      {lockedName && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <Lock className="size-4 shrink-0" aria-hidden />
          Protected system role. It cannot be deleted.
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{existing ? 'Save role' : 'Create role'}</Button>
      </div>
    </form>
  );
}

/** Add or edit a Users & Roles Settings role in the local draft. */
export function SettingsRoleFormDialog({
  open,
  role,
  existingNames,
  onClose
}: {
  open: boolean;
  role?: SettingsManagedRole;
  existingNames: readonly string[];
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={role ? 'Edit Role' : 'Create Role'}>
      {open ? <Body existing={role} existingNames={existingNames} onClose={onClose} /> : null}
    </Dialog>
  );
}
