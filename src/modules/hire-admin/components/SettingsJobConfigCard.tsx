import { Archive, Briefcase, CalendarDays, Eye, Layers, Pencil, ShieldCheck } from 'lucide-react';
import {
  SETTINGS_EMPLOYMENT_TYPES,
  SETTINGS_EXPIRY_DAYS,
  SETTINGS_JOB_VISIBILITIES,
  SETTINGS_MAX_ACTIVE_JOBS
} from '../schemas/adminSettings';
import { SettingsCard } from './SettingsCard';
import { SettingsNumberControl } from './SettingsNumberControl';
import { SettingsRow } from './SettingsRow';
import { SettingsSelectControl } from './SettingsSelectControl';
import { SettingsToggleRow } from './SettingsToggleRow';
import { HIRING_CARD_CLASS, HIRING_ROWS_CLASS } from './settingsHiringDensity';

/** Top-left Hiring & Jobs card: job posting defaults and publishing rules. */
export function SettingsJobConfigCard() {
  return (
    <SettingsCard
      title="Job Configuration"
      description="Configure job posting and job management settings."
      className={HIRING_CARD_CLASS}
    >
      <div className={HIRING_ROWS_CLASS}>
        <SettingsRow
          icon={CalendarDays}
          tone="purple"
          title="Default Job Expiry"
          description="Set the default duration for job posts"
        >
          <SettingsNumberControl
            name="default_job_expiry_days"
            label="Default job expiry"
            min={SETTINGS_EXPIRY_DAYS.min}
            max={SETTINGS_EXPIRY_DAYS.max}
            suffix="days"
          />
        </SettingsRow>
        <SettingsRow
          icon={Layers}
          tone="blue"
          title="Maximum Active Jobs per Recruiter"
          description="Limit the number of active jobs a recruiter can have"
        >
          <SettingsNumberControl
            name="max_active_jobs_per_recruiter"
            label="Maximum active jobs"
            min={SETTINGS_MAX_ACTIVE_JOBS.min}
            max={SETTINGS_MAX_ACTIVE_JOBS.max}
          />
        </SettingsRow>
        <SettingsRow
          icon={Briefcase}
          tone="orange"
          title="Employment Type (Default)"
          description="Default employment type for new jobs"
        >
          <SettingsSelectControl
            name="default_employment_type"
            label="Default employment type"
            options={SETTINGS_EMPLOYMENT_TYPES}
          />
        </SettingsRow>
        <SettingsRow
          icon={Eye}
          tone="pink"
          title="Job Visibility"
          description="Who can view published jobs"
        >
          <SettingsSelectControl
            name="job_visibility"
            label="Job visibility"
            options={SETTINGS_JOB_VISIBILITIES}
            wide
          />
        </SettingsRow>
        <SettingsToggleRow
          name="require_job_approval"
          icon={ShieldCheck}
          tone="green"
          title="Require Job Approval"
          description="Admin approval required before a job goes live"
        />
        <SettingsToggleRow
          name="allow_editing_published_jobs"
          icon={Pencil}
          tone="purple"
          title="Allow Editing Published Jobs"
          description="Let recruiters edit jobs after publishing"
        />
        <SettingsToggleRow
          name="auto_close_expired_jobs"
          icon={Archive}
          tone="orange"
          title="Automatically Close Expired Jobs"
          description="Move expired jobs to closed status"
        />
      </div>
    </SettingsCard>
  );
}
