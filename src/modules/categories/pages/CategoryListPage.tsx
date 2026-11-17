import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BulkActionBar } from '@/shared/components/BulkActionBar';
import { BulkImportDialog } from '@/shared/components/BulkImportDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DataTable } from '@/shared/components/DataTable';
import { DateRangeFilter } from '@/shared/components/DateRangeFilter';
import { ExportButton } from '@/shared/components/ExportButton';
import { FilterBar } from '@/shared/components/FilterBar';
import { PageHeader } from '@/shared/components/PageHeader';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { SearchInput } from '@/shared/components/SearchInput';
import { useListParams } from '@/shared/hooks/useListParams';
import { useRowSelection } from '@/shared/hooks/useRowSelection';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Input';
import { categoryApi } from '../api/categoryApi';
import { categoryKeys } from '../api/categoryKeys';
import { useBulkCategoryAction, useCategoryList } from '../api/categoryQueries';
import { categoryColumns } from '../components/categoryColumns';
import { CATEGORY_STATUSES } from '../schemas/category';
import { CATEGORY_PERMISSIONS as P } from '../permissions';

export function CategoryListPage() {
  const navigate = useNavigate();
  const params = useListParams({ sort: 'name', order: 'asc' });
  const { query } = params;
  const list = useCategoryList(query);
  const selection = useRowSelection();
  const bulk = useBulkCategoryAction();
  const [importOpen, setImportOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  // A selection made under one filter must not silently apply under another.
  const { clear } = selection;
  useEffect(clear, [clear, query]);

  const ids = [...selection.selected];
  const runBulk = (action: Parameters<typeof bulk.mutate>[0]['action'], reason?: string) =>
    bulk.mutate(
      { action, ids, reason },
      {
        onSuccess: () => {
          selection.clear();
          setConfirmArchive(false);
        }
      }
    );

  const hasActive = Boolean(
    query.search ||
    query.from ||
    query.to ||
    query.include_deleted ||
    Object.keys(params.filters).length
  );

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organise the catalogue. Archived categories are hidden from customers and can be restored."
        breadcrumbs={[{ label: 'Catalogue' }, { label: 'Categories' }]}
        actions={
          <>
            <PermissionGate permission={P.import}>
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                Import
              </Button>
            </PermissionGate>
            <PermissionGate permission={P.export}>
              <ExportButton start={() => categoryApi.export(query)} />
            </PermissionGate>
            <PermissionGate permission={P.create}>
              <Button onClick={() => navigate('/catalogue/categories/new')}>New category</Button>
            </PermissionGate>
          </>
        }
      />

      <FilterBar onReset={params.reset} hasActive={hasActive}>
        <SearchInput
          value={query.search}
          onChange={params.setSearch}
          placeholder="Search name or code"
        />
        <Select
          aria-label="Status"
          value={params.filters.status ?? ''}
          onChange={(e) => params.setFilter('status', e.target.value || undefined)}
          className="md:w-40"
        >
          <option value="">All statuses</option>
          {CATEGORY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <DateRangeFilter
          label="Updated"
          from={query.from}
          to={query.to}
          onChange={params.setDateRange}
        />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4"
            checked={Boolean(query.include_deleted)}
            onChange={(e) => params.setIncludeDeleted(e.target.checked)}
          />
          Show archived
        </label>
      </FilterBar>

      <PermissionGate permission={P.update}>
        <BulkActionBar count={ids.length} onClear={selection.clear}>
          <Button variant="secondary" loading={bulk.isPending} onClick={() => runBulk('ACTIVATE')}>
            Activate
          </Button>
          <Button
            variant="secondary"
            loading={bulk.isPending}
            onClick={() => runBulk('DEACTIVATE')}
          >
            Deactivate
          </Button>
          {query.include_deleted && (
            <Button variant="secondary" loading={bulk.isPending} onClick={() => runBulk('RESTORE')}>
              Restore
            </Button>
          )}
          <Button variant="danger" onClick={() => setConfirmArchive(true)}>
            Archive
          </Button>
        </BulkActionBar>
      </PermissionGate>

      <DataTable
        caption="Categories"
        columns={categoryColumns}
        rows={list.data?.items}
        getRowId={(c) => c.id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        selection={selection}
        sort={{ key: query.sort, order: query.order, onChange: params.setSort }}
        pagination={{
          page: query.page,
          pageSize: query.page_size,
          total: list.data?.meta.total ?? 0,
          onPageChange: params.setPage,
          onPageSizeChange: params.setPageSize
        }}
        empty={
          hasActive
            ? {
                title: 'No categories match these filters',
                action: (
                  <Button variant="secondary" onClick={params.reset}>
                    Clear filters
                  </Button>
                )
              }
            : { title: 'No categories yet', description: 'Create one, or import a spreadsheet.' }
        }
      />

      <ConfirmDialog
        open={confirmArchive}
        title={`Archive ${ids.length} categories?`}
        message="Archived categories are hidden from customers. Products stay in place. You can restore them later."
        confirmLabel="Archive"
        requireReason
        loading={bulk.isPending}
        onConfirm={(reason) => runBulk('ARCHIVE', reason)}
        onCancel={() => setConfirmArchive(false)}
      />

      <BulkImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        entityLabel="Categories"
        templateUrl={categoryApi.templateUrl}
        upload={categoryApi.import}
        invalidates={[categoryKeys.all]}
      />
    </>
  );
}
