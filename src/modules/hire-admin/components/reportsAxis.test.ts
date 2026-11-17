import { niceAxis } from './reportsAxis';

describe('niceAxis', () => {
  it('rounds the top of the axis up to a tidy number', () => {
    expect(niceAxis(1842, 4)).toEqual({ max: 2000, step: 500 });
    expect(niceAxis(24860, 5)).toEqual({ max: 25000, step: 5000 });
    expect(niceAxis(312, 5)).toEqual({ max: 500, step: 100 });
  });

  it('keeps a value that sits exactly on a step', () => {
    expect(niceAxis(2000, 4)).toEqual({ max: 2000, step: 500 });
  });

  it('handles small and empty data', () => {
    expect(niceAxis(7, 4)).toEqual({ max: 8, step: 2 });
    expect(niceAxis(0, 4)).toEqual({ max: 4, step: 1 });
  });
});
