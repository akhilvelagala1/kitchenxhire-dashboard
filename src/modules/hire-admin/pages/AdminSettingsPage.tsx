import { FormProvider } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { ErrorState } from '@/shared/components/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader';
import { cn } from '@/shared/lib/cn';
import { SettingsAuditLogsPanel } from '../components/SettingsAuditLogsPanel';
import { SettingsEditProvider } from '../components/settingsEditContext';
import { SettingsHeaderActions } from '../components/SettingsHeaderActions';
import { SettingsHiringCard } from '../components/SettingsHiringCard';
import { SettingsHiringJobsPanel } from '../components/SettingsHiringJobsPanel';
import { SettingsIntegrationsPanel } from '../components/SettingsIntegrationsPanel';
import { SettingsNotificationsPanel } from '../components/SettingsNotificationsPanel';
import { SettingsPlatformInfoCard } from '../components/SettingsPlatformInfoCard';
import { SettingsPreferencesCard } from '../components/SettingsPreferencesCard';
import { SettingsSecurityPanel } from '../components/SettingsSecurityPanel';
import { SettingsSkeleton } from '../components/SettingsSkeleton';
import { SettingsSystemCard } from '../components/SettingsSystemCard';
import { SettingsTabs } from '../components/SettingsTabs';
import { SettingsUsersRolesPanel } from '../components/SettingsUsersRolesPanel';
import { IntegrationsSettingsProvider } from '../components/integrationsSettingsContext';
import { NotificationsSettingsProvider } from '../components/notificationsSettingsContext';
import { SecuritySettingsProvider } from '../components/securitySettingsContext';
import { parseSettingsSearchParams } from '../components/settingsPageParams';
import {
  AUDIT_CARDS,
  GENERAL_CARDS,
  HIRING_CARDS,
  INTEGRATIONS_CARDS,
  NOTIFICATIONS_CARDS,
  SECURITY_CARDS,
  USERS_CARDS
} from '../components/settingsTabCards';
import {
  isDenseTab,
  settingsGridColsClass,
  settingsGridRowsClass,
  settingsScaleClass,
  type SettingsTabKey,
  type TabState
} from '../components/settingsTabLayout';
import { useIntegrationsSettings } from '../components/useIntegrationsSettings';
import { useNotificationsSettings } from '../components/useNotificationsSettings';
import { useSecuritySettings } from '../components/useSecuritySettings';
import { useSettingsForm } from '../components/useSettingsForm';
import { useUsersRolesSettings } from '../components/useUsersRolesSettings';
import { UsersRolesSettingsProvider } from '../components/usersRolesSettingsContext';

/**
 * Below lg the cards stack and the page scrolls. From lg up it fills the shell (`fit` + fit-scale).
 * General keeps the original four cards and scale. Hiring, Users, Notifications, Integrations, and
 * Security use denser scales so every card on that tab sits on one screen without scrolling.
 */
export function AdminSettingsPage() {
  const [searchParams] = useSearchParams();
  const { tab } = parseSettingsSearchParams(searchParams);
  const generalForm = useSettingsForm();
  const usersRoles = useUsersRolesSettings();
  const notificationsSettings = useNotificationsSettings();
  const integrationsSettings = useIntegrationsSettings();
  const securitySettings = useSecuritySettings();

  /** Hiring & Jobs has no entry: it shares the General settings object and its Reset/Save Changes. */
  const states: Record<Exclude<SettingsTabKey, 'hiring'>, TabState> = {
    general: {
      cardNames: tab === 'hiring' ? HIRING_CARDS : GENERAL_CARDS,
      ready: Boolean(generalForm.settings),
      loading: generalForm.isLoading,
      error: generalForm.error,
      refetch: generalForm.refetch,
      canEdit: generalForm.canEdit,
      isDirty: generalForm.isDirty,
      isSaving: generalForm.isSaving,
      save: generalForm.save,
      reset: generalForm.reset,
      showActions: Boolean(generalForm.settings)
    },
    users: {
      cardNames: USERS_CARDS,
      ready: Boolean(usersRoles.draft && usersRoles.actions),
      loading: usersRoles.isLoading,
      error: usersRoles.error,
      refetch: usersRoles.refetch,
      canEdit: usersRoles.canEdit,
      isDirty: usersRoles.isDirty,
      isSaving: usersRoles.isSaving,
      save: usersRoles.save,
      reset: usersRoles.reset,
      showActions: Boolean(usersRoles.draft)
    },
    notifications: {
      cardNames: NOTIFICATIONS_CARDS,
      ready: Boolean(notificationsSettings.draft && notificationsSettings.actions),
      loading: notificationsSettings.isLoading,
      error: notificationsSettings.error,
      refetch: notificationsSettings.refetch,
      canEdit: notificationsSettings.canEdit,
      isDirty: notificationsSettings.isDirty,
      isSaving: notificationsSettings.isSaving,
      save: notificationsSettings.save,
      reset: notificationsSettings.reset,
      showActions: Boolean(notificationsSettings.draft)
    },
    integrations: {
      cardNames: INTEGRATIONS_CARDS,
      ready: Boolean(integrationsSettings.draft && integrationsSettings.actions),
      loading: integrationsSettings.isLoading,
      error: integrationsSettings.error,
      refetch: integrationsSettings.refetch,
      canEdit: integrationsSettings.canEdit,
      isDirty: integrationsSettings.isDirty,
      isSaving: integrationsSettings.isSaving,
      save: integrationsSettings.save,
      reset: integrationsSettings.reset,
      showActions: Boolean(integrationsSettings.draft)
    },
    security: {
      cardNames: SECURITY_CARDS,
      ready: Boolean(securitySettings.draft && securitySettings.actions),
      loading: securitySettings.isLoading,
      error: securitySettings.error,
      refetch: securitySettings.refetch,
      canEdit: securitySettings.canEdit,
      isDirty: securitySettings.isDirty,
      isSaving: securitySettings.isSaving,
      save: securitySettings.save,
      reset: securitySettings.reset,
      showActions: Boolean(securitySettings.draft)
    },
    audit: {
      cardNames: AUDIT_CARDS,
      ready: true,
      loading: false,
      error: undefined,
      refetch: () => {},
      canEdit: false,
      isDirty: false,
      isSaving: false,
      save: () => {},
      reset: () => {},
      showActions: false
    }
  };
  const {
    cardNames,
    ready,
    loading,
    error,
    refetch,
    canEdit,
    isDirty,
    isSaving,
    save,
    reset,
    showActions
  } = tab === 'hiring' ? states.general : states[tab];

  const denseTab = isDenseTab(tab);

  return (
    <div
      className={cn(
        'fit-scale flex min-h-0 flex-1 flex-col',
        settingsScaleClass(tab),
        denseTab
          ? 'lg:pt-[calc(16*var(--u))] lg:pr-[calc(16*var(--u))] lg:pb-[calc(28*var(--u))] lg:pl-[calc(18*var(--u))]'
          : 'lg:pt-[calc(24*var(--u))] lg:pr-[calc(22*var(--u))] lg:pb-[calc(24*var(--u))] lg:pl-[calc(25*var(--u))]'
      )}
    >
      <div
        className={cn(
          'mx-auto grid w-full flex-1 grid-cols-[minmax(0,1fr)] lg:max-w-[calc(1760*var(--u))]',
          settingsGridColsClass(tab),
          denseTab
            ? [
                'gap-4 content-start lg:min-h-0 lg:content-start',
                'lg:gap-x-[calc(18*var(--u))] lg:gap-y-[calc(14*var(--u))]',
                settingsGridRowsClass(tab)
              ].join(' ')
            : [
                'gap-4 content-start',
                'lg:gap-x-[calc(21*var(--u))] lg:gap-y-[calc(21*var(--u))]',
                'xl:grid-rows-[auto_auto_calc(334*var(--u))_calc(289*var(--u))]'
              ].join(' ')
        )}
      >
        <PageHeader
          flush
          className="lg:col-span-2 lg:items-center"
          titleClassName={
            denseTab
              ? 'lg:font-bold lg:text-[#111827] lg:text-[calc(26*var(--u))] lg:leading-[calc(32*var(--u))]'
              : 'lg:font-bold lg:text-[#17191F] lg:text-[calc(23*var(--u))] lg:leading-[calc(30*var(--u))]'
          }
          descriptionClassName={
            denseTab
              ? 'lg:mt-[calc(2*var(--u))] lg:text-[#586987] lg:text-[calc(15*var(--u))]'
              : 'lg:mt-[calc(3*var(--u))] lg:text-[#667085] lg:text-[calc(13*var(--u))]'
          }
          title="Settings"
          description="Platform configuration for KitchenX Hiring."
          actions={
            showActions ? (
              <SettingsHeaderActions
                isDirty={isDirty}
                isSaving={isSaving}
                onSave={save}
                onReset={reset}
              />
            ) : undefined
          }
        />
        <div
          className={cn(
            'lg:col-span-2',
            denseTab ? 'lg:mt-[calc(10*var(--u))]' : 'lg:-mt-[calc(5*var(--u))]'
          )}
        >
          <SettingsTabs />
        </div>
        {ready ? (
          <SettingsEditProvider value={canEdit}>
            {tab === 'notifications' && notificationsSettings.actions ? (
              <NotificationsSettingsProvider value={notificationsSettings.actions}>
                <SettingsNotificationsPanel />
              </NotificationsSettingsProvider>
            ) : tab === 'users' && usersRoles.actions ? (
              <UsersRolesSettingsProvider value={usersRoles.actions}>
                <SettingsUsersRolesPanel />
              </UsersRolesSettingsProvider>
            ) : tab === 'integrations' && integrationsSettings.actions ? (
              <IntegrationsSettingsProvider value={integrationsSettings.actions}>
                <SettingsIntegrationsPanel />
              </IntegrationsSettingsProvider>
            ) : tab === 'security' && securitySettings.actions ? (
              <SecuritySettingsProvider value={securitySettings.actions}>
                <SettingsSecurityPanel />
              </SecuritySettingsProvider>
            ) : tab === 'audit' ? (
              <SettingsAuditLogsPanel />
            ) : (
              <FormProvider {...generalForm.form}>
                {tab === 'hiring' ? (
                  <SettingsHiringJobsPanel />
                ) : (
                  <>
                    <SettingsPlatformInfoCard logoUrl={generalForm.settings!.logo_url} />
                    <SettingsPreferencesCard />
                    <SettingsHiringCard />
                    <SettingsSystemCard />
                  </>
                )}
              </FormProvider>
            )}
          </SettingsEditProvider>
        ) : loading ? (
          <SettingsSkeleton names={cardNames} />
        ) : (
          <div className="lg:col-span-2">
            <ErrorState error={error} onRetry={refetch} />
          </div>
        )}
      </div>
    </div>
  );
}
