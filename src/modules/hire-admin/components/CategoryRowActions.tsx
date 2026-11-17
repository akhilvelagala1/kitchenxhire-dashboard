import { Eye, Pencil } from 'lucide-react';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import type { CategoryStatus, HireAdminCategory } from '../schemas/adminCategoryRole';
import { CategoryActionMenu } from './CategoryActionMenu';
import { ROW_ICON_BUTTON } from './rowIconButton';

/** What the row's buttons ask the panel to do. */
export interface CategoryRowHandlers {
  onView: (category: HireAdminCategory) => void;
  onEdit: (category: HireAdminCategory) => void;
  onSetStatus: (category: HireAdminCategory, status: CategoryStatus) => void;
}

/** The table's last column. Everyone with view access can open a category; changes need manage. */
export function CategoryRowActions({
  category,
  handlers
}: {
  category: HireAdminCategory;
  handlers: CategoryRowHandlers;
}) {
  const id = category.category_id;

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        aria-label={`View category ${id}`}
        className={ROW_ICON_BUTTON}
        onClick={() => handlers.onView(category)}
      >
        <Eye className="size-4.5" aria-hidden />
      </button>
      <PermissionGate permission={P.manage}>
        <button
          type="button"
          aria-label={`Edit category ${id}`}
          className={ROW_ICON_BUTTON}
          onClick={() => handlers.onEdit(category)}
        >
          <Pencil className="size-4.5" aria-hidden />
        </button>
        <CategoryActionMenu
          category={category}
          triggerClassName={ROW_ICON_BUTTON}
          onSetStatus={handlers.onSetStatus}
        />
      </PermissionGate>
    </div>
  );
}
