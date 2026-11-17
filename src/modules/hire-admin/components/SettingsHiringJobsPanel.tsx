import { SettingsApplicationWorkflowCard } from './SettingsApplicationWorkflowCard';
import { SettingsCandidatePrefsCard } from './SettingsCandidatePrefsCard';
import { SettingsInterviewCommCard } from './SettingsInterviewCommCard';
import { SettingsJobConfigCard } from './SettingsJobConfigCard';

/**
 * The Hiring & Jobs tab content: four cards for the page's 2×2 grid. The page stretches the top
 * row taller and the bottom row shorter so everything fits one main without scrolling.
 */
export function SettingsHiringJobsPanel() {
  return (
    <>
      <SettingsJobConfigCard />
      <SettingsApplicationWorkflowCard />
      <SettingsInterviewCommCard />
      <SettingsCandidatePrefsCard />
    </>
  );
}
