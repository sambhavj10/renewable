export const SITE_NAME = 'GreenGrid India';
export const SITE_TAGLINE = 'Tracking India’s Energy Transition';
export const SITE_DESCRIPTION =
  'GreenGrid India is an independent publication covering India’s renewable energy sector — solar, wind, storage, green hydrogen, manufacturing and policy — with a new article every Sunday.';

export const CATEGORIES = [
  'Solar',
  'Wind',
  'Storage',
  'Hydrogen',
  'Manufacturing',
  'Policy & Markets',
] as const;

export type Category = (typeof CATEGORIES)[number];

export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Scheduled publishing: an article counts as published once its `date` has
// arrived. Future-dated articles are hidden from all listings and get no page
// until a site build runs on or after that date, so a post dated next Sunday
// only appears once we're actually on (or past) that day.
export function isPublished(date: Date, now: Date = new Date()): boolean {
  return date.valueOf() <= now.valueOf();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
