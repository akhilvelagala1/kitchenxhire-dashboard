import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { DataTable } from '@/shared/components/DataTable';
import { SearchInput } from '@/shared/components/SearchInput';
import { cn } from '@/shared/lib/cn';
import { adminReportsKeys } from '../api/adminReportsKeys';
import {
  REPORTS_RECORDS_PAGE_SIZE,
  type ReportsRecordsQuery
} from '../schemas/adminReportsDrilldown';
import { LIST_FIELD, ListFilterSelect } from './ListFilterSelect';
import { ListPager } from './ListPager';
import { ReportCard } from './ReportCard';
import { useReportsDrilldown } from './reportsDrilldownParams';
import { formatCount } from './reportsFormat';
import { useReportRange } from './reportsPageParams';
import type { ReportsFilterChoice, ReportsRecordsConfig } from './reportsRecordsConfig';
import { useReportsFilterOptions } from './useReportsDrilldownData';

/** The choices plus the value in use when the list does not hold it (yet), so the select never shows another value. */
function withCurrent(choices: ReportsFilterChoice[], current: string): ReportsFilterChoice[] {
  if (!current || choices.some((choice) => choice.value === current)) return choices;
  return [...choices, { value: current, label: current }];
}

/**
 * The records behind one stat card, drawn under the cards in place of the Overview's lower rows:
 * the title with its total, a search and one filter, five rows, and the pager. Everything that
 * differs between the four lists is in `config`. Search, filter, page and sort live in the URL
 * (useReportsDrilldown). The search box reads its text from the URL once, so mount the card with a
 * `key` that changes with the stat card.
 */
export function ReportsRecordsCard<Row>({ config }: { config: ReportsRecordsConfig<Row> }) {
  const range = useReportRange();
  const { search, filter, page, sort, order, setSearch, setFilter, setPage, setSort } =
    useReportsDrilldown();
  const filterOptions = useReportsFilterOptions();

  const query: ReportsRecordsQuery = {
    range,
    page,
    pageSize: REPORTS_RECORDS_PAGE_SIZE,
    search,
    filter,
    sort,
    order
  };
  const list = useQuery({
    queryKey: adminReportsKeys.records(config.metric, query),
    queryFn: () => config.fetch(query),
    placeholderData: keepPreviousData
  });
  const total = list.data?.meta.total;
  const choices = withCurrent(config.filterChoices(filterOptions.data), filter);

  return (
    <ReportCard
      title={config.title}
      titleNote={total === undefined ? undefined : `(${formatCount(total)})`}
      subtitle={config.description}
      aside={
        <div
          role="search"
          aria-label={`Search ${config.title}`}
          className="flex flex-wrap items-center gap-2 lg:mt-2 lg:flex-nowrap lg:gap-3"
        >
          <div className="relative min-w-[200px] flex-1 lg:w-[calc(260*var(--u))] lg:min-w-0 lg:flex-none">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft"
            />
            <SearchInput
              label={`Search ${config.noun}`}
              placeholder={config.searchPlaceholder}
              value={search}
              onChange={setSearch}
              className={cn('pl-9!', LIST_FIELD)}
            />
          </div>
          <ListFilterSelect
            label={config.filterAllLabel}
            value={filter}
            onChange={setFilter}
            className="lg:w-[calc(160*var(--u))]"
          >
            <option value="">{config.filterAllLabel}</option>
            {choices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </ListFilterSelect>
        </div>
      }
      isLoading={false}
    >
      {list.isLoading && (
        <span role="status" className="sr-only">
          Loading {config.title}
        </span>
      )}
      {/* The same table as the Recent cards on the other report tabs: default density, no frame, the
          card draws the pager. The card is as tall as its rows, as in the picture. */}
      <DataTable<Row>
        framed={false}
        showPagination={false}
        columns={config.columns}
        rows={list.data?.items}
        getRowId={config.getRowId}
        isLoading={list.isLoading}
        error={list.data ? undefined : list.error}
        onRetry={() => void list.refetch()}
        sort={{ key: sort ?? undefined, order: sort ? order : undefined, onChange: setSort }}
        empty={{
          title: config.emptyTitle,
          description: 'Try a different search or date range.'
        }}
        caption={`${config.title} list`}
      />
      <ListPager
        labelledNav
        page={page}
        pageSize={REPORTS_RECORDS_PAGE_SIZE}
        total={total}
        noun={config.noun}
        onPageChange={setPage}
      />
    </ReportCard>
  );
}
