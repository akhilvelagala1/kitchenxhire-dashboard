import { FIND_JOBS_CATALOG } from '../content/findJobsCatalog';
import {
  filterSavedListings,
  parseSavedJobEntries,
  resolveSavedListings,
  sortSavedListings
} from './savedJobs';

describe('parseSavedJobEntries', () => {
  it('migrates legacy string ids and keeps object entries', () => {
    expect(
      parseSavedJobEntries([
        'find-job-1',
        { id: 'find-job-2', savedAt: '2026-01-01T00:00:00.000Z' }
      ])
    ).toEqual([
      { id: 'find-job-1', savedAt: '1970-01-01T00:00:00.000Z' },
      { id: 'find-job-2', savedAt: '2026-01-01T00:00:00.000Z' }
    ]);
  });
});

describe('resolveSavedListings', () => {
  it('joins saved ids to catalog jobs', () => {
    const job = FIND_JOBS_CATALOG[0]!;
    const resolved = resolveSavedListings([{ id: job.id, savedAt: '2026-11-15T00:00:00.000Z' }]);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.title).toBe(job.title);
    expect(resolved[0]!.savedAt).toBe('2026-11-15T00:00:00.000Z');
  });
});

describe('filter and sort saved listings', () => {
  const sample = resolveSavedListings(
    FIND_JOBS_CATALOG.slice(0, 8).map((job, index) => ({
      id: job.id,
      savedAt: new Date(Date.UTC(2026, 10, 15 - index)).toISOString()
    }))
  );

  it('filters by query and sorts recently saved first', () => {
    const filtered = filterSavedListings(sample, {
      query: sample[0]!.title.split(' ')[0]!,
      location: '',
      category: ''
    });
    expect(filtered.length).toBeGreaterThan(0);
    const sorted = sortSavedListings(filtered, 'recently-saved');
    expect(sorted[0]!.savedAt >= sorted.at(-1)!.savedAt).toBe(true);
  });
});
