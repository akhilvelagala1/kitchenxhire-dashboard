import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/shared/components/PageHeader';
import { cn } from '@/shared/lib/cn';
import { AuditLogsDialog } from '../components/AuditLogsDialog';
import { CategoriesRolesHeaderActions } from '../components/CategoriesRolesHeaderActions';
import { CategoriesRolesKpiRow } from '../components/CategoriesRolesKpiRow';
import { CategoriesRolesWorkspace } from '../components/CategoriesRolesWorkspace';
import { isPermissionsTab } from '../components/categoriesRolesTab';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import { CategoryViewDialog } from '../components/CategoryViewDialog';
import { RoleFormDialog } from '../components/RoleFormDialog';
import { RoleViewDialog } from '../components/RoleViewDialog';
import type { HireAdminCategory, HireAdminRole } from '../schemas/adminCategoryRole';

/**
 * Below lg the cards stack and the page scrolls. From lg up it is a three-row grid drawn for the
 * reference picture and scaled with the window (`fit-scale` and `fit-scale-lists`, see
 * styles/index.css): the heading, the two stat cards, and the workspace. On the Categories tab the
 * workspace is 621 design px tall like the picture, with blank page below it; the Roles &
 * Permissions tab has no picture, so it takes whatever height is left. Add, View and Edit are
 * dialogs on this page, so the lists, filters and selection stay as they were.
 */
export function AdminCategoriesRolesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const permissionsTab = isPermissionsTab(searchParams);
  /** `{}` is the Add dialog; with a `category` it is the Edit dialog; `null` is closed. */
  const [categoryForm, setCategoryForm] = useState<{ category?: HireAdminCategory } | null>(null);
  const [viewingCategory, setViewingCategory] = useState<HireAdminCategory | undefined>();
  const [roleForm, setRoleForm] = useState<{ role?: HireAdminRole } | null>(null);
  const [viewingRole, setViewingRole] = useState<HireAdminRole | undefined>();
  const [auditOpen, setAuditOpen] = useState(false);

  function editCategory(category: HireAdminCategory) {
    setViewingCategory(undefined);
    setCategoryForm({ category });
  }

  function editRole(role: HireAdminRole) {
    setViewingRole(undefined);
    setRoleForm({ role });
  }

  function editPermissions(role: HireAdminRole) {
    setViewingRole(undefined);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'permissions');
      next.set('role', role.role_id);
      return next;
    });
  }

  return (
    <div className="fit-scale fit-scale-lists flex min-h-0 flex-1 flex-col lg:pt-[calc(20*var(--u))] lg:pr-[calc(14*var(--u))] lg:pb-[calc(16*var(--u))] lg:pl-[calc(20*var(--u))]">
      <div
        className={cn(
          'mx-auto grid w-full flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 lg:min-h-0 lg:max-w-[calc(1760*var(--u))] lg:gap-y-[calc(17*var(--u))]',
          permissionsTab
            ? 'lg:max-h-[calc(1010*var(--u))] lg:grid-rows-[auto_auto_minmax(calc(621*var(--u)),1fr)] lg:content-stretch'
            : 'lg:grid-rows-[auto_auto_calc(621*var(--u))]'
        )}
      >
        <PageHeader
          flush
          className="lg:items-center"
          breadcrumbs={[{ label: 'Platform Management' }, { label: 'Categories & Roles' }]}
          titleClassName="text-[#111111] lg:text-[calc(26*var(--u))] lg:leading-8 lg:font-bold"
          descriptionClassName="lg:mt-[calc(4*var(--u))]"
          title="Categories & Roles"
          description="Manage business categories (e.g., Restaurant, Cloud Kitchen) and system roles with permissions."
          actions={<CategoriesRolesHeaderActions onOpenAuditLogs={() => setAuditOpen(true)} />}
        />
        <div className="lg:pb-[calc(7*var(--u))]">
          <CategoriesRolesKpiRow />
        </div>
        <CategoriesRolesWorkspace
          onAddCategory={() => setCategoryForm({})}
          onViewCategory={setViewingCategory}
          onEditCategory={editCategory}
          onAddRole={() => setRoleForm({})}
          onViewRole={setViewingRole}
          onEditRole={editRole}
        />
      </div>

      <CategoryFormDialog
        open={categoryForm !== null}
        category={categoryForm?.category}
        onClose={() => setCategoryForm(null)}
      />
      <CategoryViewDialog
        category={viewingCategory}
        onClose={() => setViewingCategory(undefined)}
        onEdit={editCategory}
      />
      <RoleFormDialog
        open={roleForm !== null}
        role={roleForm?.role}
        onClose={() => setRoleForm(null)}
      />
      <RoleViewDialog
        role={viewingRole}
        onClose={() => setViewingRole(undefined)}
        onEdit={editRole}
        onEditPermissions={editPermissions}
      />
      <AuditLogsDialog open={auditOpen} onClose={() => setAuditOpen(false)} />
    </div>
  );
}
