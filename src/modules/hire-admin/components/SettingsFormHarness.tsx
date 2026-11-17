import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import {
  settingsFormSchema,
  toFormValues,
  type SettingsFormValues
} from '../schemas/adminSettings';
import { SettingsEditProvider } from './settingsEditContext';
import { SETTINGS_FIXTURE } from './settingsFixture';

/** Puts one Settings card inside the same kind of form the page builds. For tests. */
export function SettingsFormHarness({
  values,
  canEdit = true,
  children
}: {
  values?: Partial<SettingsFormValues>;
  canEdit?: boolean;
  children: ReactNode;
}) {
  const form = useForm<SettingsFormValues>({
    defaultValues: { ...toFormValues(SETTINGS_FIXTURE), ...values },
    resolver: zodResolver(settingsFormSchema),
    mode: 'onChange'
  });
  return (
    <SettingsEditProvider value={canEdit}>
      <FormProvider {...form}>{children}</FormProvider>
    </SettingsEditProvider>
  );
}
