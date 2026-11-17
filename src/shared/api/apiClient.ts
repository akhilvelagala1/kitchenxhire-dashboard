import axios, { AxiosError } from 'axios';
import { env } from '@/config/env';
import { getAccessToken } from '@/shared/auth/tokenStorage';
import { ApiError, type FieldErrors } from './errors';
import type { ApiEnvelope, ListQuery, Paginated, PageMeta } from './types';

interface ErrorBody {
  success: false;
  error?: { code?: string; message?: string; fields?: FieldErrors };
}

const http = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15_000
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ErrorBody>) => {
    const body = err.response?.data?.error;
    return Promise.reject(
      new ApiError({
        status: err.response?.status,
        code: body?.code ?? (err.response ? 'HTTP_ERROR' : 'NETWORK_ERROR'),
        message:
          body?.message ??
          (err.response
            ? 'The server could not complete the request.'
            : 'Network error. Check your connection.'),
        fieldErrors: body?.fields
      })
    );
  }
);

/** Drops undefined/empty values so the URL only carries active filters. */
function compact(query: object): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  );
}

export const apiClient = {
  async get<T>(url: string, params?: object): Promise<T> {
    const res = await http.get<ApiEnvelope<T>>(url, { params: params && compact(params) });
    return res.data.data;
  },

  async list<T>(url: string, query: ListQuery): Promise<Paginated<T>> {
    const res = await http.get<ApiEnvelope<T[], PageMeta>>(url, { params: compact(query) });
    return {
      items: res.data.data,
      meta: res.data.meta ?? {
        page: query.page,
        page_size: query.page_size,
        total: res.data.data.length
      }
    };
  },

  async post<T>(url: string, body?: unknown, opts?: { idempotencyKey?: string }): Promise<T> {
    const headers = opts?.idempotencyKey ? { 'Idempotency-Key': opts.idempotencyKey } : undefined;
    const res = await http.post<ApiEnvelope<T>>(url, body, { headers });
    return res.data.data;
  },

  async patch<T>(url: string, body: unknown): Promise<T> {
    const res = await http.patch<ApiEnvelope<T>>(url, body);
    return res.data.data;
  },

  async delete(url: string): Promise<void> {
    await http.delete(url, { transformResponse: [(d) => d] });
  },

  async upload<T>(url: string, file: File, fields?: Record<string, string>): Promise<T> {
    const form = new FormData();
    form.append('file', file);
    Object.entries(fields ?? {}).forEach(([k, v]) => form.append(k, v));
    const res = await http.post<ApiEnvelope<T>>(url, form, { timeout: 120_000 });
    return res.data.data;
  }
};
