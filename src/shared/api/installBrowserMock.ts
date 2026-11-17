/**
 * Static-host demo only (GitHub Pages): routes axios through the same in-memory
 * handlers as `dev/mockApi.ts`. Local `npm run dev` still uses the Vite plugin.
 */
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Buffer } from 'buffer';
import { handleMockApiRequest } from 'virtual:browser-mock';

(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;

/** Minimal shims — enough for `dev/mockApi` handlers without Node types in the app build. */
type MockReq = {
  method?: string;
  url?: string;
  headers: Record<string, string>;
  [Symbol.asyncIterator](): AsyncGenerator<Buffer, void, unknown>;
};

type MockRes = {
  statusCode: number;
  body: string;
  setHeader(key: string, value: string | number | readonly string[]): void;
  getHeader(key: string): string | undefined;
  end(chunk?: unknown): void;
};

function headerMap(config: InternalAxiosRequestConfig): Record<string, string> {
  const out: Record<string, string> = {};
  const headers = config.headers;
  if (!headers || typeof headers !== 'object') return out;
  const raw =
    typeof headers.toJSON === 'function'
      ? headers.toJSON()
      : (headers as unknown as Record<string, unknown>);
  for (const [key, value] of Object.entries(raw)) {
    if (value == null) continue;
    out[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  return out;
}

function bodyToBytes(data: unknown): Buffer {
  if (data == null) return Buffer.alloc(0);
  if (typeof data === 'string') return Buffer.from(data);
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer as ArrayBuffer, data.byteOffset, data.byteLength);
  }
  return Buffer.from(JSON.stringify(data));
}

function createReq(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: Buffer
): MockReq {
  let sent = false;
  return {
    method,
    url,
    headers,
    async *[Symbol.asyncIterator]() {
      if (sent || body.length === 0) return;
      sent = true;
      yield body;
    }
  };
}

function createRes(): MockRes {
  const state = { statusCode: 200, body: '' };
  const headers: Record<string, string> = {};
  const res = {
    get statusCode() {
      return state.statusCode;
    },
    set statusCode(code: number) {
      state.statusCode = code;
    },
    setHeader(key: string, value: string | number | readonly string[]) {
      headers[key.toLowerCase()] = String(value);
    },
    getHeader(key: string) {
      return headers[key.toLowerCase()];
    },
    end(chunk?: unknown) {
      if (chunk == null) {
        state.body = '';
        return;
      }
      if (typeof chunk === 'string') {
        state.body = chunk;
        return;
      }
      if (Buffer.isBuffer(chunk)) {
        state.body = chunk.toString('utf8');
        return;
      }
      state.body = String(chunk);
    },
    get body() {
      return state.body;
    }
  };
  return res;
}

function buildPath(config: InternalAxiosRequestConfig): string {
  const base = String(config.baseURL ?? '').replace(/\/$/, '');
  const path = String(config.url ?? '');
  const joined = path.startsWith('http')
    ? path
    : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const url = new URL(joined, 'http://browser-mock.local');
  if (config.params && typeof config.params === 'object') {
    for (const [key, value] of Object.entries(config.params as Record<string, unknown>)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.pathname.startsWith('/api/v1')
    ? `${url.pathname}${url.search}`
    : `/api/v1${url.pathname}${url.search}`;
}

export function installBrowserMock(http: AxiosInstance): void {
  http.defaults.adapter = async (config) => {
    const method = (config.method ?? 'get').toUpperCase();
    const reqUrl = buildPath(config);
    const headers = headerMap(config);
    const body = method === 'GET' || method === 'HEAD' ? Buffer.alloc(0) : bodyToBytes(config.data);
    const req = createReq(method, reqUrl, headers, body);
    const res = createRes();

    const handled = await handleMockApiRequest(
      req as Parameters<typeof handleMockApiRequest>[0],
      res as Parameters<typeof handleMockApiRequest>[1]
    );
    if (!handled) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: { code: 'NOT_FOUND', message: 'No mock for this route.' }
        })
      );
    }

    let data: unknown = res.body;
    const contentType = String(res.getHeader('content-type') ?? '');
    if (contentType.includes('application/json') || (res.body.startsWith('{') && res.body)) {
      try {
        data = JSON.parse(res.body);
      } catch {
        data = res.body;
      }
    }

    const response: AxiosResponse = {
      data,
      status: res.statusCode,
      statusText: res.statusCode >= 400 ? 'Error' : 'OK',
      headers: {},
      config,
      request: {}
    };

    if (res.statusCode >= 400) {
      throw Object.assign(new Error('Browser mock HTTP error'), {
        isAxiosError: true,
        config,
        response,
        toJSON: () => ({})
      });
    }

    return response;
  };
}
