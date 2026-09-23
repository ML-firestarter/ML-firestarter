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

/** A phrase in each plural form a language has, with `#` for the number, as in `# lessons`. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/** Picks the plural form for `count` and puts the number in place of `#`. */
export function plural(lang: Lang, count: number, forms: PluralForms) {
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
  sections: 'Sections',
  lessonsTab: 'Lessons',
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

  tests: {
    title: 'Tests',
    tagline: 'A short test for every lesson. Check what you remember and keep track of your scores.',
    passed: '{} tests passed',
    passMark: (percent: number) => `pass mark ${percent}%`,
    questionCount: (n: number) => plural('en', n, { one: '# question', other: '# questions' }),
    nextUp: { start: 'Start with', continue: 'Continue with', review: 'All passed! Retake' },
    empty: 'No tests yet. Add a Markdown file to the {} folder and push it to GitHub.',
    pageTitle: (title: string) => `Test: ${title}`,
    lede: 'Choose your answers, then check them at the end. Your scores are saved in this browser.',
    best: 'Best score: {}',
    readLesson: 'Read the lesson',
    take: 'Take the test',
    check: 'Check answers',
    answered: '{} answered',
    result: '{} correct',
    pass: 'Passed!',
    fail: (percent: number) => `Not passed yet. You need at least ${percent}%.`,
    retry: 'Try again',
    pager: 'Other tests',
    // Inside tests.
    selectAll: 'Select all that apply.',
    right: 'Correct',
    wrong: 'Incorrect',
    skipped: 'Not answered',
  },

  account: {
    signIn: 'Sign in',
    signInHint: 'Sign in with GitHub to comment on the notes',
    menu: 'Your account',
    signedInAs: 'Signed in as {}',
    signOut: 'Sign out',
  },

  // Readers' comments on the notes. Plain text and plural forms only: pages pass them to comments.ts as JSON.
  comments: {
    signInToSee: 'Sign in to see comments',
    count: { one: '# comment', other: '# comments' } as PluralForms,
    toggle: 'Highlight comments in the text',
    hint: 'Select text to comment',
    comment: 'Comment',
    heading: 'Comment on this passage',
    close: 'Close',
    commentLabel: 'Comment',
    placeholder: 'What is unclear, wrong or missing?',
    suggest: 'Suggest a change',
    suggestionLabel: 'Replace the passage with',
    publicNote: 'Posted publicly as {} in the GitHub issues of the notes.',
    signInNote: "Sign in with GitHub to post it. What you've written is kept.",
    signIn: 'Sign in with GitHub',
    cancel: 'Cancel',
    post: 'Post comment',
    posting: 'Posting…',
    posted: 'Comment posted.',
    viewOnGitHub: 'View on GitHub',
    tooLong: 'Select a shorter passage, up to # characters.',
    errors: {
      empty: 'Write a comment or change the passage.',
      signedOut: "You've been signed out. Sign in again to post; what you've written is kept.",
      rateLimited: 'GitHub is busy. Try again in a few minutes.',
      generic: "The comment couldn't be posted. Try again in a moment.",
    },
    suggestedChange: 'Suggested change',
    replies: { one: '# reply', other: '# replies' } as PluralForms,
    review: 'Awaiting review',
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
  sections: 'Sekcje',
  lessonsTab: 'Lekcje',
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

  tests: {
    title: 'Testy',
    tagline: 'Krótki test do każdej lekcji. Sprawdź, co pamiętasz, i śledź swoje wyniki.',
    passed: 'Zaliczone testy: {}',
    passMark: (percent) => `próg zaliczenia ${percent}%`,
    questionCount: (n) => plural('pl', n, { one: '# pytanie', few: '# pytania', many: '# pytań', other: '# pytania' }),
    nextUp: { start: 'Na początek:', continue: 'Kontynuuj:', review: 'Wszystko zaliczone! Powtórz:' },
    empty: 'Nie ma jeszcze testów. Dodaj plik Markdown do folderu {} i wypchnij go na GitHuba.',
    pageTitle: (title) => `Test: ${title}`,
    lede: 'Zaznacz odpowiedzi, a na końcu je sprawdź. Wyniki zapisują się w tej przeglądarce.',
    best: 'Najlepszy wynik: {}',
    readLesson: 'Przeczytaj lekcję',
    take: 'Rozwiąż test',
    check: 'Sprawdź odpowiedzi',
    answered: 'Odpowiedziano: {}',
    result: 'Poprawne odpowiedzi: {}',
    pass: 'Zaliczony!',
    fail: (percent) => `Test nie jest jeszcze zaliczony. Potrzeba co najmniej ${percent}%.`,
    retry: 'Spróbuj jeszcze raz',
    pager: 'Inne testy',
    selectAll: 'Zaznacz wszystkie poprawne odpowiedzi.',
    right: 'Dobra odpowiedź',
    wrong: 'Zła odpowiedź',
    skipped: 'Brak odpowiedzi',
  },

  account: {
    signIn: 'Zaloguj się',
    signInHint: 'Zaloguj się przez GitHuba, aby komentować notatki',
    menu: 'Twoje konto',
    signedInAs: 'Zalogowano jako {}',
    signOut: 'Wyloguj się',
  },

  comments: {
    signInToSee: 'Zaloguj się, aby zobaczyć komentarze',
    count: { one: '# komentarz', few: '# komentarze', many: '# komentarzy', other: '# komentarza' },
    toggle: 'Wyróżnij komentarze w tekście',
    hint: 'Zaznacz tekst, aby go skomentować',
    comment: 'Skomentuj',
    heading: 'Komentarz do fragmentu',
    close: 'Zamknij',
    commentLabel: 'Komentarz',
    placeholder: 'Co jest niejasne, błędne albo czego brakuje?',
    suggest: 'Zaproponuj zmianę',
    suggestionLabel: 'Zastąp fragment tekstem',
    publicNote: 'Komentarz będzie publiczny: trafi do zgłoszeń (issues) notatek na GitHubie jako {}.',
    signInNote: 'Zaloguj się przez GitHuba, aby go wysłać. To, co napisano, nie przepadnie.',
    signIn: 'Zaloguj się przez GitHuba',
    cancel: 'Anuluj',
    post: 'Wyślij komentarz',
    posting: 'Wysyłanie…',
    posted: 'Komentarz wysłany.',
    viewOnGitHub: 'Zobacz na GitHubie',
    tooLong: 'Zaznacz krótszy fragment, do # znaków.',
    errors: {
      empty: 'Napisz komentarz albo zmień fragment.',
      signedOut: 'Sesja wygasła. Zaloguj się ponownie, aby wysłać komentarz; to, co napisano, nie przepadnie.',
      rateLimited: 'GitHub jest przeciążony. Spróbuj ponownie za kilka minut.',
      generic: 'Nie udało się wysłać komentarza. Spróbuj ponownie za chwilę.',
    },
    suggestedChange: 'Proponowana zmiana',
    replies: { one: '# odpowiedź', few: '# odpowiedzi', many: '# odpowiedzi', other: '# odpowiedzi' },
    review: 'Czeka na przegląd',
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
