import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ListQuery } from '../src/shared/api/types.ts';
import { invalid, ok, readJson } from './categoriesHttp.ts';
import { getAuditLogs } from './settingsAuditLogsMockData.ts';
import {
  getSettings,
  setSettingsLogo,
  updateSettings,
  validateSettingsPatch
} from './settingsMockData.ts';
import {
  getIntegrationsSettings,
  replaceIntegrationsSettings,
  validateIntegrationsBody
} from './settingsIntegrationsMockData.ts';
import {
  getNotificationsSettings,
  replaceNotificationsSettings,
  validateNotificationsBody
} from './settingsNotificationsMockData.ts';
import {
  getActiveSessions,
  getLoginHistory,
  getSecuritySettings,
  replaceSecuritySettings,
  revokeActiveSession,
  validateSecurityBody
} from './settingsSecurityMockData.ts';
import {
  getUsersRolesSettings,
  replaceUsersRolesSettings,
  validateUsersRolesBody
} from './settingsUsersRolesMockData.ts';

const BASE = '/hire/admin/settings';
const USERS_ROLES = `${BASE}/users-roles`;
const NOTIFICATIONS = `${BASE}/notifications`;
const INTEGRATIONS = `${BASE}/integrations`;
const SECURITY = `${BASE}/security`;
const SECURITY_LOGIN_HISTORY = `${SECURITY}/login-history`;
const SECURITY_SESSIONS = `${SECURITY}/sessions`;
const SECURITY_SESSION_REVOKE = /^\/hire\/admin\/settings\/security\/sessions\/([^/]+)\/revoke$/;
const AUDIT_LOGS = `${BASE}/audit-logs`;
const LOGO_TYPES = ['image/png', 'image/jpeg'];
const LOGO_MAX_BYTES = 2 * 1024 * 1024;

const NO_FILE = 'Choose a PNG or JPG image';
const WRONG_TYPE = 'Use a PNG or JPG image';
const EMPTY_FILE = 'The file is empty';
const TOO_BIG = 'The logo must be 2 MB or smaller';

interface UploadedFile {
  type: string;
  bytes: Buffer;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function listQuery(url: URL): ListQuery {
  const params = Object.fromEntries(url.searchParams);
  return {
    ...params,
    page: Number(params.page ?? 1),
    page_size: Number(params.page_size ?? 25)
  };
}

/** 413 in the same JSON shape as the other mock errors (categoriesHttp has no helper for it). */
function tooLarge(res: ServerResponse, message: string) {
  res.statusCode = 413;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      success: false,
      error: { code: 'PAYLOAD_TOO_LARGE', message: `${message}.`, fields: { file: message } }
    })
  );
}

async function readBytes(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

/**
 * The part named "file" of a multipart body, as bytes and the type the sender gave it. The boundary is
 * the first line of the body. Undefined when the body is not multipart or has no such part.
 */
function filePart(raw: Buffer): UploadedFile | undefined {
  const firstLine = raw.indexOf('\r\n');
  if (firstLine < 0 || raw.toString('latin1', 0, 2) !== '--') return undefined;
  const delimiter = Buffer.from(`\r\n${raw.toString('latin1', 0, firstLine)}`, 'latin1');
  let start = firstLine + 2;
  for (;;) {
    const headEnd = raw.indexOf('\r\n\r\n', start);
    const end = headEnd < 0 ? -1 : raw.indexOf(delimiter, headEnd + 4);
    if (end < 0) return undefined;
    const head = raw.toString('latin1', start, headEnd);
    if (/;\s*name="file"/i.test(head)) {
      const type = /^content-type:\s*([^\s;]+)/im.exec(head)?.[1];
      return { type: type?.toLowerCase() ?? '', bytes: raw.subarray(headEnd + 4, end) };
    }
    start = end + delimiter.length + 2;
  }
}

/**
 * GET and PATCH /hire/admin/settings and POST /hire/admin/settings/logo (multipart, one part named
 * "file"). Every answer carries the whole settings. Returns false for a route it does not know.
 */
export async function handleAdminSettingsMock(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  method: string
): Promise<boolean> {
  if (path === BASE && method === 'GET') {
    ok(res, getSettings());
    return true;
  }

  if (path === BASE && method === 'PATCH') {
    const body = await readJson(req);
    if (!isRecord(body)) {
      invalid(res, 'Send the settings to change as a JSON object.', {});
      return true;
    }
    const { patch, fields } = validateSettingsPatch(body);
    if (Object.keys(fields).length > 0) invalid(res, 'Check the highlighted fields.', fields);
    else ok(res, updateSettings(patch));
    return true;
  }

  if (path === `${BASE}/logo` && method === 'POST') {
    const file = filePart(await readBytes(req));
    if (!file) invalid(res, `${NO_FILE}.`, { file: NO_FILE });
    else if (!LOGO_TYPES.includes(file.type)) invalid(res, `${WRONG_TYPE}.`, { file: WRONG_TYPE });
    else if (file.bytes.length === 0) invalid(res, `${EMPTY_FILE}.`, { file: EMPTY_FILE });
    else if (file.bytes.length > LOGO_MAX_BYTES) tooLarge(res, TOO_BIG);
    else ok(res, setSettingsLogo(`data:${file.type};base64,${file.bytes.toString('base64')}`));
    return true;
  }

  if (path === USERS_ROLES && method === 'GET') {
    ok(res, getUsersRolesSettings());
    return true;
  }

  if (path === USERS_ROLES && method === 'PATCH') {
    const body = await readJson(req);
    const { value, fields } = validateUsersRolesBody(body);
    if (!value || Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    ok(res, replaceUsersRolesSettings(value));
    return true;
  }

  if (path === NOTIFICATIONS && method === 'GET') {
    ok(res, getNotificationsSettings());
    return true;
  }

  if (path === NOTIFICATIONS && method === 'PATCH') {
    const body = await readJson(req);
    const { value, fields } = validateNotificationsBody(body);
    if (!value || Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    ok(res, replaceNotificationsSettings(value));
    return true;
  }

  if (path === INTEGRATIONS && method === 'GET') {
    ok(res, getIntegrationsSettings());
    return true;
  }

  if (path === INTEGRATIONS && method === 'PATCH') {
    const body = await readJson(req);
    const { value, fields } = validateIntegrationsBody(body);
    if (!value || Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    ok(res, replaceIntegrationsSettings(value));
    return true;
  }

  if (path === SECURITY && method === 'GET') {
    ok(res, getSecuritySettings());
    return true;
  }

  if (path === SECURITY && method === 'PATCH') {
    const body = await readJson(req);
    const { value, fields } = validateSecurityBody(body);
    if (!value || Object.keys(fields).length > 0) {
      invalid(res, 'Check the highlighted fields.', fields);
      return true;
    }
    ok(res, replaceSecuritySettings(value));
    return true;
  }

  if (path === SECURITY_LOGIN_HISTORY && method === 'GET') {
    ok(res, getLoginHistory());
    return true;
  }

  if (path === SECURITY_SESSIONS && method === 'GET') {
    ok(res, getActiveSessions());
    return true;
  }

  const revokeMatch = SECURITY_SESSION_REVOKE.exec(path);
  if (revokeMatch && method === 'POST') {
    const remaining = revokeActiveSession(revokeMatch[1]!);
    if (!remaining) invalid(res, 'That session cannot be revoked.', { id: 'Not found or current' });
    else ok(res, remaining);
    return true;
  }

  if (path === AUDIT_LOGS && method === 'GET') {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const { items, page, page_size, total } = getAuditLogs(listQuery(url));
    ok(res, items, { page, page_size, total });
    return true;
  }

  return false;
}
