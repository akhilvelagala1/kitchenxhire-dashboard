import { useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { BusinessFormDialog } from '../components/BusinessFormDialog';
import { BusinessHeaderActions } from '../components/BusinessHeaderActions';
import { BusinessTableSection } from '../components/BusinessTableSection';
import { BusinessViewDialog } from '../components/BusinessViewDialog';
import type { HireAdminBusiness } from '../schemas/adminBusiness';

/**
 * Businesses / Outlets list redesign: heading (Export + Add) plus the management card.
 * KPI cards, trend chart and Quick Actions were removed. Add, View and Edit stay as dialogs.
 */
export function AdminBusinessesPage() {
  /** `{}` is the Add dialog; with a `business` it is the Edit dialog; `null` is closed. */
  const [form, setForm] = useState<{ business?: HireAdminBusiness } | null>(null);
  const [viewing, setViewing] = useState<HireAdminBusiness | undefined>();

  function edit(business: HireAdminBusiness) {
    setViewing(undefined);
    setForm({ business });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-4">
      <PageHeader
        flush
        className="lg:items-center"
        titleClassName="text-[#111111] lg:text-dense-title lg:leading-8 lg:font-bold"
        descriptionClassName="lg:mt-0.5"
        title="Businesses / Outlets"
        description="Manage employer businesses, branches and outlet locations."
        actions={<BusinessHeaderActions onAddBusiness={() => setForm({})} />}
      />
      <BusinessTableSection onView={setViewing} onEdit={edit} />

      <BusinessFormDialog
        open={form !== null}
        business={form?.business}
        onClose={() => setForm(null)}
      />
      <BusinessViewDialog business={viewing} onClose={() => setViewing(undefined)} onEdit={edit} />
    </div>
  );
}
