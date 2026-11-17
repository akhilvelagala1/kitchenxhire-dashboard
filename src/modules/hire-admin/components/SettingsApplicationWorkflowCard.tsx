import { CalendarCheck, FileText, Hourglass, Users } from 'lucide-react';
import { SETTINGS_REVIEW_SLA_DAYS } from '../schemas/adminSettings';
import { SettingsCard } from './SettingsCard';
import { SettingsInterviewTypesRow } from './SettingsInterviewTypesRow';
import { SettingsNumberControl } from './SettingsNumberControl';
import { SettingsRow } from './SettingsRow';
import { SettingsToggleRow } from './SettingsToggleRow';
import { HIRING_CARD_CLASS, HIRING_ROWS_CLASS } from './settingsHiringDensity';

/** Top-right Hiring & Jobs card: application flow, interview modes and review SLA. */
export function SettingsApplicationWorkflowCard() {
  return (
    <SettingsCard
      title="Application & Interview Workflow"
      description="Manage application flow and interview process."
      className={HIRING_CARD_CLASS}
    >
      <div className={HIRING_ROWS_CLASS}>
        <SettingsToggleRow
          name="application_approval"
          icon={FileText}
          tone="purple"
          title="Application Approval"
          description="Require approval before shortlisting candidates"
        />
        <SettingsToggleRow
          name="interview_scheduling"
          icon={CalendarCheck}
          tone="blue"
          title="Interview Scheduling"
          description="Allow recruiters to schedule interviews"
        />
        <SettingsInterviewTypesRow />
        <SettingsToggleRow
          name="auto_match_candidates"
          icon={Users}
          tone="amber"
          title="Auto Match Candidates"
          description="Show recommended candidates based on job requirements"
        />
        <SettingsRow
          icon={Hourglass}
          tone="pink"
          title="Application Review SLA"
          description="Target time to review new applications"
        >
          <SettingsNumberControl
            name="application_review_sla_days"
            label="Application review SLA"
            min={SETTINGS_REVIEW_SLA_DAYS.min}
            max={SETTINGS_REVIEW_SLA_DAYS.max}
            suffix="days"
          />
        </SettingsRow>
      </div>
    </SettingsCard>
  );
}
