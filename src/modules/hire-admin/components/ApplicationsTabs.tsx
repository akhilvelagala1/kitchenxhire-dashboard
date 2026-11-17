import type { ReactNode } from 'react';
import {
  APPLICATION_TABS,
  APPLICATION_TAB_LABELS,
  type ApplicationTab
} from '../schemas/adminApplication';
import { ListTabs } from './ListTabs';

/**
 * Stage tabs with the number of applications that reached each stage, on the shared ListTabs.
 * `children` is the content of the selected tab: the filters, table and pager, which all show
 * the stage chosen here.
 */
export function ApplicationsTabs({
  active,
  counts,
  onChange,
  children
}: {
  active: ApplicationTab;
  counts: Record<ApplicationTab, number> | undefined;
  onChange: (tab: ApplicationTab) => void;
  children: ReactNode;
}) {
  return (
    <ListTabs
      variant="applications"
      tabs={APPLICATION_TABS.map((tab) => ({
        key: tab,
        label: APPLICATION_TAB_LABELS[tab],
        count: counts?.[tab]
      }))}
      active={active}
      onChange={(key) => onChange(key as ApplicationTab)}
      ariaLabel="Application stage"
    >
      {children}
    </ListTabs>
  );
}
