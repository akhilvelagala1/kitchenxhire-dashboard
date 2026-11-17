import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it } from 'vitest';
import { handleHireMock } from './mockHireApi.ts';
import {
  reportsApplicationRows,
  reportsHiredRows,
  reportsRejectedRows
} from './reportsDrilldownLedger.ts';
import { reportsJobRows } from './reportsDrilldownMockData.ts';
import { APPLICATIONS_LIST, JOBS_LIST, matchingRecords } from './reportsDrilldownQuery.ts';
import { BASE, call, fakeResponse, get, idsOf } from './reportsDrilldownTestKit.ts';

/** The rows in which any of the fields holds the needle: the rows a search is meant to find. */
function matches(rows: readonly object[], fields: readonly string[], needle: string) {
  const lower = needle.trim().toLowerCase();
  return rows.filter((row) =>
    fields.some((field) =>
      String((row as Record<string, unknown>)[field] ?? '')
        .toLowerCase()
        .includes(lower)
    )
  );
}

describe('paging', () => {
  it('shows other rows on page 2 than on page 1', () => {
    const first = idsOf(get('applications').json);
    const second = idsOf(get('applications', { page: 2 }).json);

    expect(second).toHaveLength(5);
    expect(second.some((id) => first.includes(id))).toBe(false);
  });

  it('ends on a last page of what is left', () => {
    const { json } = get('jobs', { page: 297 });

    expect(json.meta).toEqual({ page: 297, page_size: 5, total: 1482 });
    expect(json.data).toHaveLength(2);
  });

  it('answers 200 with no rows and the real total for a page past the last', () => {
    const { status, json } = get('hired', { page: 9999 });

    expect(status).toBe(200);
    expect(json.data).toEqual([]);
    expect(json.meta).toEqual({ page: 9999, page_size: 5, total: 590 });
  });

  it.each([5, 10, 20, 50])('gives %s rows to a page when page_size is %s', (size) => {
    expect(get('rejected', { page_size: size }).json.data).toHaveLength(size);
  });
});

describe('search', () => {
  it('ignores case and the spaces around the words, and a blank search means no search', () => {
    const plain = get('jobs', { search: 'JOB10293' }).json;

    expect(plain.meta.total).toBe(1);
    expect(get('jobs', { search: '  job10293 ' }).json).toEqual(plain);
    expect(get('jobs', { search: '   ' }).json.meta.total).toBe(1482);
  });

  it.each([
    ['jobs', reportsJobRows('30d'), ['title', 'recruiter_name', 'outlet_name', 'job_id']],
    [
      'applications',
      reportsApplicationRows('30d'),
      ['candidate_name', 'job_title', 'outlet_name', 'application_id']
    ],
    [
      'hired',
      reportsHiredRows('30d'),
      [
        'candidate_name',
        'job_title',
        'recruiter_name',
        'outlet_name',
        'application_id',
        'candidate_id'
      ]
    ],
    [
      'rejected',
      reportsRejectedRows('30d'),
      ['candidate_name', 'job_title', 'outlet_name', 'application_id']
    ]
  ] as const)('looks in the listed fields of the %s list', (path, rows, fields) => {
    const first: Record<string, unknown> = { ...rows[0] };

    for (const field of fields) {
      const needle = String(first[field]).toUpperCase();
      const total = get(path, { search: needle }).json.meta.total;

      expect(total).toBe(matches(rows, fields, needle).length);
      expect(total).toBeGreaterThan(0);
    }
  });

  it('does not look in the rejection reason', () => {
    expect(get('rejected', { search: 'skills not matched' }).json.meta.total).toBe(0);
  });

  it('finds a hire by the candidate id that the first column shows', () => {
    const hire = reportsHiredRows('30d')[3];

    expect(idsOf(get('hired', { search: hire.candidate_id }).json)).toContain(hire.application_id);
  });
});

describe('filters', () => {
  it('count the hires of one outlet and the rejections of one reason', () => {
    const outlet = reportsHiredRows('30d')[0].outlet_name;
    const reason = 'Insufficient experience';

    expect(get('hired', { outlet }).json.meta.total).toBe(
      reportsHiredRows('30d').filter((row) => row.outlet_name === outlet).length
    );
    expect(get('rejected', { reason }).json.meta.total).toBe(
      reportsRejectedRows('30d').filter((row) => row.rejection_reason === reason).length
    );
  });

  it.each([
    ['jobs', 'job_category'],
    ['hired', 'outlet'],
    ['rejected', 'reason']
  ])('give no rows and no error for a %s %s that nobody has', (path, filter) => {
    const { status, json } = get(path, { [filter]: 'Nowhere' });

    expect(status).toBe(200);
    expect(json.meta.total).toBe(0);
    expect(json.data).toEqual([]);
  });

  it('mean all when empty, and combine with the search', () => {
    const { outlet_name: outlet, recruiter_name: search } = reportsHiredRows('30d')[0];
    const both = get('hired', { outlet, search }).json.meta.total as number;

    expect(get('hired', { outlet: '' }).json.meta.total).toBe(590);
    expect(both).toBeGreaterThan(0);
    expect(both).toBeLessThan(get('hired', { outlet }).json.meta.total);
    expect(both).toBeLessThan(get('hired', { search }).json.meta.total);
  });
});

describe('sorting', () => {
  it('puts the newest first when no sort is named, and ignores an order on its own', () => {
    const newest = idsOf(get('jobs').json);

    expect(newest[0]).toBe('JOB10293');
    expect(idsOf(get('jobs', { order: 'asc' }).json)).toEqual(newest);
  });

  it('turns the order of a date column round', () => {
    const asc = get('rejected', { sort: 'rejected_at', order: 'asc' }).json.data;
    const desc = get('rejected', { sort: 'rejected_at', order: 'desc' }).json.data;

    expect(asc[0].rejected_at < asc[4].rejected_at).toBe(true);
    expect(desc).toEqual(get('rejected').json.data);
    expect(asc[0].application_id).toBe(reportsRejectedRows('30d').at(-1)?.application_id);
  });

  it('sorts jobs by their applications, and equal counts fall back to the newest', () => {
    const rows = matchingRecords(JOBS_LIST, {
      range: '30d',
      search: '',
      filter: '',
      sort: 'applications_count',
      order: 'desc'
    });
    const misplaced = rows.filter((row, i) => {
      const before = rows[i - 1];
      if (!before) return false;
      if (before.applications_count !== row.applications_count) {
        return before.applications_count < row.applications_count;
      }
      return before.posted_at < row.posted_at;
    });

    expect(rows[0].applications_count).toBe(Math.max(...rows.map((r) => r.applications_count)));
    expect(misplaced).toEqual([]);
  });

  it('breaks a tie of dates by the id, so no row repeats or goes missing between pages', () => {
    const rows = matchingRecords(APPLICATIONS_LIST, { range: '30d', search: '', filter: '' });
    const misplaced = rows.filter((row, i) => {
      const before = rows[i - 1];
      if (!before) return false;
      if (before.applied_at !== row.applied_at) return before.applied_at < row.applied_at;
      return before.application_id > row.application_id;
    });

    expect(misplaced).toEqual([]);
    expect(rows.some((row, i) => i > 0 && rows[i - 1].applied_at === row.applied_at)).toBe(true);
    expect(new Set(rows.map((row) => row.application_id)).size).toBe(rows.length);
  });
});

describe('what is refused', () => {
  it.each([
    ['jobs', { page: 0 }, 'page'],
    ['jobs', { page: 'abc' }, 'page'],
    ['jobs', { page_size: 7 }, 'page_size'],
    ['jobs', { sort: 'applied_at' }, 'sort'],
    ['applications', { sort: 'applications_count' }, 'sort'],
    ['hired', { order: 'sideways' }, 'order'],
    ['applications', { status: 'maybe' }, 'status'],
    ['rejected', { range: '14d' }, 'range'],
    ['time-to-hire', { range: '30D' }, 'range']
  ] as const)('a %s call with %j, with 422 and the field %s', (path, params, field) => {
    const { status, json } = get(path, params);

    expect(status).toBe(422);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(json.error.fields)).toEqual([field]);
  });

  it('names every parameter that is wrong in one answer', () => {
    const { json } = get('jobs', { page: 0, page_size: 7, sort: 'x', order: 'y' });

    expect(Object.keys(json.error.fields)).toEqual(['page', 'page_size', 'sort', 'order']);
  });

  it('reads nothing but the range in time-to-hire and nothing at all in filter-options', () => {
    expect(get('time-to-hire', { page: 0, sort: 'x' }).status).toBe(200);
    expect(get('filter-options', { range: 'bogus', page: 0 }).status).toBe(200);
  });

  it('leaves other methods and other routes to the caller', () => {
    expect(call(`${BASE}/jobs`, 'POST').handled).toBe(false);
    expect(call(BASE).handled).toBe(false);
    expect(call(`${BASE}/unknown`).handled).toBe(false);
    expect(call('/hire/admin/reports/jobs').handled).toBe(false);
  });

  it('is answered by the dev router ahead of the Overview and the other report routes', async () => {
    const url = new URL(`${BASE}/jobs?range=7d`, 'http://localhost');
    const res = fakeResponse();
    const handled = await handleHireMock(
      {} as IncomingMessage,
      res as unknown as ServerResponse,
      url.pathname,
      'GET',
      url
    );

    expect(handled).toBe(true);
    expect(JSON.parse(res.text).meta.total).toBe(428);
  });
});
