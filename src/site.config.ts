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
  /** Share of right answers, from 0 to 1, needed to pass a test. */
  passScore: 0.8,
  /**
   * Readers can select text on these pages (language-neutral URLs and everything under them)
   * and comment on it. Comments become issues in `repo`; see "Comments" in the README.
   * An empty list turns comments and signing in off.
   */
  comments: ['/vocabulary/', '/foundations/'] as string[],
};
