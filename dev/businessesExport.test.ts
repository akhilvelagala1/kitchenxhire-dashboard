import { describe, expect, it, vi } from 'vitest';
import type * as Data from './businessesMockData.ts';
import { businessesCsv } from './businessesExport.ts';

/** BUS0000 is a made-up row whose name and area need quoting; every other id is the real store. */
vi.mock('./businessesMockData.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof Data>();
  const quoted = {
    ...actual.getBusinessesStore()[0]!,
    business_id: 'BUS0000',
    business_name: 'Ravi "Rocky" Grill, Bar',
    area: 'Line\nBreak'
  };
  return {
    ...actual,
    findBusiness: (id: string) => (id === 'BUS0000' ? quoted : actual.findBusiness(id))
  };
});

const HEADER =
  'business_id,business_name,business_type,area,city,owner_name,phone,email,outlets,status,verification,joined_at';
const linesOf = (csv: string) => csv.trimEnd().split('\n');

describe('businesses CSV export', () => {
  it('writes exactly the chosen rows, skipping unknown ids', () => {
    const lines = linesOf(businessesCsv({ business_ids: ['BUS0642', 'BUS0641', 'BUS9999'] }));

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(HEADER);
    expect(lines[1]).toBe(
      'BUS0642,Spice Bowl Restaurant,Restaurant,Rajiv Nagar,Hyderabad,Ramesh Kumar,9876543210,ramesh.kumar@spicebowlrestaurant.example.com,12,active,verified,2024-06-24T10:24:00+05:30'
    );
    expect(lines[2]).toContain('BUS0641,Urban Bites,Cloud Kitchen');
  });

  it('quotes fields with a comma, a quote or a line break, and doubles inner quotes', () => {
    const csv = businessesCsv({ business_ids: ['BUS0000'] });

    expect(csv).toContain('"Ravi ""Rocky"" Grill, Bar"');
    expect(csv).toContain('"Line\nBreak"');
  });

  it('writes every row that matches the filters, not one page', () => {
    expect(linesOf(businessesCsv({}))).toHaveLength(643);
    expect(linesOf(businessesCsv({ tab: 'active', page: 1, page_size: 5 }))).toHaveLength(587);
    expect(linesOf(businessesCsv({ status: 'under_review' }))).toHaveLength(13);
    expect(linesOf(businessesCsv({ status: 'suspended' }))).toHaveLength(9);
    expect(linesOf(businessesCsv({ business_type: 'Warehouse', joined: '30d' }))).toHaveLength(25);

    const week = linesOf(businessesCsv({ joined: '7d', business_type: 'Food Court' }));
    expect(week).toHaveLength(2);
    expect(week[1]).toContain('BUS0640');
  });

  it('ends with a line break and ignores an empty id list', () => {
    const csv = businessesCsv({ business_ids: [], status: 'inactive' });

    expect(csv.endsWith('\n')).toBe(true);
    expect(linesOf(csv)).toHaveLength(37);
  });
});
