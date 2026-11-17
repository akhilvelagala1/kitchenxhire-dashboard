import { Check, RotateCcw } from 'lucide-react';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';

interface SettingsHeaderActionsProps {
  /** Something on the form differs from the last saved settings. */
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

/** 44px high on a phone (the shared Button's own height), 40 design px from lg up (Settings picture). */
const BUTTON =
  'whitespace-nowrap lg:h-[calc(40*var(--u))] lg:min-h-0 lg:rounded-[calc(12*var(--u))] lg:px-[calc(18*var(--u))] lg:text-[calc(14*var(--u))]';
const ICON = 'size-4 lg:size-[calc(17*var(--u))]';
/* The marks beat the shared secondary Button's own border and grey disabled fill: a Reset with
   nothing to undo stays white, only dimmed. */
const RESET =
  'border-[#E5E8EF]! text-[#17191F]! disabled:bg-white! disabled:opacity-60 lg:min-w-[calc(100*var(--u))]';
const SAVE = 'lg:min-w-[calc(153*var(--u))]';

/**
 * Reset and Save Changes at the right end of the Settings heading (they need the manage
 * permission). Both stay off until something has changed and while a save is under way; Reset goes
 * back to the last saved values.
 */
export function SettingsHeaderActions({
  isDirty,
  isSaving,
  onSave,
  onReset
}: SettingsHeaderActionsProps) {
  return (
    <PermissionGate permission={P.manage}>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          disabled={!isDirty || isSaving}
          onClick={onReset}
          className={cn(BUTTON, RESET)}
        >
          <RotateCcw aria-hidden className={ICON} />
          Reset
        </Button>
        <Button
          loading={isSaving}
          disabled={!isDirty}
          onClick={onSave}
          className={cn(BUTTON, SAVE)}
        >
          {!isSaving && <Check aria-hidden className={ICON} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </PermissionGate>
  );
}
