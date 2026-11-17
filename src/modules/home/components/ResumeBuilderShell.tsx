import type { ReactNode } from 'react';

interface ResumeBuilderShellProps {
  header: ReactNode;
  stepper: ReactNode;
  children: ReactNode;
}

/** Resume workspace content. The section sidebar and page spacing come from `UserProfileLayout`. */
export function ResumeBuilderShell({ header, stepper, children }: ResumeBuilderShellProps) {
  return (
    <div className="flex flex-col gap-4">
      {header}
      {stepper}
      {children}
    </div>
  );
}
