import type { Lang } from './lib/i18n.ts';

/** A group of top-level chapters on the learning path; see `groups`. */
export interface ChapterGroup {
  /** A numbered step of the path ("Stage 1 · Programming"); groups without it, like reference material, show their title alone. */
  stage?: boolean;
  title: Record<Lang, string>;
  /** What a reader can do after the group, shown under its title on the home page. */
  outcome?: Record<Lang, string>;
  /** Language-neutral paths of its top-level chapters, like `/python/`. */
  chapters: string[];
}

export const site = {
  title: 'ML-firestarter',
  /** Shown under the title on the home page, and the description of pages that have none. */
  tagline: {
    en: 'Machine learning, one lesson at a time.',
    pl: 'Uczenie maszynowe, lekcja po lekcji.',
  } satisfies Record<Lang, string>,
  /** GitHub repository with the notes; used for the "Edit on GitHub" and "Add a lesson" links. */
  repo: 'https://github.com/ML-firestarter/ML-firestarter',
  branch: 'main',
  /** Share of right answers, from 0 to 1, needed to pass a test. */
  passScore: 0.8,
  /**
   * Readers can select text on these pages (language-neutral URLs and everything under them)
   * and comment on it. Comments become issues in `repo`; see "Comments" in the README.
   * An empty list turns comments off, and signing in too unless the site has exams.
   */
  comments: ['/vocabulary/', '/python/', '/foundations/', '/pytorch/', '/adversarial-examples/'] as string[],
  /**
   * The learning path: groups of top-level chapters, in reading order, which the sidebar and the
   * home page show under a header. The groups set the order of the chapters, so a group can
   * hold a chapter whose folder number is lower than another group's; inside a group, chapters
   * keep their folders' order. Chapters in no group, like the start here, come first. A path
   * that isn't a top-level chapter, or one in two groups, fails the build.
   */
  groups: [
    {
      stage: true,
      title: { en: 'Programming', pl: 'Programowanie' },
      outcome: {
        en: "You'll write, test and run your own programs in Python.",
        pl: 'Będziesz pisać, testować i uruchamiać własne programy w Pythonie.',
      },
      chapters: ['/python/'],
    },
    {
      stage: true,
      title: { en: 'How models learn', pl: 'Jak uczą się modele' },
      outcome: {
        en: "You'll see how a model learns by working out its loss and its steps of gradient descent by hand, up to a small neural network.",
        pl: 'Zobaczysz, jak uczy się model: ręcznie policzysz stratę i kroki spadku gradientu, aż po małą sieć neuronową.',
      },
      chapters: ['/foundations/'],
    },
    {
      stage: true,
      title: { en: 'Building models', pl: 'Budowanie modeli' },
      outcome: {
        en: "You'll build, train, evaluate and save networks in PyTorch.",
        pl: 'Zbudujesz, wytrenujesz, ocenisz i zapiszesz sieci w PyTorchu.',
      },
      chapters: ['/pytorch/'],
    },
    {
      stage: true,
      title: { en: 'Specializations', pl: 'Specjalizacje' },
      outcome: {
        en: "You'll put the models you can build to work in one field, starting with attacks on networks that read pictures.",
        pl: 'Wykorzystasz zdobytą wiedzę w wybranej dziedzinie, zaczynając od ataków na sieci rozpoznające obrazy.',
      },
      chapters: ['/adversarial-examples/'],
    },
    {
      title: { en: 'Reference', pl: 'Materiały' },
      chapters: ['/vocabulary/'],
    },
  ] as ChapterGroup[],
  /** Chapter exams, which the site's API grades; see "Exams" in the README. */
  exams: {
    /** Private repository with the exam questions, laid out like tests/; production builds download it into exams/. */
    repo: 'https://github.com/ML-firestarter/ML-firestarter-exams',
    /** Private repository where the site's bot keeps readers' results, a file for each reader. */
    results: 'https://github.com/ML-firestarter/ML-firestarter-results',
    /** Public repository where the site's bot keeps the certificates readers ask for once they pass; see "Certificates" in the README. */
    certificates: 'https://github.com/ML-firestarter/ML-firestarter-certificates',
    /** Questions in an attempt, drawn from every lesson of the chapter. */
    questions: 10,
    /** Hours to wait after an attempt that didn't pass before starting another. */
    wait: 24,
  },
};
