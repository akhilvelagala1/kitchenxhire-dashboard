import { RecruiterOrganizationSetupPanel } from './RecruiterOrganizationSetupPanel';
import { RecruiterPostJobSetupPanel } from './RecruiterPostJobSetupPanel';

interface RecruiterSetupInfoPanelProps {
  variant: 'organization' | 'post-job';
}

export function RecruiterSetupInfoPanel({ variant }: RecruiterSetupInfoPanelProps) {
  if (variant === 'organization') {
    return <RecruiterOrganizationSetupPanel />;
  }

  return <RecruiterPostJobSetupPanel />;
}
