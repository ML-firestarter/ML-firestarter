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

  // Chapter exams, which the site grades.
  exams: {
    exam: 'Chapter exam',
    pageTitle: (title: string) => `Exam: ${title}`,
    lede: 'One exam on the whole chapter. The site checks your answers and keeps your results, tied to your GitHub account.',
    take: 'Take the chapter exam',
    readChapter: 'Read the chapter',
    howItWorks: 'How it works',
    rules: (questions: number, percent: number, wait: number, time: number) => [
      `${plural('en', questions, { one: '# question', other: '# questions' })}, drawn from the chapter's lessons.`,
      `You pass with at least ${percent}%, and then the exam is done.`,
      `After an attempt that doesn't pass, you can try again ${plural('en', wait, { one: '# hour', other: '# hours' })} later.`,
      `Hand in within ${plural('en', time, { one: '# hour', other: '# hours' })} of starting. You can leave and come back until then.`,
      "The site doesn't show which answers are right, only your score and the lessons to read again.",
    ],
    untranslated: (inLanguage: string) => `Questions that haven't been translated into English yet are shown ${inLanguage}.`,
    signIn: 'Sign in with GitHub',
    // Plain text and plural forms only: the exam page passes them to exam.ts as JSON, which fills in `{date}` and `{score}`.
    script: {
      loading: 'Loading your results…',
      signedOut: 'Sign in with GitHub to take the exam. Your results are tied to your GitHub account.',
      start: 'Start the exam',
      starting: 'Starting…',
      passed: 'You passed this exam on {date}, with {score}.',
      waiting: 'You can try again from {date}.',
      last: 'Your last attempt: {score}.',
      due: 'Hand in by {date}.',
      handIn: 'Hand in',
      handingIn: 'Handing in…',
      unanswered: { one: 'One question has no answer yet.', other: '# questions have no answer yet.' } as PluralForms,
      pass: 'Passed! The exam is done.',
      fail: 'Not passed this time. You need at least {score}.',
      review: 'Lessons to read again',
      retry: 'Try again',
      errors: {
        signedOut: "You've been signed out. Sign in again; your answers are kept.",
        notConfigured: "Exams aren't set up on this site yet.",
        outdated: 'This page is out of date. Reload it to take the exam.',
        expired: 'This attempt is over: it ran out of time, or the site has changed since it started. Start the exam again.',
        handedIn: 'This attempt was handed in already, maybe in another tab.',
        changed: 'The questions have changed since you started this attempt. Start the exam again.',
        rateLimited: 'GitHub is busy. Try again in a few minutes.',
        generic: 'Something went wrong. Try again in a moment.',
      },
      // The certificate readers can ask for once they've passed.
      certificate: {
        title: 'Your certificate',
        offer:
          "Get a certificate for this chapter, issued by the site's bot. It's public: its page shows your GitHub name, the chapter, when you passed and your score, and the bot keeps it in a public repository on GitHub.",
        get: 'Get your certificate',
        getting: 'Getting it…',
        ready: 'Your certificate for this chapter is ready. Share its page, or add it to your GitHub profile from there.',
        see: 'See your certificate',
        outdated: 'This page is out of date. Reload it to get your certificate.',
      },
    },
  },

  // The certificate page. Plain text only in `script`: the page passes it to certificate.ts as JSON, which fills in `{…}`.
  certificates: {
    title: 'Certificate',
    description: 'A certificate for passing a chapter exam, issued by the site.',
    // The page without a certificate's id in its address.
    heading: 'Certificates',
    lede: "Readers who pass a chapter exam can get a certificate for it, issued by the site's bot. Each certificate has a page of its own, at an address they can share.",
    exams: 'See the chapter exams',
    script: {
      pageTitle: 'Certificate: {name}',
      loading: 'Loading the certificate…',
      missing: "This certificate doesn't exist",
      missingLede: 'Check the address. The certificate may also have been withdrawn.',
      failed: "The certificate couldn't be loaded. Try again in a moment.",
      retry: 'Try again',
      eyebrow: 'Certificate',
      statement: 'has passed the chapter exam of',
      passed: 'Passed on {date}, with {score}: {right} of {questions} questions right.',
      covered: 'The exam asked about these lessons:',
      issued: "Issued on {date} by the site's bot, which keeps the certificates in the public {repo} repository on GitHub.",
      id: 'Certificate {id}',
      file: 'See it on GitHub',
      history: 'Check who issued it',
      share: {
        title: 'Add it to your GitHub profile',
        text: 'Paste this into the README of your profile repository, {repo}, and GitHub shows this badge on your profile, linked to this page:',
        help: "What's a profile README?",
        copy: 'Copy',
        copied: 'Copied',
        alt: '{site} certificate: {chapter}',
      },
    },
  },

  account: {
    signIn: 'Sign in',
    signInHint: {
      comments: 'Sign in with GitHub to comment on the notes',
      exams: 'Sign in with GitHub to take the chapter exams',
      both: 'Sign in with GitHub to comment on the notes and take the chapter exams',
    },
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
    posted: "Comment posted. When a change from it is voted in on GitHub, you'll see it here.",
    viewOnGitHub: 'View on GitHub',
    tooLong: 'Select a shorter passage, up to # characters.',
    errors: {
      empty: 'Write a comment or change the passage.',
      signedOut: "You've been signed out. Sign in again to post; what you've written is kept.",
      rateLimited: 'GitHub is busy. Try again in a few minutes.',
      generic: "The comment couldn't be posted. Try again in a moment.",
    },
    // A comment's change, voted in on GitHub and waiting to be merged into the notes.
    votedChange: 'Change voted in',
    awaitingMerge: 'Awaiting merge',
    // A comment on another language version, shown on the passage its change rewrites in this one.
    onVersion: { en: 'Comment on the English version', pl: 'Comment on the Polish version' } satisfies Record<Lang, string>,
    discussion: 'Discussion',
    pullRequest: 'Pull request',
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

  exams: {
    exam: 'Egzamin z rozdziału',
    pageTitle: (title) => `Egzamin: ${title}`,
    lede: 'Jeden egzamin z całego rozdziału. Strona sprawdza odpowiedzi i zapisuje wyniki powiązane z Twoim kontem GitHub.',
    take: 'Podejdź do egzaminu z rozdziału',
    readChapter: 'Przeczytaj rozdział',
    howItWorks: 'Jak to działa',
    rules: (questions, percent, wait, time) => [
      `Egzamin ma ${plural('pl', questions, { one: '# pytanie', few: '# pytania', many: '# pytań', other: '# pytania' })}, które strona losuje z lekcji tego rozdziału.`,
      `Egzamin zaliczasz, zdobywając co najmniej ${percent}%. Wtedy jest ukończony.`,
      `Po niezaliczonym podejściu możesz spróbować ponownie ${plural('pl', wait, { one: 'po # godzinie', other: 'po # godzinach' })}.`,
      `Odpowiedzi oddaj w ciągu ${plural('pl', time, { one: '# godziny', other: '# godzin' })} od rozpoczęcia. Do tego czasu możesz przerwać i wrócić.`,
      'Strona nie pokazuje, które odpowiedzi są poprawne, tylko wynik i lekcje do powtórzenia.',
    ],
    untranslated: (inLanguage) => `Pytania, których nie przetłumaczono jeszcze na polski, są wyświetlane ${inLanguage}.`,
    signIn: 'Zaloguj się przez GitHuba',
    script: {
      loading: 'Wczytywanie wyników…',
      signedOut: 'Zaloguj się przez GitHuba, aby podejść do egzaminu. Wyniki są powiązane z Twoim kontem GitHub.',
      start: 'Rozpocznij egzamin',
      starting: 'Rozpoczynanie…',
      passed: 'Egzamin zaliczony {date} z wynikiem {score}.',
      waiting: 'Kolejne podejście możliwe od {date}.',
      last: 'Ostatnie podejście: {score}.',
      due: 'Odpowiedzi oddaj do {date}.',
      handIn: 'Oddaj odpowiedzi',
      handingIn: 'Oddawanie…',
      unanswered: {
        one: 'Jedno pytanie nie ma jeszcze odpowiedzi.',
        few: '# pytania nie mają jeszcze odpowiedzi.',
        many: '# pytań nie ma jeszcze odpowiedzi.',
        other: '# pytania nie ma jeszcze odpowiedzi.',
      },
      pass: 'Zaliczony! Egzamin jest ukończony.',
      fail: 'Tym razem niezaliczony. Potrzeba co najmniej {score}.',
      review: 'Lekcje do powtórzenia',
      retry: 'Spróbuj ponownie',
      errors: {
        signedOut: 'Sesja wygasła. Zaloguj się ponownie; zaznaczone odpowiedzi nie przepadną.',
        notConfigured: 'Egzaminy nie są jeszcze skonfigurowane na tej stronie.',
        outdated: 'Ta strona jest nieaktualna. Odśwież ją, aby podejść do egzaminu.',
        expired: 'To podejście się skończyło: minął czas albo strona zmieniła się od jego rozpoczęcia. Rozpocznij egzamin ponownie.',
        handedIn: 'To podejście zostało już oddane, może w innej karcie.',
        changed: 'Pytania zmieniły się od rozpoczęcia tego podejścia. Rozpocznij egzamin ponownie.',
        rateLimited: 'GitHub jest przeciążony. Spróbuj ponownie za kilka minut.',
        generic: 'Coś poszło nie tak. Spróbuj ponownie za chwilę.',
      },
      certificate: {
        title: 'Twój certyfikat',
        offer:
          'Odbierz certyfikat z tego rozdziału, wystawiony przez bota strony. Certyfikat jest publiczny: jego strona pokazuje Twoją nazwę na GitHubie, rozdział, datę zaliczenia i wynik, a bot przechowuje go w publicznym repozytorium na GitHubie.',
        get: 'Odbierz certyfikat',
        getting: 'Odbieranie…',
        ready: 'Twój certyfikat z tego rozdziału jest gotowy. Udostępnij jego stronę albo dodaj go stamtąd do profilu na GitHubie.',
        see: 'Zobacz certyfikat',
        outdated: 'Ta strona jest nieaktualna. Odśwież ją, aby odebrać certyfikat.',
      },
    },
  },

  certificates: {
    title: 'Certyfikat',
    description: 'Certyfikat zaliczenia egzaminu z rozdziału, wystawiony przez stronę.',
    heading: 'Certyfikaty',
    lede: 'Po zaliczeniu egzaminu z rozdziału można odebrać certyfikat wystawiony przez bota strony. Każdy certyfikat ma własną stronę pod adresem, który można udostępnić.',
    exams: 'Zobacz egzaminy z rozdziałów',
    script: {
      pageTitle: 'Certyfikat: {name}',
      loading: 'Wczytywanie certyfikatu…',
      missing: 'Ten certyfikat nie istnieje',
      missingLede: 'Sprawdź adres. Certyfikat mógł też zostać wycofany.',
      failed: 'Nie udało się wczytać certyfikatu. Spróbuj ponownie za chwilę.',
      retry: 'Spróbuj ponownie',
      eyebrow: 'Certyfikat',
      statement: 'ma zaliczony egzamin z rozdziału',
      passed: 'Data zaliczenia: {date}. Wynik: {score}, poprawne odpowiedzi: {right} z {questions}.',
      covered: 'Egzamin obejmował te lekcje:',
      issued: 'Wystawiony {date} przez bota strony, który przechowuje certyfikaty w publicznym repozytorium {repo} na GitHubie.',
      id: 'Certyfikat {id}',
      file: 'Zobacz na GitHubie',
      history: 'Sprawdź, kto go wystawił',
      share: {
        title: 'Dodaj go do profilu na GitHubie',
        text: 'Wklej to do pliku README w repozytorium profilu, {repo}, a GitHub pokaże na profilu tę odznakę z linkiem do tej strony:',
        help: 'Czym jest README profilu?',
        copy: 'Kopiuj',
        copied: 'Skopiowano',
        alt: 'Certyfikat {site}: {chapter}',
      },
    },
  },

  account: {
    signIn: 'Zaloguj się',
    signInHint: {
      comments: 'Zaloguj się przez GitHuba, aby komentować notatki',
      exams: 'Zaloguj się przez GitHuba, aby podchodzić do egzaminów z rozdziałów',
      both: 'Zaloguj się przez GitHuba, aby komentować notatki i podchodzić do egzaminów z rozdziałów',
    },
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
    posted: 'Komentarz wysłany. Gdy zmiana z niego zostanie przegłosowana na GitHubie, zobaczysz ją tutaj.',
    viewOnGitHub: 'Zobacz na GitHubie',
    tooLong: 'Zaznacz krótszy fragment, do # znaków.',
    errors: {
      empty: 'Napisz komentarz albo zmień fragment.',
      signedOut: 'Sesja wygasła. Zaloguj się ponownie, aby wysłać komentarz; to, co napisano, nie przepadnie.',
      rateLimited: 'GitHub jest przeciążony. Spróbuj ponownie za kilka minut.',
      generic: 'Nie udało się wysłać komentarza. Spróbuj ponownie za chwilę.',
    },
    votedChange: 'Przegłosowana zmiana',
    awaitingMerge: 'Czeka na scalenie',
    onVersion: { en: 'Komentarz do wersji angielskiej', pl: 'Komentarz do wersji polskiej' },
    discussion: 'Dyskusja',
    pullRequest: 'Pull request',
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
