/**
 * Turns the files in notes/ into a course: folders are chapters, Markdown files are lessons.
 * Numbered files and folders (01-, 02-, …) come first, in number order; the rest follow
 * alphabetically by title. A note's translations sit next to it: `sft.pl.md` is the
 * Polish version of `sft.md`, and pages without a translation show the original.
 * Tests live in tests/, each at the same path as the lesson it tests.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LANG, LANGS, localizeUrl, type Lang } from './i18n.ts';
import type { Quiz } from './markdown.ts';
import {
  NOTES_DIR,
  TESTS_DIR,
  TESTS_PATH,
  hasOrder,
  isIndexFile,
  leadingHeading,
  noteUrl,
  prettify,
  splitLang,
  testUrl,
  withLang,
} from './paths.ts';

type Note = CollectionEntry<'notes'>;
type TestNote = CollectionEntry<'tests'>;

export interface Lesson {
  kind: 'lesson';
  note: Note;
  /** Language of `note`; not the course's language when the lesson isn't translated yet. */
  lang: Lang;
  /** Path inside notes/ without a language code, e.g. `02-foundations/01-what-is-ml.md`. */
  file: string;
  /** Language-neutral URL, e.g. `/foundations/what-is-ml/`; also the key for progress and test scores. */
  path: string;
  /** URL in the course's language, e.g. `/pl/foundations/what-is-ml/`. */
  url: string;
  title: string;
  description?: string;
  minutes: number;
  /** Enclosing chapters, outermost first. */
  parents: Chapter[];
  test?: Test;
}

export interface Chapter {
  kind: 'chapter';
  /** Folder inside notes/, `''` for notes/ itself. */
  dir: string;
  /** Language of `intro`. */
  lang: Lang;
  path: string;
  url: string;
  title: string;
  description?: string;
  /** The folder's README.md or index.md. */
  intro?: Note;
  children: (Chapter | Lesson)[];
  /** Every lesson inside, in reading order. */
  lessons: Lesson[];
  parents: Chapter[];
}

export interface Test {
  kind: 'test';
  note: TestNote;
  /** Language of `note`; not the course's language when the test isn't translated yet. */
  lang: Lang;
  /** Path inside tests/ without a language code, e.g. `02-foundations/02-linear-regression.md`. */
  file: string;
  lesson: Lesson;
  /** Language-neutral URL, e.g. `/tests/foundations/linear-regression/`. */
  path: string;
  url: string;
  /** The lesson's title. */
  title: string;
  description?: string;
  /** Number of questions. */
  questions: number;
}

export interface Course {
  lang: Lang;
  /** notes/ itself; its README.md is the home page intro. */
  root: Chapter;
  /** Every lesson in reading order. */
  lessons: Lesson[];
  /** Every folder except the root, in reading order. */
  chapters: Chapter[];
  /** Every test, in the order of the lessons. */
  tests: Test[];
  /** tests/README.md, the introduction on the tests overview. */
  testsIntro?: { note: TestNote; lang: Lang };
  /** Lessons, chapters and tests by language-neutral path. */
  byPath: Map<string, Chapter | Lesson | Test>;
}

/** File names sort the same way in every language, so numbered lessons keep one order. */
const nameCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

const cache = new Map<Lang, Promise<Course>>();

export function getCourse(lang: Lang = DEFAULT_LANG): Promise<Course> {
  if (import.meta.env.DEV) return buildCourse(lang); // notes change while the dev server runs
  let course = cache.get(lang);
  if (!course) cache.set(lang, (course = buildCourse(lang)));
  return course;
}

async function buildCourse(lang: Lang): Promise<Course> {
  const allNotes = await getCollection('notes');
  const notes = allNotes.filter((note) => !note.data.draft);
  const root = newChapter('', undefined, lang);
  const folders = new Map<string, Chapter>([['', root]]);

  function chapterFor(dir: string): Chapter {
    let chapter = folders.get(dir);
    if (!chapter) {
      const parent = chapterFor(dir.includes('/') ? dir.slice(0, dir.lastIndexOf('/')) : '');
      chapter = newChapter(dir, parent === root ? undefined : parent, lang);
      parent.children.push(chapter);
      folders.set(dir, chapter);
    }
    return chapter;
  }

  for (const [file, versions] of groupTranslations(notes)) {
    const noteLang = pickLang(versions, lang);
    const note = versions.get(noteLang)!;
    const slash = file.lastIndexOf('/');
    const dir = slash === -1 ? '' : file.slice(0, slash);
    const name = file.slice(slash + 1);
    const chapter = chapterFor(dir);
    const title = note.data.title ?? leadingHeading(note.body);

    if (isIndexFile(name)) {
      chapter.intro = note;
      chapter.lang = noteLang;
      if (title) chapter.title = title;
      chapter.description = note.data.description;
      continue;
    }

    const path = noteUrl(file);
    chapter.children.push({
      kind: 'lesson',
      note,
      lang: noteLang,
      file,
      path,
      url: localizeUrl(path, lang),
      title: title ?? prettify(name),
      description: note.data.description,
      minutes: readingMinutes(note.body),
      parents: chapter === root ? [] : [...chapter.parents, chapter],
    });
  }

  const titleCollator = new Intl.Collator(lang, { numeric: true, sensitivity: 'base' });
  const chapters: Chapter[] = [];
  const byPath = new Map<string, Chapter | Lesson | Test>();

  function compare(a: Chapter | Lesson, b: Chapter | Lesson): number {
    const [nameA, nameB] = [sortName(a), sortName(b)];
    const [numberedA, numberedB] = [hasOrder(nameA), hasOrder(nameB)];
    if (numberedA !== numberedB) return numberedA ? -1 : 1;
    if (numberedA) return nameCollator.compare(nameA, nameB);
    return titleCollator.compare(a.title, b.title) || nameCollator.compare(nameA, nameB);
  }

  function finish(chapter: Chapter): Lesson[] {
    chapter.children.sort(compare);
    chapter.lessons = chapter.children.flatMap((child) => {
      claimPath(byPath, child);
      if (child.kind === 'lesson') return [child];
      chapters.push(child);
      return finish(child);
    });
    return chapter.lessons;
  }

  const lessons = finish(root);
  const drafts = new Set(allNotes.filter((note) => note.data.draft).map((note) => noteUrl(splitLang(entryFile(note)).file)));
  const testsIntro = await addTests(lang, byPath, drafts);
  const tests = lessons.flatMap((lesson) => lesson.test ?? []);
  return { lang, root, lessons, chapters, tests, testsIntro, byPath };
}

/**
 * Gives every lesson that has a file at the same path in tests/ its test, and
 * returns the tests overview's introduction. Mistakes in a test fail the build.
 */
async function addTests(
  lang: Lang,
  byPath: Map<string, Chapter | Lesson | Test>,
  /** Paths of lessons hidden with `draft: true`, whose tests are hidden too. */
  drafts: Set<string>,
): Promise<Course['testsIntro']> {
  let intro: Course['testsIntro'];
  const entries = await getCollection('tests', (entry) => !entry.data.draft);
  for (const [file, versions] of groupTranslations(entries)) {
    const noteLang = pickLang(versions, lang);
    const note = versions.get(noteLang)!;

    if (isIndexFile(file.slice(file.lastIndexOf('/') + 1))) {
      if (file.includes('/')) {
        throw new Error(
          `"${note.filePath}" would introduce a folder of tests, but only ${TESTS_DIR}/README.md is used as an introduction. Move its text there.`,
        );
      }
      intro = { note, lang: noteLang };
      continue;
    }

    const lessonPath = noteUrl(file);
    const lesson = byPath.get(lessonPath);
    if (lesson?.kind !== 'lesson') {
      if (drafts.has(lessonPath)) continue;
      throw new Error(
        `"${note.filePath}" has no lesson to test: there's no lesson at ${lessonPath}. ` +
          `A test has the same path in ${TESTS_DIR}/ as its lesson in ${NOTES_DIR}/, like "${TESTS_DIR}/vocabulary/sft.md" for "${NOTES_DIR}/vocabulary/sft.md".`,
      );
    }
    if (lesson.test) {
      throw new Error(
        `"${lesson.test.note.filePath}" and "${note.filePath}" are both tests for "${lesson.note.filePath}". Delete one of them.`,
      );
    }

    const path = testUrl(lessonPath);
    lesson.test = {
      kind: 'test',
      note,
      lang: noteLang,
      file,
      lesson,
      path,
      url: localizeUrl(path, lang),
      title: lesson.title,
      description: note.data.description,
      questions: readQuiz(note).questions.length,
    };
    byPath.set(path, lesson.test);
  }
  return intro;
}

/** The questions the quizzes plugin (markdown.ts) found in a test; throws if the test has mistakes. */
function readQuiz(note: TestNote): Quiz {
  const frontmatter = note.rendered?.metadata?.frontmatter as { quiz?: Quiz } | undefined;
  const quiz = frontmatter?.quiz;
  if (!quiz) throw new Error(`"${note.filePath}" couldn't be read as a test. The error above says why.`);
  const problems = quiz.questions.length
    ? quiz.problems
    : ['It has no questions. Start each question with a "## " heading and list its answers under it, like "- [x] a right answer" and "- [ ] a wrong one".'];
  if (problems.length) throw new Error(`"${note.filePath}" isn't a valid test:\n- ${problems.join('\n- ')}`);
  return quiz;
}

/** Collects each note's language versions under its path without a language code. */
function groupTranslations<T extends Note | TestNote>(entries: T[]): Map<string, Map<Lang, T>> {
  const groups = new Map<string, Map<Lang, T>>();
  for (const entry of entries) {
    const { file, lang } = splitLang(entryFile(entry));
    const versions = groups.get(file) ?? new Map<Lang, T>();
    const taken = versions.get(lang);
    if (taken) {
      throw new Error(`"${taken.filePath}" and "${entry.filePath}" are both the "${lang}" version of one note. Delete one of them.`);
    }
    groups.set(file, versions.set(lang, entry));
  }
  return groups;
}

/** This language if it's there, otherwise the original. */
function pickLang(versions: Map<Lang, unknown>, lang: Lang): Lang {
  return [lang, DEFAULT_LANG, ...LANGS].find((code) => versions.has(code))!;
}

function newChapter(dir: string, parent: Chapter | undefined, lang: Lang): Chapter {
  const path = noteUrl(dir);
  return {
    kind: 'chapter',
    dir,
    lang,
    path,
    url: localizeUrl(path, lang),
    title: prettify(dir.slice(dir.lastIndexOf('/') + 1)),
    children: [],
    lessons: [],
    parents: parent ? [...parent.parents, parent] : [],
  };
}

function sortName(node: Chapter | Lesson): string {
  const path = node.kind === 'chapter' ? node.dir : node.file;
  return path.slice(path.lastIndexOf('/') + 1);
}

function claimPath(byPath: Map<string, Chapter | Lesson | Test>, node: Chapter | Lesson) {
  const describe = (n: Chapter | Lesson | Test) => (n.kind === 'chapter' ? `${NOTES_DIR}/${n.dir}/` : n.note.filePath);
  const prefix = LANGS.find((code) => code !== DEFAULT_LANG && node.path.startsWith(`/${code}/`));
  if (prefix) {
    throw new Error(
      `"${describe(node)}" would be published at ${node.path}, where the "${prefix}" version of the site lives. ` +
        `Rename it. Translations sit next to the original instead, like "sft.${prefix}.md" next to "sft.md".`,
    );
  }
  if (node.path.startsWith(TESTS_PATH)) {
    throw new Error(`"${describe(node)}" would be published at ${node.path}, where the tests live. Rename it.`);
  }
  const taken = byPath.get(node.path);
  if (taken) {
    throw new Error(
      `"${describe(taken)}" and "${describe(node)}" would both be published at ${node.path}. Rename one of them.`,
    );
  }
  byPath.set(node.path, node);
}

function readingMinutes(body = ''): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Path of a note inside notes/, or of a test inside tests/, including any language code. */
function entryFile(entry: Note | TestNote): string {
  const dir = entry.collection === 'tests' ? TESTS_DIR : NOTES_DIR;
  return (entry.filePath ?? '').slice(dir.length + 1);
}

/** Id of a top-level chapter's section on the tests overview, like `foundations`. */
export function testGroupId(chapter: Chapter): string {
  return chapter.path.slice(1, -1).replaceAll('/', '-');
}

/** Link that opens the note or test in GitHub's web editor. */
export function editUrl(repo: string, branch: string, note: Note | TestNote): string {
  return `${repo}/edit/${branch}/${encodePath(note.filePath ?? '')}`;
}

/** Link to GitHub's "new file" page inside a chapter's folder. */
export function newLessonUrl(repo: string, branch: string, chapter: Chapter): string {
  return `${repo}/new/${branch}/${encodePath([NOTES_DIR, chapter.dir].filter(Boolean).join('/'))}`;
}

/** Link to GitHub's "new file" page, named for the note's or test's translation into `lang`. */
export function translateUrl(repo: string, branch: string, note: Note | TestNote, lang: Lang): string {
  const file = splitLang(note.filePath ?? '').file;
  const slash = file.lastIndexOf('/');
  const name = withLang(file.slice(slash + 1), lang);
  return `${repo}/new/${branch}/${encodePath(file.slice(0, Math.max(slash, 0)))}?filename=${encodeURIComponent(name)}`;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}
