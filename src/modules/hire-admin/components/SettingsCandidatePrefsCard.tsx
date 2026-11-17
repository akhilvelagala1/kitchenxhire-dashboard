import { FileText, Filter, Star, Users } from 'lucide-react';
import { SETTINGS_CANDIDATE_STATUSES } from '../schemas/adminSettings';
import { SettingsCard } from './SettingsCard';
import { SettingsRow } from './SettingsRow';
import { SettingsSelectControl } from './SettingsSelectControl';
import { SettingsToggleRow } from './SettingsToggleRow';
import { HIRING_CARD_CLASS, HIRING_ROWS_CLASS } from './settingsHiringDensity';

/** Bottom-right Hiring & Jobs card: resume rules, applications and recommendations. */
export function SettingsCandidatePrefsCard() {
  return (
    <SettingsCard
      title="Candidate & Job Preferences"
      description="Additional preferences for candidates and job postings."
      className={HIRING_CARD_CLASS}
    >
      <div className={HIRING_ROWS_CLASS}>
        <SettingsToggleRow
          name="require_resume"
          icon={FileText}
          tone="blue"
          title="Require Resume / CV"
          description="Make resume upload mandatory for applications"
        />
        <SettingsToggleRow
          name="allow_multiple_applications"
          icon={Users}
          tone="green"
          title="Allow Multiple Applications"
          description="Let candidates apply for multiple jobs"
        />
        <SettingsRow
          icon={Filter}
          tone="purple"
          title="Default Candidate Status"
          description="Initial status for new applications"
        >
          <SettingsSelectControl
            name="default_candidate_status"
            label="Default candidate status"
            options={SETTINGS_CANDIDATE_STATUSES}
          />
        </SettingsRow>
        <SettingsToggleRow
          name="show_similar_jobs"
          icon={Star}
          tone="amber"
          title="Show Similar Jobs to Candidates"
          description="Display related job recommendations"
        />
      </div>
    </SettingsCard>
  );
}
