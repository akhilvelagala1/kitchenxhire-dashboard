import { searchCities } from './jobTaxonomy';

describe('searchCities', () => {
  it('keeps a locality match separate from an unrelated city match', () => {
    const results = searchCities('ben');

    const benzCircle = results.find((item) => item.label === 'Benz Circle');
    expect(benzCircle).toBeDefined();
    expect(benzCircle?.city).toBe('Vijayawada');

    const bengaluru = results.find((item) => item.label === 'Bengaluru');
    expect(bengaluru).toBeDefined();
    expect(bengaluru?.city).toBeUndefined();

    expect(results.find((item) => item.label === 'Vijayawada')).toBeUndefined();
  });

  it('resolves a locality to its city for display while keeping its own label', () => {
    const results = searchCities('Madha');

    expect(results).toEqual([{ label: 'Madhapur', city: 'Hyderabad' }]);
  });

  it('matches a city abbreviation directly, with no city field set', () => {
    const results = searchCities('viz');

    expect(results).toEqual([{ label: 'Visakhapatnam' }]);
  });

  it('returns nothing for a query under two characters', () => {
    expect(searchCities('v')).toEqual([]);
  });
});
