import { useSearchParams } from 'react-router';
import type { HireAdminCategory, HireAdminRole } from '../schemas/adminCategoryRole';
import { CategoriesPanel } from './CategoriesPanel';
import { isPermissionsTab } from './categoriesRolesTab';
import { ListTabs } from './ListTabs';
import { RolesPanel } from './RolesPanel';
import { RolesPermissionsTab } from './RolesPermissionsTab';

const TABS = [
  { key: 'categories', label: 'Categories' },
  { key: 'permissions', label: 'Roles & Permissions' }
] as const;

interface WorkspaceProps {
  onAddCategory: () => void;
  onViewCategory: (category: HireAdminCategory) => void;
  onEditCategory: (category: HireAdminCategory) => void;
  onAddRole: () => void;
  onViewRole: (role: HireAdminRole) => void;
  onEditRole: (role: HireAdminRole) => void;
}

/** Each panel fills its grid cell, and keeps a floor height so a short window scrolls the shell instead. */
const CELL =
  'grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] lg:min-h-[calc(400*var(--u))]';

/**
 * The white workspace under the stat cards. The `tab` URL parameter picks the tab: absent shows
 * Categories beside System Roles, `permissions` shows the permission matrix.
 */
export function CategoriesRolesWorkspace(props: WorkspaceProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = isPermissionsTab(searchParams) ? 'permissions' : 'categories';

  function select(key: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === 'permissions') next.set('tab', 'permissions');
      else next.delete('tab');
      return next;
    });
  }

  return (
    <section
      aria-label="Categories and roles"
      className="flex min-h-0 flex-col rounded-[18px] border border-[#E9ECF2] bg-white shadow-[0_4px_16px_rgba(20,35,60,0.06)] lg:rounded-[calc(18*var(--u))]"
    >
      <ListTabs tabs={TABS} active={active} onChange={select} ariaLabel="Categories and roles">
        {active === 'categories' ? (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 p-2 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)] lg:gap-[calc(8*var(--u))] lg:px-[calc(8*var(--u))] lg:pt-[calc(10*var(--u))] lg:pb-[calc(8*var(--u))]">
            <div className={CELL}>
              <CategoriesPanel
                onAddCategory={props.onAddCategory}
                onViewCategory={props.onViewCategory}
                onEditCategory={props.onEditCategory}
              />
            </div>
            <div className={CELL}>
              <RolesPanel
                onAddRole={props.onAddRole}
                onViewRole={props.onViewRole}
                onEditRole={props.onEditRole}
              />
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 p-2 lg:px-[calc(8*var(--u))] lg:pt-[calc(10*var(--u))] lg:pb-[calc(8*var(--u))]">
            <RolesPermissionsTab />
          </div>
        )}
      </ListTabs>
    </section>
  );
}
