import { JOBS } from '../content/jobs';
import { emptyJobsMessage, searchJobs } from './searchJobs';

describe('searchJobs', () => {
  it('returns every job when both queries are empty', () => {
    expect(searchJobs(JOBS, '', '')).toHaveLength(JOBS.length);
  });

  it('keeps jobs whose text contains every word of the role query', () => {
    const results = searchJobs(JOBS, 'south indian', '');
    expect(results.length).toBeGreaterThan(0);
    expect(results.map((j) => j.title)).toContain('South Indian Cook');
    for (const job of results) {
      expect(job.searchText).toContain('south');
      expect(job.searchText).toContain('indian');
    }
  });

  it('filters by city as well as role', () => {
    const madhapurCooks = searchJobs(JOBS, 'cook', 'madhapur');
    expect(madhapurCooks.length).toBeGreaterThan(0);
    for (const job of madhapurCooks) {
      expect(job.area.toLowerCase()).toContain('madhapur');
      expect(job.searchText).toContain('cook');
    }
    expect(searchJobs(JOBS, 'helper', 'madhapur').map((j) => j.title)).toEqual(['Kitchen Helper']);
  });

  it('names the city in the empty message when one is typed', () => {
    expect(emptyJobsMessage('Pune')).toContain('in Pune');
    expect(emptyJobsMessage('  ')).toContain('for that role');
  });
});
