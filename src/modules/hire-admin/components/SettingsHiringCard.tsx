import { useId } from 'react';
import { Briefcase, CalendarDays, ClipboardCheck, UserCheck } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/Input';
import { SETTINGS_EXPIRY_DAYS, type SettingsFormValues } from '../schemas/adminSettings';
import { useCanEditSettings } from './settingsEditContext';
import { SettingsCard } from './SettingsCard';
import { SettingsRow } from './SettingsRow';
import { SettingsToggleRow } from './SettingsToggleRow';

/**
 * Holds the four rows. From lg up they share the card's height evenly. This card is the shortest on
 * the screen, so a row may be shorter than the usual 52 design px and its icon tile is 40 instead
 * of 52, or four rows would not fit. The selectors name an element (div, span), so they beat the
 * shared row's own classes by specificity: cn() does not merge conflicting Tailwind classes.
 */
const ROWS_CLASS =
  'flex min-h-0 flex-1 flex-col lg:[&>div]:min-h-0 lg:[&>div]:flex-1 ' +
  'lg:[&>div>span:first-child]:size-[calc(40*var(--u))]';

/** The number box, 34 design px high from lg up. Its width comes from the wrapper around it. */
const EXPIRY_INPUT_CLASS =
  'text-center lg:h-[calc(34*var(--u))] lg:min-h-0 lg:rounded-[calc(9*var(--u))] ' +
  'lg:px-[calc(8*var(--u))] lg:text-[calc(14*var(--u))]';

/** Hiring Configuration: how many days a job stays open, and three hiring-workflow switches. */
export function SettingsHiringCard() {
  const {
    register,
    formState: { errors }
  } = useFormContext<SettingsFormValues>();
  const canEdit = useCanEditSettings();
  const errorId = useId();
  const expiryError = errors.default_job_expiry_days?.message;

  return (
    <SettingsCard
      title="Hiring Configuration"
      description="Default settings for job postings and hiring workflow."
      className="h-full min-h-0"
    >
      <div className={ROWS_CLASS}>
        <SettingsRow icon={CalendarDays} tone="purple" title="Default Job Expiry">
          <div className="flex items-center gap-2 lg:gap-[calc(12*var(--u))]">
            <div className="w-24 shrink-0 lg:w-[calc(78*var(--u))]">
              <Input
                {...register('default_job_expiry_days', { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                min={SETTINGS_EXPIRY_DAYS.min}
                max={SETTINGS_EXPIRY_DAYS.max}
                aria-label="Default job expiry in days"
                aria-invalid={expiryError ? true : undefined}
                aria-describedby={expiryError ? errorId : undefined}
                disabled={!canEdit}
                className={EXPIRY_INPUT_CLASS}
              />
            </div>
            <span aria-hidden className="text-sm text-[#667085] lg:text-[calc(13*var(--u))]">
              days
            </span>
          </div>
        </SettingsRow>
        {expiryError && (
          <p
            id={errorId}
            role="alert"
            className="shrink-0 py-1 text-right text-sm text-danger-600 lg:text-[calc(12.5*var(--u))]"
          >
            {expiryError}
          </p>
        )}
        <SettingsToggleRow
          name="interview_scheduling"
          icon={UserCheck}
          tone="blue"
          title="Interview Scheduling"
          description="Allow recruiters to schedule interviews within the platform"
        />
        <SettingsToggleRow
          name="application_approval"
          icon={ClipboardCheck}
          tone="blue"
          title="Application Approval"
          description="Require approval before candidate shortlisting"
        />
        <SettingsToggleRow
          name="auto_match_candidates"
          icon={Briefcase}
          tone="orange"
          title="Auto Match Candidates"
          description="Show recommended candidates based on job requirements"
        />
      </div>
    </SettingsCard>
  );
}
