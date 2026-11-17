/** Response helpers and body reading shared by the Categories and Roles mock handlers. */
import type { IncomingMessage, ServerResponse } from 'node:http';

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export const ok = (res: ServerResponse, data: unknown, meta?: unknown) =>
  send(res, 200, { success: true, data, meta });

const fail = (
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
  fields?: object
) => send(res, status, { success: false, error: { code, message, fields } });

export const notFound = (res: ServerResponse, what: string) =>
  fail(res, 404, 'NOT_FOUND', `${what} not found.`);

export const forbidden = (res: ServerResponse, message: string) =>
  fail(res, 403, 'FORBIDDEN', message);

export const conflict = (res: ServerResponse, message: string, fields?: Record<string, string>) =>
  fail(res, 409, 'CONFLICT', message, fields);

export const invalid = (res: ServerResponse, message: string, fields: Record<string, string>) =>
  fail(res, 422, 'VALIDATION_ERROR', message, fields);

export async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    const raw = Buffer.concat(chunks).toString();
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** The page and filter parameters of a list URL, as the list functions expect them. */
export function listParams(url: URL, defaultPageSize: number) {
  const params = Object.fromEntries(url.searchParams);
  return {
    q: params.q ?? params.search,
    status: params.status,
    sort: params.sort,
    order: params.order,
    page: Number(params.page ?? 1),
    page_size: Number(params.page_size ?? defaultPageSize)
  };
}
