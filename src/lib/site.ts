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

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
