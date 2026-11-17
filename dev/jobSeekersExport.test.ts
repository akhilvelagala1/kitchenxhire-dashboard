import { describe, expect, it, vi } from 'vitest';
import type * as Data from './jobSeekersMockData.ts';
import { jobSeekersCsv } from './jobSeekersExport.ts';

/** JS00000 is a made-up row whose name and title need quoting; every other id is the real store. */
vi.mock('./jobSeekersMockData.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof Data>();
  const quoted = {
    ...actual.getJobSeekersStore()[0]!,
    job_seeker_id: 'JS00000',
    name: 'Ravi "Rocky" Kumar',
    preferred_job_title: 'Grill, Bar & Co'
  };
  return {
    ...actual,
    findJobSeeker: (id: string) => (id === 'JS00000' ? quoted : actual.findJobSeeker(id))
  };
});

const HEADER =
  'job_seeker_id,name,email,phone,city,state,preferred_job_title,experience_years,profile_completion,applications_count,interviews_count,shortlisted_count,hired_count,status,joined_at,last_active_at';
const linesOf = (csv: string) => csv.trimEnd().split('\n');

describe('job seekers CSV export', () => {
  it('writes exactly the chosen rows, skipping unknown ids and repeats', () => {
    const csv = jobSeekersCsv({ job_seeker_ids: ['JS12846', 'JS12845', 'JS12845', 'JS99999'] });
    const lines = linesOf(csv);

    expect(csv.endsWith('\n')).toBe(true);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(HEADER);
    expect(lines[2]).toContain(
      'JS12845,Priya Sharma,priya.sharma@email.com,9876543211,Banjara Hills'
    );
  });

  it('writes a full row with every column in order', () => {
    expect(linesOf(jobSeekersCsv({ job_seeker_ids: ['JS12846'] }))[1]).toBe(
      'JS12846,Ramesh Kumar,ramesh.kumar@email.com,9876543210,Hyderabad,TS,Cook / Chef,3,92,12,4,3,1,active,2024-06-22T10:24:00+05:30,2024-06-24T10:24:00+05:30'
    );
  });

  it('quotes fields that hold a comma and doubles the quotes inside a quoted field', () => {
    const lines = linesOf(jobSeekersCsv({ job_seeker_ids: ['JS00000'] }));

    expect(lines[1]).toContain('"Ravi ""Rocky"" Kumar"');
    expect(lines[1]).toContain('"Grill, Bar & Co"');
  });

  it('writes every non-active row for the Inactive tab, not one page', () => {
    const lines = linesOf(jobSeekersCsv({ tab: 'inactive', page: 3, page_size: 5 }));

    expect(lines).toHaveLength(1 + 1864);
    expect(lines.slice(1).every((line) => !/,active,/.test(line))).toBe(true);
  });

  it('applies city, experience, search and joined filters, and ignores an empty id list', () => {
    expect(
      linesOf(jobSeekersCsv({ search: 'venkatesh', city: 'Gachibowli', job_seeker_ids: [] })).slice(
        1
      )
    ).toEqual(expect.arrayContaining([expect.stringContaining('JS12842,Venkatesh Rao')]));
    const recent = linesOf(jobSeekersCsv({ joined: '7d' })).slice(1);

    expect(recent.slice(0, 4).map((line) => line.split(',')[0])).toEqual([
      'JS12846',
      'JS12845',
      'JS12844',
      'JS12843'
    ]);
    expect(recent.some((line) => line.startsWith('JS12842,'))).toBe(false);
    expect(
      linesOf(jobSeekersCsv({ experience: '6+' }))
        .slice(1)
        .every((line) => {
          const cols = line.split(',');
          return Number(cols[7]) >= 6;
        })
    ).toBe(true);
  });
});
