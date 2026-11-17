import type { HireLanguage } from './languages';

export function jobsFoundLine(language: HireLanguage, count: number, city: string): string {
  if (language === 'hi') return `${city} में ${count} नौकरियाँ मिलीं`;
  return `${count} jobs found in ${city}`;
}

export function applicationsRangeLine(
  language: HireLanguage,
  start: number,
  end: number,
  total: number
): string {
  if (language === 'hi') return `${total} आवेदनों में से ${start}–${end} दिखा रहे हैं`;
  return `Showing ${start}–${end} of ${total} applications`;
}

export function jobsRangeLine(
  language: HireLanguage,
  start: number,
  end: number,
  total: number
): string {
  if (language === 'hi') return `${total} नौकरियों में से ${start}–${end} दिखा रहे हैं`;
  return `Showing ${start}–${end} of ${total} jobs`;
}

export function savedJobsRangeLine(
  language: HireLanguage,
  start: number,
  end: number,
  total: number
): string {
  if (language === 'hi') return `${total} सहेजी नौकरियों में से ${start}–${end} दिखा रहे हैं`;
  return `Showing ${start}–${end} of ${total} saved jobs`;
}
