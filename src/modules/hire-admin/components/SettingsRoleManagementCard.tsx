import { useMemo, useState } from 'react';
import { Crown, Pencil, Plus, Trash2, UserRound, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { countUsersByRole, type SettingsManagedRole } from '../schemas/adminSettingsUsersRoles';
import { SettingsCard } from './SettingsCard';
import { SettingsRoleFormDialog } from './SettingsRoleFormDialog';
import {
  USERS_ROLES_BTN,
  USERS_ROLES_CARD_CLASS,
  USERS_ROLES_COUNT_BADGE,
  USERS_ROLES_ICON_BTN
} from './settingsUsersRolesDensity';
import { useCanEditSettings } from './settingsEditContext';
import { useUsersRolesSettingsDraft } from './usersRolesSettingsContext';

/** Strong pastel tiles matching the annotated Role Management reference. */
const ROLE_ICON: Record<string, { icon: LucideIcon; tone: string }> = {
  Admin: { icon: Crown, tone: 'bg-[#FFF4D6] text-[#F59E0B]' },
  Recruiter: { icon: Users, tone: 'bg-[#DCEBFF] text-[#1768E8]' },
  User: { icon: UserRound, tone: 'bg-[#E8EBF0] text-[#657184]' }
};

/** Top-right Users & Roles card: divider list with logos, count badge, and edit/delete. */
export function SettingsRoleManagementCard() {
  const canEdit = useCanEditSettings();
  const { draft, removeRole } = useUsersRolesSettingsDraft();
  const [editing, setEditing] = useState<SettingsManagedRole | undefined>();
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<SettingsManagedRole | undefined>();

  const counts = useMemo(() => countUsersByRole(draft.users), [draft.users]);
  const names = draft.roles.map((role) => role.name);

  return (
    <SettingsCard
      title="Role Management"
      description="Define roles and their responsibilities."
      className={cn(USERS_ROLES_CARD_CLASS, 'overflow-visible')}
      action={
        canEdit ? (
          <Button
            className={USERS_ROLES_BTN}
            onClick={() => {
              setEditing(undefined);
              setAdding(true);
            }}
          >
            <Plus className="size-4 lg:size-[calc(16*var(--u))]" aria-hidden />
            Create Role
          </Button>
        ) : undefined
      }
    >
      <ul className="flex min-w-0 flex-col divide-y divide-[#E4E8F0]">
        {draft.roles.map((role) => {
          const meta = ROLE_ICON[role.name] ?? {
            icon: UserRound,
            tone: 'bg-[#FFF0E8] text-[#C2410C]'
          };
          const Icon = meta.icon;
          const count = counts[role.name] ?? 0;
          return (
            <li
              key={role.id}
              className="flex min-h-[56px] min-w-0 items-center gap-2.5 py-2.5 first:pt-0 last:pb-0 lg:h-[calc(65*var(--u))] lg:min-h-0 lg:gap-[calc(12*var(--u))] lg:py-0"
            >
              <span
                aria-hidden
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl lg:size-[calc(50*var(--u))] lg:rounded-[calc(12*var(--u))]',
                  meta.tone
                )}
              >
                <Icon className="size-5 lg:size-[calc(22*var(--u))]" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-[15px] font-semibold text-[#111827] lg:text-[calc(15*var(--u))]">
                  {role.name}
                </p>
                <p className="truncate text-[13px] text-[#586987] lg:text-[calc(12.5*var(--u))]">
                  {role.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 lg:gap-[calc(8*var(--u))]">
                <span
                  className={USERS_ROLES_COUNT_BADGE}
                  aria-label={`${count} users with role ${role.name}`}
                >
                  <UserRound strokeWidth={2} aria-hidden />
                  {count} {count === 1 ? 'User' : 'Users'}
                </span>
                <button
                  type="button"
                  aria-label={`Edit ${role.name}`}
                  disabled={!canEdit}
                  className={USERS_ROLES_ICON_BTN}
                  onClick={() => {
                    setAdding(false);
                    setEditing(role);
                  }}
                >
                  <Pencil className="size-4.5 text-[#1768E8]" strokeWidth={2.25} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${role.name}`}
                  disabled={!canEdit || role.is_system}
                  title={role.is_system ? 'System roles cannot be deleted' : undefined}
                  className={USERS_ROLES_ICON_BTN}
                  onClick={() => setDeleting(role)}
                >
                  <Trash2 className="size-4.5 text-[#EF4444]" strokeWidth={2.25} aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <SettingsRoleFormDialog
        open={adding || Boolean(editing)}
        role={editing}
        existingNames={names}
        onClose={() => {
          setAdding(false);
          setEditing(undefined);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete role?"
        message={
          deleting
            ? `Remove the “${deleting.name}” role. Users still assigned keep their label until you change them. Save Changes to keep this.`
            : ''
        }
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => {
          if (deleting && !deleting.is_system) removeRole(deleting.id);
          setDeleting(undefined);
        }}
        onCancel={() => setDeleting(undefined)}
      />
    </SettingsCard>
  );
}
