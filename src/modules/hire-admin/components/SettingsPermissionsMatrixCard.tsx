import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Crown,
  FileText,
  Shield,
  UserRound,
  Users
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  SETTINGS_PERMISSION_KEYS,
  SETTINGS_PERMISSION_LABELS,
  SETTINGS_PLATFORM_ROLES,
  type SettingsPermissionKey,
  type SettingsPlatformRole
} from '../schemas/adminSettingsUsersRoles';
import { SettingsCard } from './SettingsCard';
import { USERS_ROLES_CARD_CLASS } from './settingsUsersRolesDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useUsersRolesSettingsDraft } from './usersRolesSettingsContext';

const ROLE_HEADER: Record<SettingsPlatformRole, { icon: LucideIcon; tone: string }> = {
  Admin: { icon: Crown, tone: 'bg-[#FFF4D6] text-[#F59E0B]' },
  Recruiter: { icon: Users, tone: 'bg-[#DCEBFF] text-[#1768E8]' },
  User: { icon: UserRound, tone: 'bg-[#E8EBF0] text-[#657184]' }
};

const PERMISSION_ICON: Record<SettingsPermissionKey, LucideIcon> = {
  manage_users: Users,
  manage_roles: Shield,
  create_manage_jobs: Briefcase,
  view_own_applications: FileText,
  schedule_interviews: CalendarDays,
  view_platform_reports: BarChart3
};

const GRID_COLS =
  'grid grid-cols-[minmax(0,1.55fr)_repeat(3,minmax(0,0.7fr))] [&>*]:border-r [&>*]:border-[#E8ECF2] [&>*:last-child]:border-r-0';

/** Bottom-left card: lined permission grid with role icons and row icons. */
export function SettingsPermissionsMatrixCard() {
  const canEdit = useCanEditSettings();
  const { draft, setPermission } = useUsersRolesSettingsDraft();

  return (
    <SettingsCard
      title="Permissions Matrix"
      description="Control what each role can access."
      className={USERS_ROLES_CARD_CLASS}
    >
      <div
        role="grid"
        aria-label="Role permissions"
        className="overflow-hidden rounded-xl border border-[#E4E8F0] lg:rounded-[calc(12*var(--u))]"
      >
        <div
          role="row"
          className={cn(
            GRID_COLS,
            'h-auto min-h-[48px] items-center border-b border-[#E4E8F0] bg-[#F8F9FC] lg:h-[calc(54*var(--u))] lg:min-h-0'
          )}
        >
          <span
            role="columnheader"
            className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#586987] uppercase lg:px-[calc(12*var(--u))] lg:py-0 lg:text-[calc(11*var(--u))]"
          >
            Permission
          </span>
          {SETTINGS_PLATFORM_ROLES.map((role) => {
            const meta = ROLE_HEADER[role];
            const Icon = meta.icon;
            return (
              <span
                key={role}
                role="columnheader"
                className="flex flex-col items-center justify-center gap-1 px-1 py-1.5 lg:gap-[calc(4*var(--u))] lg:py-0"
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex size-8 items-center justify-center rounded-lg lg:size-[calc(28*var(--u))] lg:rounded-[calc(8*var(--u))]',
                    meta.tone
                  )}
                >
                  <Icon className="size-4 lg:size-[calc(14*var(--u))]" strokeWidth={1.75} />
                </span>
                <span className="text-[11px] font-semibold text-[#586987] lg:text-[calc(11*var(--u))]">
                  {role}
                </span>
              </span>
            );
          })}
        </div>
        <div className="flex min-h-0 flex-col">
          {SETTINGS_PERMISSION_KEYS.map((key) => {
            const RowIcon = PERMISSION_ICON[key];
            return (
              <div
                key={key}
                role="row"
                className={cn(
                  GRID_COLS,
                  'h-auto min-h-[34px] items-center border-b border-[#E8ECF2] last:border-b-0 lg:h-[calc(34*var(--u))] lg:min-h-0'
                )}
              >
                <span
                  role="rowheader"
                  className="flex min-w-0 items-center gap-2 px-2.5 py-1 text-sm font-medium text-[#111827] lg:gap-[calc(8*var(--u))] lg:px-[calc(12*var(--u))] lg:py-0 lg:text-[calc(12.5*var(--u))]"
                >
                  <RowIcon
                    className="size-4 shrink-0 text-[#586987] lg:size-[calc(15*var(--u))]"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="truncate">{SETTINGS_PERMISSION_LABELS[key]}</span>
                </span>
                {SETTINGS_PLATFORM_ROLES.map((role) => {
                  const checked = draft.permissions[key][role];
                  const label = `${SETTINGS_PERMISSION_LABELS[key]} for ${role}`;
                  return (
                    <label
                      key={role}
                      role="gridcell"
                      className="inline-flex h-full cursor-pointer items-center justify-center has-disabled:cursor-not-allowed"
                    >
                      <input
                        type="checkbox"
                        aria-label={label}
                        checked={checked}
                        disabled={!canEdit}
                        onChange={(event) => setPermission(key, role, event.target.checked)}
                        className="size-5 accent-brand-600 lg:size-[calc(20*var(--u))]"
                      />
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </SettingsCard>
  );
}
