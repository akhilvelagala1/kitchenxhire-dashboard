import type { IncomingMessage, ServerResponse } from 'node:http';

const MOCK_STAFF = { email: 'admin@kitchenx.in', password: 'Admin@123' };
const staffTokens = new Map<string, { user_id: string; role: string }>();

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const ok = (res: ServerResponse, data: unknown) => send(res, 200, { success: true, data });

function readBearer(req: IncomingMessage): string | null {
  const raw = req.headers.authorization;
  if (!raw?.startsWith('Bearer ')) return null;
  return raw.slice('Bearer '.length).trim() || null;
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString();
  try {
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function handleStaffAuthMock(
  req: IncomingMessage,
  res: ServerResponse,
  path: string,
  method: string
): Promise<boolean> {
  if (path === '/auth/login' && method === 'POST') {
    const body = await readJson(req);
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');
    if (email === MOCK_STAFF.email && password === MOCK_STAFF.password) {
      const access_token = crypto.randomUUID();
      staffTokens.set(access_token, { user_id: 'dev-admin', role: 'PLATFORM_ADMIN' });
      ok(res, { access_token, user_id: 'dev-admin', role: 'PLATFORM_ADMIN' });
      return true;
    }
    send(res, 401, {
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' }
    });
    return true;
  }

  if (path === '/auth/me' && method === 'GET') {
    const token = readBearer(req);
    const session = token ? staffTokens.get(token) : undefined;
    if (!session) {
      send(res, 401, {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Sign in required.' }
      });
      return true;
    }
    ok(res, {
      user_id: session.user_id,
      role: session.role,
      permissions: ['*', 'hire.admin.view', 'hire.admin.manage']
    });
    return true;
  }

  return false;
}
