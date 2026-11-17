import { ArrowRight } from 'lucide-react';
import {
  recruiterSetupPrimaryButton,
  recruiterSetupPrimaryButtonOrgFit,
  recruiterSetupPrimaryButtonPostJob,
  recruiterSetupSecondaryButton,
  recruiterSetupSecondaryButtonOrgFit,
  recruiterSetupSecondaryButtonPostJob
} from './recruiterSetupStyles';

interface RecruiterSetupFormActionsProps {
  onCancel: () => void;
  primaryLabel: string;
  submitting?: boolean;
  submittingLabel?: string;
  submitDisabled?: boolean;
  orgFit?: boolean;
  postJobFit?: boolean;
}

export function RecruiterSetupFormActions({
  onCancel,
  primaryLabel,
  submitting = false,
  submittingLabel = 'Saving…',
  submitDisabled = false,
  orgFit = false,
  postJobFit = false
}: RecruiterSetupFormActionsProps) {
  const secondary = postJobFit
    ? recruiterSetupSecondaryButtonPostJob
    : orgFit
      ? recruiterSetupSecondaryButtonOrgFit
      : recruiterSetupSecondaryButton;
  const primary = postJobFit
    ? recruiterSetupPrimaryButtonPostJob
    : orgFit
      ? recruiterSetupPrimaryButtonOrgFit
      : recruiterSetupPrimaryButton;

  const footerClass = postJobFit
    ? 'mt-auto flex shrink-0 flex-col-reverse gap-3.5 pt-4 min-[480px]:flex-row min-[480px]:justify-end min-[480px]:gap-4'
    : orgFit
      ? 'flex flex-col-reverse gap-3 pt-0 min-[480px]:flex-row min-[480px]:justify-end min-[480px]:gap-5'
      : 'flex flex-col-reverse gap-3 pt-5 min-[480px]:flex-row min-[480px]:justify-end min-[480px]:gap-6';

  return (
    <div className={footerClass}>
      <button type="button" onClick={onCancel} className={secondary()}>
        Cancel
      </button>
      <button type="submit" disabled={submitDisabled || submitting} className={primary()}>
        {submitting ? submittingLabel : primaryLabel}
        {!submitting && <ArrowRight className="size-4" />}
      </button>
    </div>
  );
}
