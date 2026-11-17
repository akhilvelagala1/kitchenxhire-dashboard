import { describe, expect, it, vi } from 'vitest';
import type * as Data from './recruitersMockData.ts';
import { recruitersCsv } from './recruitersExport.ts';

/** REC00000 is a made-up row whose name and area need quoting; every other id is the real store. */
vi.mock('./recruitersMockData.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof Data>();
  const quoted = {
    ...actual.getRecruitersStore()[0]!,
    recruiter_id: 'REC00000',
    business_name: 'Ravi "Rocky" Grill, Bar',
    area: 'Line\nBreak'
  };
  return {
    ...actual,
    findRecruiter: (id: string) => (id === 'REC00000' ? quoted : actual.findRecruiter(id))
  };
});

const HEADER =
  'recruiter_id,business_name,business_type,area,city,owner_name,phone,email,outlets,open_jobs,applications,verification,status,joined_at';
const linesOf = (csv: string) => csv.trimEnd().split('\n');

describe('recruiters CSV export', () => {
  it('writes exactly the chosen rows, skipping unknown ids', () => {
    const lines = linesOf(recruitersCsv({ recruiter_ids: ['REC10892', 'REC10891', 'REC00001'] }));

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(HEADER);
    expect(lines[1]).toBe(
      'REC10892,Spice Bowl Restaurant,Restaurant,Rajiv Nagar,Hyderabad,Rajesh Kumar,9848012345,rajesh.kumar@spicebowl.example.com,12,48,24,verified,active,2024-06-24T09:00:00+05:30'
    );
    expect(lines[2]).toContain('REC10891,Urban Bites,Cloud Kitchen');
  });

  it('quotes fields with a comma, a quote or a line break, and doubles inner quotes', () => {
    const csv = recruitersCsv({ recruiter_ids: ['REC00000'] });

    expect(csv).toContain('"Ravi ""Rocky"" Grill, Bar"');
    expect(csv).toContain('"Line\nBreak"');
  });

  it('writes every row that matches the filters, not one page', () => {
    expect(linesOf(recruitersCsv({}))).toHaveLength(313);
    expect(linesOf(recruitersCsv({ tab: 'active', page: 1, page_size: 5 }))).toHaveLength(287);
    expect(linesOf(recruitersCsv({ status: 'pending' }))).toHaveLength(9);

    const week = linesOf(recruitersCsv({ joined: '7d', business_type: 'Restaurant' }));
    expect(week).toHaveLength(3);
    expect(week[2]).toContain('REC10889');
  });

  it('ends with a line break and ignores an empty id list', () => {
    const csv = recruitersCsv({ recruiter_ids: [], status: 'inactive' });

    expect(csv.endsWith('\n')).toBe(true);
    expect(linesOf(csv)).toHaveLength(13);
  });
});
