import { Link } from 'react-router';
import type { Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDateTime } from '@/shared/lib/dates';
import type { Category } from '../schemas/category';

export const categoryColumns: Column<Category>[] = [
  {
    id: 'name',
    header: 'Name',
    sortKey: 'name',
    cell: (c) => (
      <Link
        to={`/catalogue/categories/${c.id}`}
        className="font-medium text-brand-600 hover:underline"
      >
        {c.name}
      </Link>
    )
  },
  { id: 'code', header: 'Code', sortKey: 'code', cell: (c) => c.code },
  { id: 'parent', header: 'Parent', cell: (c) => c.parent_name ?? '—' },
  {
    id: 'products',
    header: 'Products',
    sortKey: 'product_count',
    cell: (c) => c.product_count.toLocaleString('en-IN'),
    className: 'text-right'
  },
  {
    id: 'status',
    header: 'Status',
    cell: (c) => <StatusBadge status={c.deleted_at ? 'DELETED' : c.status} />
  },
  {
    id: 'updated',
    header: 'Updated',
    sortKey: 'updated_at',
    cell: (c) => formatDateTime(c.updated_at)
  }
];
