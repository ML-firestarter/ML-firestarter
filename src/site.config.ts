import type { Lang } from './lib/i18n.ts';

export const site = {
  title: 'ML-workout',
  /** Shown under the title on the home page, and the description of pages that have none. */
  tagline: {
    en: 'Machine learning, one lesson at a time.',
    pl: 'Uczenie maszynowe, lekcja po lekcji.',
  } satisfies Record<Lang, string>,
  /** GitHub repository with the notes; used for the "Edit on GitHub" and "Add a lesson" links. */
  repo: 'https://github.com/fijisoo/ML-workout',
  branch: 'main',
};
