import orgSetupPanelArt from '../assets/recruiter-org-setup-panel.png';
import { cn } from '@/shared/lib/cn';
import { recruiterSetupOrgPanelColumn } from './recruiterSetupStyles';

/** Left peach card — reference panel asset (489×1024); full artwork, no crop. */
export function RecruiterOrganizationSetupPanel() {
  return (
    <div className={recruiterSetupOrgPanelColumn}>
      <aside
        className={cn(
          'w-full overflow-hidden rounded-[20px] bg-[#fff0e8]',
          'max-[1023px]:h-auto',
          'min-[1024px]:aspect-[489/1024] min-[1024px]:h-full'
        )}
      >
        <h2 className="sr-only">Set up your organization</h2>
        <img
          src={orgSetupPanelArt}
          alt=""
          width={489}
          height={1024}
          className={cn(
            'block w-full',
            'max-[1023px]:h-auto max-[1023px]:rounded-[20px]',
            'min-[1024px]:h-full min-[1024px]:object-contain min-[1024px]:object-top'
          )}
          decoding="async"
        />
      </aside>
    </div>
  );
}
