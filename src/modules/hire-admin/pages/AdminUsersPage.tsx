import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { UserFormDialog } from '../components/UserFormDialog';
import { UserHeaderActions } from '../components/UserHeaderActions';
import { UserTableSection } from '../components/UserTableSection';
import { UserViewDialog } from '../components/UserViewDialog';
import type { HireAdminUser } from '../schemas/adminUser';

/**
 * User Management list redesign: heading (Export + Add) plus the management card.
 * KPI cards, trend chart and Quick Actions were removed. Add, View and Edit stay as dialogs.
 */
export function AdminUsersPage() {
  /** `{}` is the Add dialog; with a `user` it is the Edit dialog; `null` is closed. */
  const [form, setForm] = useState<{ user?: HireAdminUser } | null>(null);
  const [viewing, setViewing] = useState<HireAdminUser | undefined>();

  function edit(user: HireAdminUser) {
    setViewing(undefined);
    setForm({ user });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <PageHeader
        flush
        className="lg:items-center"
        titleClassName="text-[#111111] lg:text-dense-title lg:leading-8 lg:font-bold"
        descriptionClassName="lg:mt-0.5"
        title="User Management"
        description="Manage platform staff, roles, access permissions, and account status."
        actions={<UserHeaderActions onAddUser={() => setForm({})} />}
      />
      <UserTableSection onView={setViewing} onEdit={edit} />

      <UserFormDialog open={form !== null} user={form?.user} onClose={() => setForm(null)} />
      <UserViewDialog user={viewing} onClose={() => setViewing(undefined)} onEdit={edit} />
    </div>
  );
}
