import { useEffect } from 'react';
import { Dialog } from '@/shared/ui/Dialog';
import { AuthSheet, type AuthVerifiedPayload } from './AuthSheet';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: (payload: AuthVerifiedPayload) => void;
}

/** The login sheet in a full-viewport native dialog: a scrim on every screen, a card from 640px. */
export function AuthDialog({ open, onClose, onVerified }: AuthDialogProps) {
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  return (
    <Dialog
      open={open}
      bare
      onClose={onClose}
      title="Log in to KitchenX Hiring"
      className="m-0 size-full max-h-none max-w-none overflow-y-auto bg-transparent p-0 text-ink backdrop:bg-ink/35 backdrop:blur-[3px]"
    >
      <div
        className="flex min-h-full items-stretch justify-center sm:items-center sm:px-4 sm:py-10"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <AuthSheet
          onClose={onClose}
          onVerified={(payload) => {
            onVerified(payload);
            onClose();
          }}
        />
      </div>
    </Dialog>
  );
}
