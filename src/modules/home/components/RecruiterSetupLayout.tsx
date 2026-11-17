import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import {
  recruiterSetupGrid,
  recruiterSetupGridOrgFit,
  recruiterSetupGridPostJobFit,
  recruiterSetupPage,
  recruiterSetupPageOrgFit,
  recruiterSetupPagePostJobFit
} from './recruiterSetupStyles';

interface RecruiterSetupLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  /** Layout density for recruiter setup flows. */
  mode?: 'default' | 'organization' | 'post-job';
}

export function RecruiterSetupLayout({
  sidebar,
  children,
  mode = 'default'
}: RecruiterSetupLayoutProps) {
  const orgFit = mode === 'organization';
  const postJobFit = mode === 'post-job';
  const matchedCards = orgFit || postJobFit;

  return (
    <main
      id="main"
      className={cn(
        recruiterSetupPage,
        orgFit && cn(recruiterSetupPageOrgFit, 'flex flex-1 flex-col bg-[#fff8f4]'),
        postJobFit && recruiterSetupPagePostJobFit
      )}
    >
      <div
        className={cn(
          recruiterSetupGrid,
          orgFit && recruiterSetupGridOrgFit,
          postJobFit && recruiterSetupGridPostJobFit
        )}
      >
        <div className={cn('min-w-0 w-full self-stretch', matchedCards && 'h-full min-h-0')}>
          {sidebar}
        </div>
        <div
          className={cn(
            'min-w-0 w-full self-stretch',
            matchedCards && 'flex h-full min-h-0 items-stretch'
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
