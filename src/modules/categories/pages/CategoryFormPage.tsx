import { useNavigate, useParams } from 'react-router';
import { ErrorState } from '@/shared/components/ErrorState';
import { PageHeader } from '@/shared/components/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useCategory, useSaveCategory } from '../api/categoryQueries';
import { CategoryForm } from '../components/CategoryForm';
import type { CategoryFormValues } from '../schemas/category';

const EMPTY: CategoryFormValues = {
  name: '',
  code: '',
  description: '',
  parent: null,
  status: 'ACTIVE',
  sort_order: 0
};

/** Serves both /new and /:id/edit. */
export function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useCategory(id);
  const save = useSaveCategory(
    existing.data ? { id: existing.data.id, version: existing.data.version } : undefined
  );
  const crumbs = [{ label: 'Catalogue' }, { label: 'Categories', to: '/catalogue/categories' }];

  if (id && existing.isLoading) return <Skeleton className="h-96 w-full max-w-2xl" />;
  if (id && existing.error)
    return <ErrorState error={existing.error} onRetry={() => existing.refetch()} />;

  const c = existing.data;
  const defaults: CategoryFormValues = c
    ? {
        name: c.name,
        code: c.code,
        description: c.description ?? '',
        parent: c.parent_id ? { value: c.parent_id, label: c.parent_name ?? '' } : null,
        status: c.status,
        sort_order: c.sort_order
      }
    : EMPTY;

  return (
    <>
      <PageHeader
        title={c ? `Edit ${c.name}` : 'New category'}
        breadcrumbs={[...crumbs, { label: c ? 'Edit' : 'New' }]}
      />
      <CategoryForm
        defaultValues={defaults}
        submitLabel={c ? 'Save changes' : 'Create category'}
        onSubmit={async (values) => {
          const saved = await save.mutateAsync(values);
          navigate(`/catalogue/categories/${saved.id}`);
        }}
        onCancel={() => navigate(-1)}
      />
    </>
  );
}
