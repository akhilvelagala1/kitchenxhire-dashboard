import { describe, expect, it } from 'vitest';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getHireJobAudit } from './jobAudit.ts';
import { handleAdminJobsMock } from './mockAdminJobsApi.ts';

/** Calls the handler with a tiny fake request and response, and parses what it wrote. */
async function call(method: string, target: string, body?: unknown) {
  const url = new URL(target, 'http://localhost');
  const payload = body === undefined ? [] : [Buffer.from(JSON.stringify(body))];
  const req = Readable.from(payload);
  const res = {
    statusCode: 200,
    text: '',
    setHeader: () => undefined,
    end(chunk?: string) {
      this.text = chunk ?? '';
    }
  };
  const handled = await handleAdminJobsMock(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
    url.pathname,
    method,
    url
  );
  return { handled, status: res.statusCode, json: res.text ? JSON.parse(res.text) : undefined };
}

const BASE = '/hire/admin/jobs';
const summary = async () => (await call('GET', `${BASE}/summary`)).json.data;
const validBody = {
  title: 'Cook / Chef',
  job_category: 'Cook / Chef',
  department: 'Kitchen',
  openings: 2,
  city: 'Hyderabad',
  work_location: 'On-site',
  address: '',
  employment_type: 'Full-time',
  salary_min: 18000,
  salary_max: 25000,
  work_shift: 'Day',
  experience_required: '1-2 years',
  description: 'Run the hot line.',
  responsibilities: 'Prep and cook.',
  requirements: 'Food safety basics.',
  skills: ['Tandoor'],
  application_deadline: '2099-01-01',
  visibility: 'public',
  status: 'active'
};

describe('admin jobs mock API: post a job', () => {
  it('creates a published job, puts it first in the list and counts it in the summary', async () => {
    const before = await summary();
    const { status, json } = await call('POST', BASE, validBody);

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      job_id: expect.stringMatching(/^JOB\d{5}$/),
      title: 'Cook / Chef',
      recruiter_name: 'Platform Admin',
      business_name: 'KitchenX Platform',
      category: 'Kitchen',
      job_category_label: 'Cook / Chef',
      location: 'Hyderabad',
      applications_count: 0,
      recruited_count: 0,
      status: 'active'
    });
    expect(Number.isNaN(Date.parse(json.data.posted_at))).toBe(false);
    expect((await call('GET', BASE)).json.data[0].job_id).toBe(json.data.job_id);
    const after = await summary();
    expect(after.total_jobs).toBe(before.total_jobs + 1);
    expect(after.active_jobs).toBe(before.active_jobs + 1);
    expect(getHireJobAudit(json.data.job_id).map((e) => e.action)).toEqual(['CREATED']);
  });

  it('accepts a draft with only a title', async () => {
    const before = await summary();
    const { status, json } = await call('POST', BASE, { title: 'Sous Chef', status: 'draft' });

    expect(status).toBe(200);
    expect(json.data).toMatchObject({
      title: 'Sous Chef',
      status: 'draft',
      job_category_label: '—',
      location: '—'
    });
    expect((await summary()).draft_jobs).toBe(before.draft_jobs + 1);
  });

  it('gives every new job its own id, above the ones already in the store', async () => {
    const first = (await call('POST', BASE, validBody)).json.data.job_id;
    const second = (await call('POST', BASE, validBody)).json.data.job_id;

    expect(first).not.toBe(second);
    expect(Number(second.slice(3))).toBe(Number(first.slice(3)) + 1);
    expect(Number(first.slice(3))).toBeGreaterThan(10293);
    expect((await call('GET', `${BASE}/${second}`)).json.data.job_id).toBe(second);
  });

  it('files a label it does not know under Others, so the category counts still add up', async () => {
    const others = async () =>
      (await call('GET', `${BASE}/categories`)).json.data.find(
        (c: { label: string }) => c.label === 'Others'
      ).count;
    const before = await others();
    const { json } = await call('POST', BASE, { ...validBody, job_category: 'Mystery role' });

    expect(json.data).toMatchObject({ job_category_label: 'Others', category: 'Operations' });
    expect(await others()).toBe(before + 1);
  });

  it('answers 422 with a fields map for an empty or short title', async () => {
    for (const title of ['', ' ', ' a ']) {
      const { status, json } = await call('POST', BASE, { ...validBody, title });

      expect(status).toBe(422);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_FAILED');
      expect(json.error.fields.title).toEqual(expect.any(String));
    }
    expect((await call('POST', BASE, {})).json.error.fields.title).toEqual(expect.any(String));
  });

  it('answers 422 for a published job without a city or a category', async () => {
    const noCity = await call('POST', BASE, { ...validBody, city: ' ' });
    const noCategory = await call('POST', BASE, { ...validBody, job_category: '' });

    expect(noCity.status).toBe(422);
    expect(Object.keys(noCity.json.error.fields)).toEqual(['city']);
    expect(noCategory.status).toBe(422);
    expect(Object.keys(noCategory.json.error.fields)).toEqual(['job_category']);
  });

  it('answers 422 for a status that is neither draft nor active', async () => {
    for (const status of ['paused', 'closed', undefined]) {
      const res = await call('POST', BASE, { ...validBody, status });

      expect(res.status).toBe(422);
      expect(res.json.error.fields.status).toEqual(expect.any(String));
    }
  });

  it('does not store a job when the body is rejected', async () => {
    const before = await summary();
    await call('POST', BASE, { ...validBody, title: '' });

    expect((await summary()).total_jobs).toBe(before.total_jobs);
  });

  it('still serves the summary, bulk and the other job routes', async () => {
    const summaryRes = await call('GET', `${BASE}/summary`);
    expect(summaryRes.handled).toBe(true);
    expect(summaryRes.json.data.total_jobs).toEqual(expect.any(Number));

    const created = (await call('POST', BASE, validBody)).json.data.job_id;
    const before = await summary();
    const bulk = await call('POST', `${BASE}/bulk`, { action: 'pause', job_ids: [created] });

    expect(bulk.json.data).toEqual({ affected: 1 });
    expect((await summary()).total_jobs).toBe(before.total_jobs);
    expect((await call('GET', `${BASE}/${created}`)).json.data.status).toBe('paused');
    expect((await call('GET', `${BASE}/trend`)).handled).toBe(true);
    expect((await call('GET', `${BASE}/categories`)).handled).toBe(true);
    expect((await call('PUT', BASE, {})).handled).toBe(false);
  });
});
