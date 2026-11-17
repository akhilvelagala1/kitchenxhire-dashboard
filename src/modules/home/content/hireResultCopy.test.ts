import {
  applicationsRangeLine,
  jobsFoundLine,
  jobsRangeLine,
  savedJobsRangeLine
} from './hireResultCopy';

describe('jobsFoundLine', () => {
  it('states the count and city in the selected language', () => {
    expect(jobsFoundLine('en', 126, 'Hyderabad')).toBe('126 jobs found in Hyderabad');
    expect(jobsFoundLine('hi', 126, 'Hyderabad')).toBe('Hyderabad में 126 नौकरियाँ मिलीं');
  });
});

describe('applicationsRangeLine', () => {
  it('states the visible range in the selected language', () => {
    expect(applicationsRangeLine('en', 1, 4, 86)).toBe('Showing 1–4 of 86 applications');
    expect(applicationsRangeLine('hi', 1, 4, 86)).toBe('86 आवेदनों में से 1–4 दिखा रहे हैं');
  });
});

describe('jobsRangeLine', () => {
  it('states the visible job range in the selected language', () => {
    expect(jobsRangeLine('en', 1, 6, 126)).toBe('Showing 1–6 of 126 jobs');
    expect(jobsRangeLine('hi', 1, 6, 126)).toBe('126 नौकरियों में से 1–6 दिखा रहे हैं');
  });
});

describe('savedJobsRangeLine', () => {
  it('states the visible saved-job range in the selected language', () => {
    expect(savedJobsRangeLine('en', 1, 3, 8)).toBe('Showing 1–3 of 8 saved jobs');
    expect(savedJobsRangeLine('hi', 1, 3, 8)).toBe('8 सहेजी नौकरियों में से 1–3 दिखा रहे हैं');
  });
});
