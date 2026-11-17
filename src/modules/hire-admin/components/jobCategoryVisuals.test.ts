import { categoryBarColor, jobCategoryBadgeClass, jobLabelIcon } from './jobCategoryVisuals';

describe('jobLabelIcon', () => {
  it('gives each category label its own icon', () => {
    const labels = [
      'Cook / Chef',
      'Kitchen Helper',
      'Cleaning & Stewarding',
      'Delivery & Store Support',
      'Restaurant Manager',
      'Others'
    ];
    expect(new Set(labels.map(jobLabelIcon)).size).toBe(labels.length);
  });

  it('falls back to a default icon for a label it does not know', () => {
    expect(jobLabelIcon('Something new')).toBe(jobLabelIcon('Restaurant Manager'));
  });
});

describe('jobCategoryBadgeClass', () => {
  it('colours the four categories differently', () => {
    const classes = (['Kitchen', 'Operations', 'Logistics', 'Management'] as const).map(
      jobCategoryBadgeClass
    );
    expect(new Set(classes).size).toBe(4);
  });
});

describe('categoryBarColor', () => {
  const green = (color: string) => Number(/rgb\(\d+ (\d+) \d+\)/.exec(color)?.[1]);

  it('uses the full brand orange for the biggest category', () => {
    expect(categoryBarColor(1)).toBe('rgb(255 79 24)');
  });

  it('gets softer as the count falls, but never disappears', () => {
    expect(green(categoryBarColor(0.75))).toBeGreaterThan(green(categoryBarColor(1)));
    expect(green(categoryBarColor(0.25))).toBeGreaterThan(green(categoryBarColor(0.75)));
    expect(green(categoryBarColor(0))).toBeLessThan(216);
  });

  it('copes with a ratio outside 0 to 1', () => {
    expect(categoryBarColor(5)).toBe(categoryBarColor(1));
    expect(categoryBarColor(-1)).toBe(categoryBarColor(0));
  });
});
