import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Input, Select } from '@/shared/ui/Input';
import {
  SETTINGS_USER_STATUSES,
  initialsFromName,
  settingsUserFormSchema,
  type SettingsManagedUser,
  type SettingsUserFormValues
} from '../schemas/adminSettingsUsersRoles';
import { newDraftUserId } from './useUsersRolesSettings';
import { useUsersRolesSettingsDraft } from './usersRolesSettingsContext';

const EMPTY: SettingsUserFormValues = {
  name: '',
  email: '',
  role: '',
  status: 'active'
};

function Body({
  existing,
  roleNames,
  onClose
}: {
  existing: SettingsManagedUser | undefined;
  roleNames: readonly string[];
  onClose: () => void;
}) {
  const { upsertUser } = useUsersRolesSettingsDraft();
  const defaults: SettingsUserFormValues = existing
    ? {
        name: existing.name,
        email: existing.email,
        role: existing.role,
        status: existing.status
      }
    : { ...EMPTY, role: roleNames[0] ?? '' };

  const { register, handleSubmit, formState } = useForm<SettingsUserFormValues>({
    resolver: zodResolver(settingsUserFormSchema),
    defaultValues: defaults
  });
  const errors = formState.errors;

  const submit = handleSubmit((values) => {
    const next: SettingsManagedUser = {
      id: existing?.id ?? newDraftUserId(),
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      status: values.status,
      last_login: existing?.last_login ?? 'Just now',
      avatar_initials: existing?.avatar_initials ?? initialsFromName(values.name)
    };
    upsertUser(next);
    onClose();
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4" aria-label="User details">
      <Field label="Full name" required error={errors.name?.message}>
        <Input {...register('name')} autoComplete="name" />
      </Field>
      <Field label="E-mail" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Role" required error={errors.role?.message}>
          <Select {...register('role')}>
            {roleNames.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" required error={errors.status?.message}>
          <Select {...register('status')}>
            {SETTINGS_USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === 'active' ? 'Active' : 'Inactive'}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{existing ? 'Save user' : 'Add user'}</Button>
      </div>
    </form>
  );
}

/** Add or edit a Users & Roles Settings user in the local draft. */
export function SettingsUserFormDialog({
  open,
  user,
  roleNames,
  onClose
}: {
  open: boolean;
  user?: SettingsManagedUser;
  roleNames: readonly string[];
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={user ? 'Edit User' : 'Add User'}>
      {open ? <Body existing={user} roleNames={roleNames} onClose={onClose} /> : null}
    </Dialog>
  );
}
