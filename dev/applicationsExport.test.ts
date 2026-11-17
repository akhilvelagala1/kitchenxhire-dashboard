import { describe, expect, it, vi } from 'vitest';
import type * as Data from './applicationsMockData.ts';
import { applicationsCsv } from './applicationsExport.ts';

/** APP00000 is a made-up row whose name and outlet need quoting; every other id is the real store. */
vi.mock('./applicationsMockData.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof Data>();
  const quoted = {
    ...actual.getApplicationsStore()[0]!,
    application_id: 'APP00000',
    candidate_name: 'Ravi "Rocky" Kumar',
    outlet_name: 'Grill, Bar & Co'
  };
  return {
    ...actual,
    findApplication: (id: string) => (id === 'APP00000' ? quoted : actual.findApplication(id))
  };
});

const HEADER =
  'application_id,candidate_name,candidate_email,candidate_phone,candidate_location,job_title,job_type,recruiter_name,outlet_name,applied_at,status';
const linesOf = (csv: string) => csv.trimEnd().split('\n');

describe('applications CSV export', () => {
  it('writes exactly the chosen rows, skipping unknown ids', () => {
    const lines = linesOf(
      applicationsCsv({ application_ids: ['APP10892', 'APP10891', 'APP00001'] })
    );

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(HEADER);
    expect(lines[2]).toContain('APP10891,Priya Sharma,priya.sharma@example.com');
  });

  it('quotes fields that hold a comma and doubles the quotes inside a quoted field', () => {
    const lines = linesOf(applicationsCsv({ application_ids: ['APP10892', 'APP00000'] }));

    expect(lines[1]).toBe(
      'APP10892,Rahul Kumar,rahul.kumar@example.com,9848012345,"Hyderabad, TS",Cook / Chef,Full-time,Rahul Verma,Spice Bowl Restaurant,2026-06-24T10:24:00+05:30,reviewed'
    );
    expect(lines[2]).toContain('"Ravi ""Rocky"" Kumar"');
    expect(lines[2]).toContain('"Grill, Bar & Co"');
  });

  it('writes every row that matches the filters, not one page', () => {
    expect(linesOf(applicationsCsv({}))).toHaveLength(8673);
    expect(linesOf(applicationsCsv({ tab: 'hired', page: 1, page_size: 5 }))).toHaveLength(429);

    const day = linesOf(applicationsCsv({ from: '2026-06-22', to: '2026-06-23', status: 'hired' }));
    expect(day).toHaveLength(2);
    expect(day[1]).toContain('APP10889');
  });

  it('ends with a line break and ignores an empty id list', () => {
    const csv = applicationsCsv({ application_ids: [], status: 'rejected' });

    expect(csv.endsWith('\n')).toBe(true);
    expect(linesOf(csv)).toHaveLength(857);
  });
});
