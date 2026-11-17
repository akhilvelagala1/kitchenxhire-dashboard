import { AuditTrail } from '@/shared/components/AuditTrail';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';

/** Every recorded change to categories and to roles, newest first. `all` asks for every event of a type. */
export function AuditLogsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Audit Logs"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto pr-1">
        <section aria-labelledby="audit-categories">
          <h3 id="audit-categories" className="mb-2 text-sm font-semibold text-ink">
            Categories
          </h3>
          <AuditTrail entityType="hire_category" entityId="all" />
        </section>
        <section aria-labelledby="audit-roles">
          <h3 id="audit-roles" className="mb-2 text-sm font-semibold text-ink">
            Roles
          </h3>
          <AuditTrail entityType="hire_role" entityId="all" />
        </section>
      </div>
    </Dialog>
  );
}
