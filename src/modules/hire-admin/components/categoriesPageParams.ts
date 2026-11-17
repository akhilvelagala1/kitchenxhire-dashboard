import type { CategoriesListParams } from '../api/adminCategoriesApi';
import { CATEGORY_STATUSES } from '../schemas/adminCategoryRole';
import { parsePage, pick } from './listParams';

const STATUS_FILTERS = ['all', ...CATEGORY_STATUSES] as const;

/** The picture shows five categories per page; the page size is not in the URL. */
const CATEGORIES_PAGE_SIZE = 5;

/** What the categories panel keeps in the URL: `q`, `status` and `page`, each with a safe default. */
export function parseCategoriesSearchParams(searchParams: URLSearchParams) {
  return {
    q: searchParams.get('q') ?? '',
    status: pick(searchParams.get('status'), STATUS_FILTERS, 'all'),
    page: parsePage(searchParams.get('page'))
  };
}

export type CategoriesPageParams = ReturnType<typeof parseCategoriesSearchParams>;

/** The request the list, the export and the bulk bar share: empty search and `all` are left out. */
export function toCategoriesListQuery(p: CategoriesPageParams): CategoriesListParams {
  return {
    page: p.page,
    page_size: CATEGORIES_PAGE_SIZE,
    q: p.q || undefined,
    status: p.status !== 'all' ? p.status : undefined
  };
}
