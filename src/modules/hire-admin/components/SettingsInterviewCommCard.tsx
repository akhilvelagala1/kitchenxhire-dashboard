import { Bell, CalendarCheck, Mail } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SETTINGS_REMINDER_HOURS, type SettingsFormValues } from '../schemas/adminSettings';
import { SettingsCard } from './SettingsCard';
import { SettingsNumberControl } from './SettingsNumberControl';
import { SettingsRow } from './SettingsRow';
import { SettingsToggleRow } from './SettingsToggleRow';
import { HIRING_CARD_CLASS, HIRING_ROWS_CLASS } from './settingsHiringDensity';

/**
 * Bottom-left Hiring & Jobs card: interview reminders and confirmation emails.
 * Reminder and interview-confirmation controls lock when Interview Scheduling is off.
 */
export function SettingsInterviewCommCard() {
  const { control } = useFormContext<SettingsFormValues>();
  const schedulingOn = useWatch({ control, name: 'interview_scheduling' });

  return (
    <SettingsCard
      title="Interview & Communication"
      description="Configure interview reminders and candidate communications."
      className={HIRING_CARD_CLASS}
    >
      <div className={HIRING_ROWS_CLASS}>
        <SettingsRow
          icon={Bell}
          tone="blue"
          title="Interview Reminder (To Candidate)"
          description="Send automated reminder before interview"
        >
          <SettingsNumberControl
            name="candidate_reminder_hours"
            label="Candidate interview reminder"
            min={SETTINGS_REMINDER_HOURS.min}
            max={SETTINGS_REMINDER_HOURS.max}
            suffix="hours"
            disabled={!schedulingOn}
          />
        </SettingsRow>
        <SettingsRow
          icon={Bell}
          tone="orange"
          title="Interview Reminder (To Recruiter)"
          description="Notify recruiters about upcoming interviews"
        >
          <SettingsNumberControl
            name="recruiter_reminder_hours"
            label="Recruiter interview reminder"
            min={SETTINGS_REMINDER_HOURS.min}
            max={SETTINGS_REMINDER_HOURS.max}
            suffix="hours"
            disabled={!schedulingOn}
          />
        </SettingsRow>
        <SettingsToggleRow
          name="application_confirmation"
          icon={Mail}
          tone="purple"
          title="Application Confirmation"
          description="Send confirmation to candidate after application"
        />
        <SettingsToggleRow
          name="interview_confirmation"
          icon={CalendarCheck}
          tone="green"
          title="Interview Confirmation"
          description="Send interview details and instructions"
          disabled={!schedulingOn}
        />
      </div>
    </SettingsCard>
  );
}
