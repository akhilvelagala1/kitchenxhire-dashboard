import { describe, expect, it } from 'vitest';
import { listBusinesses } from './businessesAnalytics.ts';
import {
  BUSINESS_KINDS,
  BUSINESS_STATUS_LABELS,
  MOCK_NOW_MS,
  createBusiness,
  findBusiness,
  getBusinessesStore,
  toIstIso,
  updateBusiness
} from './businessesMockData.ts';

const rows = getBusinessesStore();
const count = (key: 'status' | 'business_type' | 'city' | 'verification', value: string) =>
  rows.filter((r) => r[key] === value).length;
const outletsOf = (list: typeof rows) => list.reduce((sum, r) => sum + r.outlets, 0);

describe('mock businesses store', () => {
  it('holds 642 businesses with unique ids counting down from BUS0642 to BUS0001', () => {
    expect(rows).toHaveLength(642);
    expect(new Set(rows.map((r) => r.business_id)).size).toBe(642);
    expect(new Set(rows.map((r) => r.business_name)).size).toBe(642);
    expect(rows.at(-1)?.business_id).toBe('BUS0642');
    expect(rows.some((r) => r.business_id === 'BUS0001')).toBe(true);
  });

  it('matches the picture: statuses, outlets, active outlets and warehouses', () => {
    expect(count('status', 'active')).toBe(586);
    expect(count('status', 'inactive')).toBe(36);
    expect(count('status', 'under_review')).toBe(12);
    expect(count('status', 'suspended')).toBe(8);
    expect(outletsOf(rows)).toBe(1428);
    expect(outletsOf(rows.filter((r) => r.status === 'active'))).toBe(1312);
    expect(count('business_type', 'Warehouse')).toBe(24);
    expect(rows.filter((r) => r.business_type === 'Warehouse').every((r) => r.outlets === 1)).toBe(
      true
    );
    expect(BUSINESS_KINDS.every((kind) => count('business_type', kind) > 0)).toBe(true);
    expect(rows.every((r) => ['verified', 'pending', 'unverified'].includes(r.verification))).toBe(
      true
    );
  });

  it('serves the ten reference rows, in order, as the default first page', () => {
    const { items, meta } = listBusinesses(rows, { page: 1, page_size: 10 });

    expect(meta).toEqual({ page: 1, page_size: 10, total: 642 });
    expect(
      items.map((r) => [
        r.business_id,
        r.business_name,
        `${r.area}, ${r.city}`,
        r.business_type,
        r.outlets,
        r.owner_name,
        r.phone,
        r.status,
        r.verification,
        r.joined_at
      ])
    ).toEqual([
      [
        'BUS0642',
        'Spice Bowl Restaurant',
        'Rajiv Nagar, Hyderabad',
        'Restaurant',
        12,
        'Ramesh Kumar',
        '9876543210',
        'active',
        'verified',
        '2024-06-24T10:24:00+05:30'
      ],
      [
        'BUS0641',
        'Urban Bites',
        'Banjara Hills, Hyderabad',
        'Cloud Kitchen',
        8,
        'Priya Sharma',
        '9876554321',
        'active',
        'verified',
        '2024-06-22T09:18:00+05:30'
      ],
      [
        'BUS0640',
        'The Food Court',
        'Kukatpally, Hyderabad',
        'Food Court',
        5,
        'Arjun Reddy',
        '9123456789',
        'active',
        'pending',
        '2024-06-20T16:52:00+05:30'
      ],
      [
        'BUS0639',
        'FreshStock Warehouse',
        'Patancheru, Hyderabad',
        'Warehouse',
        1,
        'Sangeetha Devi',
        '9012345678',
        'inactive',
        'unverified',
        '2024-06-18T11:03:00+05:30'
      ],
      [
        'BUS0638',
        'Meal Hub',
        'Gachibowli, Hyderabad',
        'Restaurant',
        6,
        'Venkatesh Rao',
        '9345678901',
        'active',
        'verified',
        '2024-06-16T09:20:00+05:30'
      ],
      [
        'BUS0637',
        'Tasty Point',
        'Madhapur, Hyderabad',
        'Restaurant',
        4,
        'Suresh Goud',
        '8099123456',
        'inactive',
        'pending',
        '2024-06-15T10:00:00+05:30'
      ],
      [
        'BUS0636',
        'Cloud Curry',
        'Kondapur, Hyderabad',
        'Cloud Kitchen',
        3,
        'Neha Jain',
        '9666123456',
        'active',
        'verified',
        '2024-06-14T09:45:00+05:30'
      ],
      [
        'BUS0635',
        'Plaza Eats',
        'Ameerpet, Hyderabad',
        'Food Court',
        7,
        'Karthik Reddy',
        '9555123456',
        'suspended',
        'unverified',
        '2024-06-13T14:20:00+05:30'
      ],
      [
        'BUS0634',
        'Green Bowl',
        'Jubilee Hills, Hyderabad',
        'Restaurant',
        2,
        'Megha Singh',
        '9444123456',
        'under_review',
        'pending',
        '2024-06-12T11:30:00+05:30'
      ],
      [
        'BUS0633',
        'Fresh Fork Kitchen',
        'Hitech City, Hyderabad',
        'Cloud Kitchen',
        5,
        'Deepak Verma',
        '9333123456',
        'active',
        'verified',
        '2024-06-11T08:15:00+05:30'
      ]
    ]);
    expect(Math.ceil(meta.total / 10)).toBe(65);
  });

  it('gives every business a valid mobile number, an e-mail and a join date inside the last 30 days', () => {
    const from = '2024-05-26T00:00:00+05:30';
    const to = '2024-06-25T00:00:00+05:30';

    for (const row of rows) {
      expect(row.phone).toMatch(/^[6-9]\d{9}$/);
      expect(row.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(row.joined_at >= from && row.joined_at < to).toBe(true);
      expect(row.city).not.toBe('');
      expect(row.outlets).toBeGreaterThan(0);
    }
  });

  it('builds the same store on every start', () => {
    expect(getBusinessesStore()).toBe(rows);
    expect(rows[100]?.business_name).toBe(getBusinessesStore()[100]?.business_name);
  });

  it('writes India time with the +05:30 offset whatever the machine time zone', () => {
    expect(toIstIso(MOCK_NOW_MS)).toBe('2024-06-24T18:00:00+05:30');
    expect(toIstIso(Date.parse('2024-06-24T00:00:00Z'))).toBe('2024-06-24T05:30:00+05:30');
  });

  it('creates an under-review business with pending verification, no outlets, joined now', () => {
    const row = createBusiness({
      business_name: 'Saffron Table',
      business_type: 'Restaurant',
      area: 'Jubilee Hills',
      city: 'Hyderabad',
      owner_name: 'Kiran Rao',
      phone: '9123456780',
      email: 'kiran@saffrontable.example.com'
    });

    expect(row).toMatchObject({
      business_id: 'BUS0643',
      status: 'under_review',
      verification: 'pending',
      outlets: 0,
      joined_at: '2024-06-24T18:00:00+05:30'
    });
    expect(findBusiness('BUS0643')).toBe(row);
    expect(rows).toHaveLength(643);
    expect(BUSINESS_STATUS_LABELS[row.status]).toBe('Under Review');
  });

  it('updates a business and returns undefined for an unknown id', () => {
    const next = updateBusiness('BUS0641', { status: 'inactive', city: 'Secunderabad' });

    expect(next).toMatchObject({ business_name: 'Urban Bites', status: 'inactive' });
    expect(findBusiness('BUS0641')?.city).toBe('Secunderabad');
    expect(updateBusiness('BUS9999', { status: 'active' })).toBeUndefined();
    expect(findBusiness('BUS9999')).toBeUndefined();
  });
});
