import { beforeEach, describe, expect, it } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { SETTINGS_FIXTURE } from '../src/modules/hire-admin/components/settingsFixture.ts';
import { SETTINGS_LOGO_MAX_BYTES } from '../src/modules/hire-admin/schemas/adminSettings.ts';
import { handleAdminSettingsMock } from './mockAdminSettingsApi.ts';
import { resetIntegrationsSettings } from './settingsIntegrationsMockData.ts';
import { resetSettingsStore } from './settingsMockData.ts';
import { resetNotificationsSettings } from './settingsNotificationsMockData.ts';
import { resetActiveSessions, resetSecuritySettings } from './settingsSecurityMockData.ts';
import { resetUsersRolesSettings } from './settingsUsersRolesMockData.ts';

/** Calls the handler with a tiny fake request (the body as one chunk) and response, and parses what it wrote. */
async function call(method: string, target: string, body?: unknown) {
  const url = new URL(target, 'http://localhost');
  const chunks =
    body === undefined ? [] : [Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body))];
  const req = {
    async *[Symbol.asyncIterator]() {
      yield* chunks;
    }
  };
  const res = {
    statusCode: 200,
    text: '',
    setHeader: () => undefined,
    end(chunk?: string) {
      this.text = chunk ?? '';
    }
  };
  const handled = await handleAdminSettingsMock(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
    url.pathname,
    method
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

const BASE = '/hire/admin/settings';
const LOGO = `${BASE}/logo`;
const USERS_ROLES = `${BASE}/users-roles`;
const NOTIFICATIONS = `${BASE}/notifications`;
const INTEGRATIONS = `${BASE}/integrations`;
const SECURITY = `${BASE}/security`;
const SECURITY_LOGIN_HISTORY = `${SECURITY}/login-history`;
const SECURITY_SESSIONS = `${SECURITY}/sessions`;
const AUDIT_LOGS = `${BASE}/audit-logs`;
const BOUNDARY = '----KitchenXTestBoundary7MA4YWxk';

interface Part {
  name: string;
  content: Buffer | string;
  filename?: string;
  type?: string;
}

/** A multipart/form-data body the way a browser writes it, one part per entry. */
function multipart(parts: Part[]): Buffer {
  const chunks = parts.flatMap(({ name, content, filename, type }) => [
    Buffer.from(
      `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"` +
        `${filename ? `; filename="${filename}"` : ''}\r\n` +
        `${type ? `Content-Type: ${type}\r\n` : ''}\r\n`
    ),
    typeof content === 'string' ? Buffer.from(content) : content,
    Buffer.from('\r\n')
  ]);
  return Buffer.concat([...chunks, Buffer.from(`--${BOUNDARY}--\r\n`)]);
}

const logoBody = (content: Buffer, type = 'image/png') =>
  multipart([{ name: 'file', filename: 'logo.png', type, content }]);

/** Every byte value, with the line breaks and dashes a multipart parser could trip over. */
const BINARY = Buffer.concat([
  Buffer.from(Array.from({ length: 256 }, (_, byte) => byte)),
  Buffer.from('\r\n\r\n--\r\n--not-the-boundary\r\n')
]);

const BAD_FIELDS = [
  { field: 'platform_name', value: 'A' },
  { field: 'platform_name', value: 'x'.repeat(61) },
  { field: 'support_phone', value: '12345' },
  { field: 'support_phone', value: '5878543210' },
  { field: 'support_email', value: 'not-an-email' },
  { field: 'support_email', value: '' },
  { field: 'timezone', value: 'Europe/Paris' },
  { field: 'default_job_expiry_days', value: 0 },
  { field: 'default_job_expiry_days', value: 366 },
  { field: 'default_job_expiry_days', value: 2.5 },
  { field: 'default_job_expiry_days', value: '30' },
  { field: 'data_retention_months', value: 7 },
  { field: 'multi_business', value: 'yes' },
  { field: 'enable_outlets', value: 1 },
  { field: 'self_registration', value: null },
  { field: 'business_verification', value: 'true' },
  { field: 'interview_scheduling', value: 0 },
  { field: 'application_approval', value: [] },
  { field: 'auto_match_candidates', value: {} },
  { field: 'allow_data_export', value: 'on' },
  { field: 'archive_inactive_records', value: 'off' }
];

describe('admin settings mock API: reading and changing', () => {
  beforeEach(() => {
    resetSettingsStore();
    resetUsersRolesSettings();
    resetNotificationsSettings();
    resetIntegrationsSettings();
    resetSecuritySettings();
    resetActiveSessions();
  });

  it('answers GET with the whole settings of the picture', async () => {
    const { handled, status, json } = await call('GET', BASE);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(SETTINGS_FIXTURE);
  });

  it('changes only the fields a PATCH sends, and answers with the whole settings', async () => {
    const { status, json } = await call('PATCH', BASE, {
      platform_name: 'KitchenX Careers',
      self_registration: true,
      default_job_expiry_days: 45
    });

    expect(status).toBe(200);
    expect(json.data).toEqual({
      ...SETTINGS_FIXTURE,
      platform_name: 'KitchenX Careers',
      self_registration: true,
      default_job_expiry_days: 45
    });
  });

  it('keeps what was saved between calls', async () => {
    await call('PATCH', BASE, { timezone: 'UTC', allow_data_export: false });
    await call('PATCH', BASE, { data_retention_months: 36 });
    const { json } = await call('GET', BASE);

    expect(json.data).toEqual({
      ...SETTINGS_FIXTURE,
      timezone: 'UTC',
      allow_data_export: false,
      data_retention_months: 36
    });
  });

  it('trims text and stores the phone as 10 digits, or empty', async () => {
    const first = await call('PATCH', BASE, {
      platform_name: '  Hire Hub  ',
      support_phone: '+91 98765 43210'
    });
    const second = await call('PATCH', BASE, { support_phone: '' });

    expect(first.json.data).toMatchObject({
      platform_name: 'Hire Hub',
      support_phone: '9876543210'
    });
    expect(second.json.data.support_phone).toBe('');
  });

  it('treats an empty PATCH as no change', async () => {
    const { status, json } = await call('PATCH', BASE, {});

    expect(status).toBe(200);
    expect(json.data).toEqual(SETTINGS_FIXTURE);
  });

  it.each(BAD_FIELDS)('rejects $field = $value with 422 and names the field', async (bad) => {
    const { status, json } = await call('PATCH', BASE, { [bad.field]: bad.value });

    expect(status).toBe(422);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(json.error.fields)).toEqual([bad.field]);
    expect(json.error.fields[bad.field]).toEqual(expect.any(String));
  });

  it('refuses the whole PATCH when one field is bad, and changes nothing', async () => {
    const bad = await call('PATCH', BASE, { platform_name: 'Changed', support_email: 'bad' });

    expect(bad.status).toBe(422);
    expect(Object.keys(bad.json.error.fields)).toEqual(['support_email']);
    expect((await call('GET', BASE)).json.data).toEqual(SETTINGS_FIXTURE);
  });

  it('rejects unknown keys, logo_url and the form-only logo_file with 422', async () => {
    for (const key of ['bogus', 'logo_url', 'logo_file']) {
      const { status, json } = await call('PATCH', BASE, { [key]: 'https://example.com/logo.png' });

      expect(status).toBe(422);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(Object.keys(json.error.fields)).toEqual([key]);
    }
    expect((await call('GET', BASE)).json.data).toEqual(SETTINGS_FIXTURE);
  });

  it('rejects a body that is not a JSON object with 422', async () => {
    for (const body of [null, [1, 2], 'text']) {
      const { status, json } = await call('PATCH', BASE, body);

      expect(status).toBe(422);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('returns the Users & Roles Settings payload', async () => {
    const { handled, status, json } = await call('GET', USERS_ROLES);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.data.users).toHaveLength(3);
    expect(json.data.roles.map((role: { name: string }) => role.name)).toEqual([
      'Admin',
      'Recruiter',
      'User'
    ]);
    expect(json.data.session_timeout_minutes).toBe(60);
  });

  it('replaces Users & Roles Settings on PATCH and keeps the change', async () => {
    const { json: current } = await call('GET', USERS_ROLES);
    const next = {
      ...current.data,
      two_factor_auth: false,
      session_timeout_minutes: 45,
      ip_access_restriction: true
    };

    const { status, json } = await call('PATCH', USERS_ROLES, next);
    expect(status).toBe(200);
    expect(json.data.two_factor_auth).toBe(false);
    expect(json.data.session_timeout_minutes).toBe(45);

    const { json: again } = await call('GET', USERS_ROLES);
    expect(again.data.ip_access_restriction).toBe(true);
  });

  it('returns the Notifications Settings payload', async () => {
    const { handled, status, json } = await call('GET', NOTIFICATIONS);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.data.channels.email).toBe(true);
    expect(json.data.channels.whatsapp).toBe(false);
    expect(json.data.retry_attempts).toBe(3);
    expect(json.data.priority).toBe('High');
  });

  it('replaces Notifications Settings on PATCH and keeps the change', async () => {
    const { json: current } = await call('GET', NOTIFICATIONS);
    const next = {
      ...current.data,
      channels: { ...current.data.channels, push: true },
      priority: 'Urgent'
    };

    const { status, json } = await call('PATCH', NOTIFICATIONS, next);
    expect(status).toBe(200);
    expect(json.data.channels.push).toBe(true);
    expect(json.data.priority).toBe('Urgent');

    const { json: again } = await call('GET', NOTIFICATIONS);
    expect(again.data.priority).toBe('Urgent');
  });

  it('returns the Integrations Settings payload', async () => {
    const { handled, status, json } = await call('GET', INTEGRATIONS);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.data.integrations.smtp.status).toBe('connected');
    expect(json.data.integrations.whatsapp.status).toBe('not_connected');
    expect(json.data.webhook.enabled).toBe(true);
    expect(json.data.webhook.url).toBe('https://your-domain.com/webhook');
    expect(json.data.webhook.events.job_created).toBe(true);
  });

  it('replaces Integrations Settings on PATCH and keeps the change', async () => {
    const { json: current } = await call('GET', INTEGRATIONS);
    const next = {
      ...current.data,
      integrations: {
        ...current.data.integrations,
        whatsapp: { status: 'connected', detail: '+91 98765 43210' }
      },
      webhook: { ...current.data.webhook, url: 'https://kitchenx.example.com/hooks' }
    };

    const { status, json } = await call('PATCH', INTEGRATIONS, next);
    expect(status).toBe(200);
    expect(json.data.integrations.whatsapp.status).toBe('connected');
    expect(json.data.webhook.url).toBe('https://kitchenx.example.com/hooks');

    const { json: again } = await call('GET', INTEGRATIONS);
    expect(again.data.integrations.whatsapp.status).toBe('connected');
  });

  it('refuses a webhook URL that is not https while the webhook is on', async () => {
    const { json: current } = await call('GET', INTEGRATIONS);
    const next = { ...current.data, webhook: { ...current.data.webhook, url: 'not-a-url' } };

    const { status, json } = await call('PATCH', INTEGRATIONS, next);
    expect(status).toBe(422);
    expect(json.error.fields['webhook.url']).toBeTruthy();
  });

  it('returns the Security Settings payload', async () => {
    const { handled, status, json } = await call('GET', SECURITY);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.data.two_factor_auth).toBe(true);
    expect(json.data.session_timeout).toBe('30 minutes');
    expect(json.data.password_policy.min_length).toBe(8);
  });

  it('replaces Security Settings on PATCH and keeps the change', async () => {
    const { json: current } = await call('GET', SECURITY);
    const next = { ...current.data, ip_restriction: true, failed_login_attempts: '10 attempts' };

    const { status, json } = await call('PATCH', SECURITY, next);
    expect(status).toBe(200);
    expect(json.data.ip_restriction).toBe(true);
    expect(json.data.failed_login_attempts).toBe('10 attempts');

    const { json: again } = await call('GET', SECURITY);
    expect(again.data.ip_restriction).toBe(true);
  });

  it('refuses an out-of-range password policy field', async () => {
    const { json: current } = await call('GET', SECURITY);
    const next = {
      ...current.data,
      password_policy: { ...current.data.password_policy, reuse_count: 99 }
    };

    const { status, json } = await call('PATCH', SECURITY, next);
    expect(status).toBe(422);
    expect(json.error.fields['password_policy.reuse_count']).toBeTruthy();
  });

  it('returns Login History newest first, including a failed attempt', async () => {
    const { handled, status, json } = await call('GET', SECURITY_LOGIN_HISTORY);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.some((entry: { result: string }) => entry.result === 'failed')).toBe(true);
  });

  it('returns Active Sessions and revokes a non-current one', async () => {
    const { json: list } = await call('GET', SECURITY_SESSIONS);
    const target = list.data.find((session: { is_current: boolean }) => !session.is_current);

    const { status, json } = await call('POST', `${SECURITY_SESSIONS}/${target.id}/revoke`);
    expect(status).toBe(200);
    expect(json.data.some((session: { id: string }) => session.id === target.id)).toBe(false);
  });

  it('refuses to revoke the current session', async () => {
    const { json: list } = await call('GET', SECURITY_SESSIONS);
    const current = list.data.find((session: { is_current: boolean }) => session.is_current);

    const { status } = await call('POST', `${SECURITY_SESSIONS}/${current.id}/revoke`);
    expect(status).toBe(422);
  });

  it('returns the Audit & Logs payload', async () => {
    const { handled, status, json } = await call('GET', AUDIT_LOGS);

    expect(handled).toBe(true);
    expect(status).toBe(200);
    expect(json.data).toHaveLength(5);
    expect(json.meta).toEqual({ page: 1, page_size: 25, total: 248 });
  });

  it.each([
    ['GET', LOGO],
    ['PUT', BASE],
    ['POST', BASE],
    ['DELETE', BASE],
    ['PATCH', LOGO],
    ['GET', `${BASE}/other`],
    ['PUT', SECURITY],
    ['DELETE', SECURITY_LOGIN_HISTORY],
    ['PATCH', SECURITY_SESSIONS],
    ['GET', `${SECURITY_SESSIONS}/abc/revoke`]
  ])('does not serve %s %s', async (method, path) => {
    const { handled, json } = await call(method, path, {});

    expect(handled).toBe(false);
    expect(json).toBeUndefined();
  });
});

describe('admin settings mock API: logo upload', () => {
  beforeEach(resetSettingsStore);

  it('keeps a PNG as a data URL, answers with the whole settings, and keeps it for later calls', async () => {
    const { status, json } = await call('POST', LOGO, logoBody(BINARY));

    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ ...SETTINGS_FIXTURE, logo_url: expect.any(String) });
    const [header, encoded] = String(json.data.logo_url).split(',');
    expect(header).toBe('data:image/png;base64');
    expect(Buffer.from(encoded ?? '', 'base64').equals(BINARY)).toBe(true);

    await call('PATCH', BASE, { platform_name: 'Hire Hub' });
    const later = await call('GET', BASE);
    expect(later.json.data).toEqual({
      ...SETTINGS_FIXTURE,
      platform_name: 'Hire Hub',
      logo_url: json.data.logo_url
    });
  });

  it('accepts a JPEG', async () => {
    const { status, json } = await call('POST', LOGO, logoBody(Buffer.from('jpeg'), 'image/jpeg'));

    expect(status).toBe(200);
    expect(json.data.logo_url).toBe(
      `data:image/jpeg;base64,${Buffer.from('jpeg').toString('base64')}`
    );
  });

  it('accepts a file of exactly 2 MB', async () => {
    const { status } = await call('POST', LOGO, logoBody(Buffer.alloc(SETTINGS_LOGO_MAX_BYTES, 7)));

    expect(status).toBe(200);
  });

  it('answers 413 with a clear message above 2 MB, and keeps the logo it had', async () => {
    const { status, json } = await call(
      'POST',
      LOGO,
      logoBody(Buffer.alloc(SETTINGS_LOGO_MAX_BYTES + 1, 7))
    );

    expect(status).toBe(413);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('PAYLOAD_TOO_LARGE');
    expect(json.error.message).toBe('The logo must be 2 MB or smaller.');
    expect(json.error.fields.file).toBe('The logo must be 2 MB or smaller');
    expect((await call('GET', BASE)).json.data.logo_url).toBeNull();
  });

  it.each(['image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', ''])(
    'rejects the type "%s" with 422, and keeps the logo it had',
    async (type) => {
      await call('POST', LOGO, logoBody(Buffer.from('first')));
      const kept = (await call('GET', BASE)).json.data.logo_url;

      const { status, json } = await call('POST', LOGO, logoBody(Buffer.from('second'), type));

      expect(status).toBe(422);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.fields.file).toBe('Use a PNG or JPG image');
      expect((await call('GET', BASE)).json.data.logo_url).toBe(kept);
    }
  );

  it('rejects an empty file with 422', async () => {
    const { status, json } = await call('POST', LOGO, logoBody(Buffer.alloc(0)));

    expect(status).toBe(422);
    expect(json.error.fields.file).toBe('The file is empty');
  });

  it.each([
    ['a body with no file part', multipart([{ name: 'note', content: 'hello' }])],
    ['a body that is not multipart', Buffer.from(JSON.stringify({ file: 'logo.png' }))],
    ['an empty body', Buffer.alloc(0)]
  ])('rejects %s with 422', async (_name, body) => {
    const { status, json } = await call('POST', LOGO, body);

    expect(status).toBe(422);
    expect(json.error.fields.file).toBe('Choose a PNG or JPG image');
  });

  it('finds the file among other parts, even when another part has the file name "file"', async () => {
    const body = multipart([
      { name: 'note', filename: 'file', type: 'text/plain', content: 'not the logo' },
      { name: 'file', filename: 'logo.png', type: 'image/png', content: 'the logo' }
    ]);

    const { status, json } = await call('POST', LOGO, body);

    expect(status).toBe(200);
    expect(json.data.logo_url).toBe(
      `data:image/png;base64,${Buffer.from('the logo').toString('base64')}`
    );
  });
});
