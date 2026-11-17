/** Success envelope from kitchenxhire-backend-go (API-03). */
export interface ApiEnvelope<T, M = undefined> {
  success: true;
  data: T;
  meta?: M;
}

export interface PageMeta {
  page: number;
  page_size: number;
  total: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export type SortDirection = 'asc' | 'desc';

/** Query string every list endpoint accepts (API-05). Keys are snake_case on the wire. */
export interface ListQuery {
  page: number;
  page_size: number;
  search?: string;
  sort?: string;
  order?: SortDirection;
  from?: string;
  to?: string;
  include_deleted?: boolean;
  [filter: string]: string | number | boolean | undefined;
}

type JobStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

/** Server-side import/export job. Large files are parsed and built on the server, never in the tab. */
export interface Job {
  id: string;
  kind: 'IMPORT' | 'EXPORT';
  status: JobStatus;
  progress_percent: number;
  dry_run: boolean;
  summary: { total: number; created: number; updated: number; failed: number } | null;
  result_url: string | null;
  error_report_url: string | null;
  error_message: string | null;
}
