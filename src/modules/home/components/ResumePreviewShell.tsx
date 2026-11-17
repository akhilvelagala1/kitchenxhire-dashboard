import type { ReactNode } from 'react';

interface ResumePreviewShellProps {
  header: ReactNode;
  checklist: ReactNode;
  document: ReactNode;
  actions: ReactNode;
}

/** Resume preview content. The section sidebar and page spacing come from `UserProfileLayout`. */
export function ResumePreviewShell({
  header,
  checklist,
  document,
  actions
}: ResumePreviewShellProps) {
  return (
    <div className="flex flex-col gap-4">
      {header}
      <div className="grid grid-cols-1 items-start gap-4 min-[1280px]:grid-cols-[minmax(220px,240px)_minmax(0,1fr)_minmax(232px,260px)] min-[1280px]:gap-5">
        <div className="min-w-0">{checklist}</div>
        <div className="w-full min-w-0">{document}</div>
        <div className="min-w-0 min-[1280px]:sticky min-[1280px]:top-[88px]">{actions}</div>
      </div>
    </div>
  );
}
