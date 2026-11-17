import type { ReactNode } from 'react';
import { ListTabs } from './ListTabs';

export type JobsTabKey = 'all' | 'active' | 'under_review' | 'paused' | 'closed' | 'draft';

const TABS: { key: JobsTabKey; label: string }[] = [
  { key: 'all', label: 'All Jobs' },
  { key: 'active', label: 'Active' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'paused', label: 'Paused' },
  { key: 'closed', label: 'Closed' },
  { key: 'draft', label: 'Drafts' }
];

/** Job stage tabs. Counts come from the jobs summary endpoint. */
export function JobsTabs({
  active,
  counts,
  onChange,
  children
}: {
  active: JobsTabKey;
  counts: Partial<Record<JobsTabKey, number>> | undefined;
  onChange: (tab: JobsTabKey) => void;
  children: ReactNode;
}) {
  return (
    <ListTabs
      variant="applications"
      tabs={TABS.map((tab) => ({
        key: tab.key,
        label: tab.label,
        count: counts?.[tab.key]
      }))}
      active={active}
      onChange={(key) => onChange(key as JobsTabKey)}
      ariaLabel="Job status"
    >
      {children}
    </ListTabs>
  );
}
