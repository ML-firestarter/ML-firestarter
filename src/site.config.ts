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
   * An empty list turns comments off, and signing in too unless the site has exams.
   */
  comments: ['/vocabulary/', '/foundations/'] as string[],
  /** Chapter exams, which the site's API grades; see "Exams" in the README. */
  exams: {
    /** Private repository with the exam questions, laid out like tests/; production builds download it into exams/. */
    repo: 'https://github.com/fijisoo/ML-workout-exams',
    /** Private repository where the site's bot keeps readers' results, a file for each reader. */
    results: 'https://github.com/fijisoo/ML-workout-results',
    /** Public repository where the site's bot keeps the certificates readers ask for once they pass; see "Certificates" in the README. */
    certificates: 'https://github.com/fijisoo/ML-workout-certificates',
    /** Questions in an attempt, drawn from every lesson of the chapter. */
    questions: 10,
    /** Hours to wait after an attempt that didn't pass before starting another. */
    wait: 24,
  },
};
