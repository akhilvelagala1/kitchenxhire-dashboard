import { Dialog } from '@/shared/ui/Dialog';
import type { BusinessInput, HireAdminBusiness } from '../schemas/adminBusiness';
import { BusinessForm } from './BusinessForm';
import { useCreateBusiness, useUpdateBusiness } from './businessMutations';

const EMPTY: BusinessInput = {
  business_name: '',
  business_type: 'Restaurant',
  area: '',
  city: '',
  owner_name: '',
  phone: '',
  email: ''
};

const FIELDS = Object.keys(EMPTY) as (keyof BusinessInput)[];

function fromBusiness(b: HireAdminBusiness): BusinessInput {
  return {
    business_name: b.business_name,
    business_type: b.business_type,
    area: b.area,
    city: b.city,
    owner_name: b.owner_name,
    phone: b.phone,
    email: b.email
  };
}

function BusinessFormBody({
  existing,
  onClose
}: {
  existing: HireAdminBusiness | undefined;
  onClose: () => void;
}) {
  const create = useCreateBusiness();
  const update = useUpdateBusiness(existing?.business_id ?? '');
  const defaults = existing ? fromBusiness(existing) : EMPTY;

  async function save(values: BusinessInput) {
    if (!existing) {
      await create.mutateAsync(values);
    } else {
      // Send only what the person changed, and nothing when nothing changed.
      const changed = Object.fromEntries(
        FIELDS.filter((f) => values[f] !== defaults[f]).map((f) => [f, values[f]])
      ) as Partial<BusinessInput>;
      if (Object.keys(changed).length > 0) await update.mutateAsync(changed);
    }
    onClose();
  }

  return (
    <BusinessForm
      defaultValues={defaults}
      submitLabel={existing ? 'Save changes' : 'Add business'}
      onSubmit={save}
      onCancel={onClose}
    />
  );
}

/**
 * Add (no `business`) and edit (with `business`) in one dialog. The form is mounted only while the
 * dialog is open, so every opening starts from the stored values.
 */
export function BusinessFormDialog({
  open,
  business,
  onClose
}: {
  open: boolean;
  business?: HireAdminBusiness;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={business ? 'Edit Business' : 'Add Business'}>
      <BusinessFormBody existing={business} onClose={onClose} />
    </Dialog>
  );
}
