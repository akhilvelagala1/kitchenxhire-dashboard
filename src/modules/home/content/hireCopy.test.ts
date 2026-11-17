import { translateHireCopy } from './hireCopy';

describe('translateHireCopy', () => {
  it('keeps English text and translates a known Hindi label', () => {
    expect(translateHireCopy('en', 'Sort by')).toBe('Sort by');
    expect(translateHireCopy('hi', 'Sort by')).toBe('क्रम');
    expect(translateHireCopy('hi', 'Latest Jobs')).toBe('नवीनतम नौकरियाँ');
  });

  it('leaves job titles that are not interface copy in English', () => {
    expect(translateHireCopy('hi', 'Spice Bowl Restaurant')).toBe('Spice Bowl Restaurant');
  });
});
