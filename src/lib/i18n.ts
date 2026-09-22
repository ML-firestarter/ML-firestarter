/**
 * The site's languages and the text of its interface.
 *
 * English pages live at the root (`/vocabulary/sft/`), every other language
 * under its code (`/pl/vocabulary/sft/`). Notes are translated file by file:
 * `sft.pl.md` is the Polish version of `sft.md`.
 */

export const LANGS = ['en', 'pl'] as const;
export type Lang = (typeof LANGS)[number];

/** Language of notes without a language code, served without a URL prefix. */
export const DEFAULT_LANG: Lang = 'en';

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** `/vocabulary/sft/` → `/pl/vocabulary/sft/` */
export function localizeUrl(path: string, lang: Lang): string {
  return lang === DEFAULT_LANG ? path : `/${lang}${path}`;
}

/** Picks the plural form for `count` and puts the number in place of `#`. */
function plural(lang: Lang, count: number, forms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }) {
  return (forms[new Intl.PluralRules(lang).select(count)] ?? forms.other).replace('#', String(count));
}

// `{}` marks where a component inserts markup, such as the progress count.
const en = {
  name: 'English',
  /** Label of the link that switches to this language, written in this language. */
  readIn: 'Read in English',
  inLanguage: { en: 'in English', pl: 'in Polish' } satisfies Record<Lang, string>,

  skipLink: 'Skip to content',
  menu: 'Lessons menu',
  github: 'Notes on GitHub',
  theme: 'Switch light or dark theme',
  lessonsNav: 'Lessons',
  chaptersNav: 'Chapters',
  crumbs: 'Breadcrumb',
  home: 'Home',
  overview: 'Overview',
  lessonsDone: '{} lessons done',
  empty: 'No lessons yet. Add a Markdown file to the {} folder and push it to GitHub.',

  eyebrow: 'Learning log',
  chapterNumber: (n: number) => `Chapter ${n}`,
  chapterCount: (n: number) => plural('en', n, { one: '# chapter', other: '# chapters' }),
  readingTotal: (minutes: number) => `about ${minutes} min of reading`,
  moreLessons: (n: number) => plural('en', n, { one: '+ # more lesson', other: '+ # more lessons' }),
  nextUp: { start: 'Start with', continue: 'Continue with', review: 'All done! Review' },

  lessonOf: (i: number, n: number) => `Lesson ${i} of ${n}`,
  minRead: (minutes: number) => `${minutes} min read`,
  minutes: (minutes: number) => `${minutes} min`,
  done: 'Done',
  edit: 'Edit on GitHub',
  markDone: 'Mark lesson as done',
  lessonDone: 'Lesson done',
  pager: 'Other lessons',
  previous: 'Previous',
  next: 'Next',
  onThisPage: 'On this page',
  untranslated: (inLanguage: string) => `This page hasn't been translated into English yet, so it's shown ${inLanguage}.`,
  translate: 'Add a translation on GitHub',

  startChapter: 'Start chapter',
  addLesson: 'Add a lesson on GitHub',
  sectionLessons: '{} lessons',

  notFound: {
    title: 'Page not found',
    heading: "This page doesn't exist",
    lede: 'The lesson may have been renamed or moved. Pick one from the list, or start from the home page.',
    home: 'Go to the home page',
  },

  // Inside notes.
  alerts: { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' },
  footnotes: 'Footnotes',
  backToReference: (ref: string) => `Back to reference ${ref}`,
};

const pl: typeof en = {
  name: 'Polski',
  readIn: 'Czytaj po polsku',
  inLanguage: { en: 'po angielsku', pl: 'po polsku' },

  skipLink: 'Przejdź do treści',
  menu: 'Menu lekcji',
  github: 'Notatki na GitHubie',
  theme: 'Przełącz jasny lub ciemny motyw',
  lessonsNav: 'Lekcje',
  chaptersNav: 'Rozdziały',
  crumbs: 'Ścieżka nawigacji',
  home: 'Strona główna',
  overview: 'Przegląd',
  lessonsDone: 'Ukończone lekcje: {}',
  empty: 'Nie ma jeszcze lekcji. Dodaj plik Markdown do folderu {} i wypchnij go na GitHuba.',

  eyebrow: 'Dziennik nauki',
  chapterNumber: (n) => `Rozdział ${n}`,
  chapterCount: (n) => plural('pl', n, { one: '# rozdział', few: '# rozdziały', many: '# rozdziałów', other: '# rozdziału' }),
  readingTotal: (minutes) => `około ${minutes} min czytania`,
  moreLessons: (n) =>
    plural('pl', n, { one: '+ jeszcze # lekcja', few: '+ jeszcze # lekcje', many: '+ jeszcze # lekcji', other: '+ jeszcze # lekcji' }),
  nextUp: { start: 'Na początek:', continue: 'Kontynuuj:', review: 'Wszystko gotowe! Powtórz:' },

  lessonOf: (i, n) => `Lekcja ${i} z ${n}`,
  minRead: (minutes) => `${minutes} min czytania`,
  minutes: (minutes) => `${minutes} min`,
  done: 'Ukończona',
  edit: 'Edytuj na GitHubie',
  markDone: 'Oznacz lekcję jako ukończoną',
  lessonDone: 'Lekcja ukończona',
  pager: 'Inne lekcje',
  previous: 'Poprzednia',
  next: 'Następna',
  onThisPage: 'Na tej stronie',
  untranslated: (inLanguage) => `Tej strony nie przetłumaczono jeszcze na polski, więc jest wyświetlana ${inLanguage}.`,
  translate: 'Dodaj tłumaczenie na GitHubie',

  startChapter: 'Zacznij rozdział',
  addLesson: 'Dodaj lekcję na GitHubie',
  sectionLessons: '{} lekcji',

  notFound: {
    title: 'Nie znaleziono strony',
    heading: 'Ta strona nie istnieje',
    lede: 'Być może lekcja ma nową nazwę albo została przeniesiona. Wybierz lekcję z listy albo zacznij od strony głównej.',
    home: 'Przejdź na stronę główną',
  },

  alerts: { note: 'Uwaga', tip: 'Wskazówka', important: 'Ważne', warning: 'Ostrzeżenie', caution: 'Przestroga' },
  footnotes: 'Przypisy',
  backToReference: (ref) => `Wróć do odwołania ${ref}`,
};

export const ui: Record<Lang, typeof en> = { en, pl };

/** For a `lang` attribute: the content's language when it differs from the page's. */
export function langAttr(content: Lang, page: Lang): Lang | undefined {
  return content === page ? undefined : content;
}
