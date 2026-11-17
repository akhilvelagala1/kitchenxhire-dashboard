import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { Textarea } from '@/shared/ui/Input';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  /** Ask for a reason; it is sent to the server and lands in the audit trail. */
  requireReason?: boolean;
  loading?: boolean;
  onConfirm: (reason: string | undefined) => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  tone = 'danger',
  requireReason,
  loading,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const blocked = requireReason && reason.trim().length < 5;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={tone}
            loading={loading}
            disabled={blocked}
            onClick={() => onConfirm(requireReason ? reason.trim() : undefined)}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
      {requireReason && (
        <div className="mt-4">
          <Field label="Reason" required hint="At least 5 characters. Saved in the audit trail.">
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
      )}
    </Dialog>
  );
}
