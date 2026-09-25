/**
 * Turns the files in notes/ into a course: folders are chapters, Markdown files are lessons.
 * Numbered files and folders (01-, 02-, …) come first, in number order; the rest follow
 * alphabetically by title. A note's translations sit next to it: `sft.pl.md` is the
 * Polish version of `sft.md`, and pages without a translation show the original.
 * Tests live in tests/, each at the same path as the lesson it tests. Exam questions live in
 * exams/ the same way, and each top-level chapter with some gets an exam that draws from them.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../site.config.ts';
import { DEFAULT_LANG, LANGS, localizeUrl, type Lang } from './i18n.ts';
import type { Quiz } from './markdown.ts';
import {
  EXAMS_DIR,
  EXAMS_PATH,
  NOTES_DIR,
  TESTS_DIR,
  TESTS_PATH,
  examQuestionId,
  examUrl,
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
type ExamNote = CollectionEntry<'exams'>;

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
  /** The chapter's exam; only top-level chapters have one. */
  exam?: Exam;
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

export interface Exam {
  kind: 'exam';
  /** The top-level chapter it covers, with the chapters and lessons inside it. */
  chapter: Chapter;
  /** Language-neutral URL, e.g. `/exams/foundations/`. */
  path: string;
  url: string;
  /** The chapter's title. */
  title: string;
  /** The chapter's lessons that have exam questions, in reading order. */
  parts: ExamPart[];
  /** Number of questions in all, which attempts draw from. */
  questions: number;
  /** Number of questions in an attempt: `exams.questions` in site.config.ts, or all of them when there are fewer. */
  drawn: number;
}

/** A lesson's exam questions. */
export interface ExamPart {
  lesson: Lesson;
  /** The questions in the course's language, or the original when they aren't translated yet. */
  note: ExamNote;
  /** Language of `note`. */
  lang: Lang;
  /** Every language version of the questions; the exam's version changes with each of them. */
  versions: ExamNote[];
  /** Each question's id and right answers, the same in every language. */
  key: { id: string; right: number[] }[];
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
  /** Every exam, in the order of the chapters. */
  exams: Exam[];
  /** Lessons, chapters, tests and exams by language-neutral path. */
  byPath: Map<string, Node>;
}

type Node = Chapter | Lesson | Test | Exam;

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
  const byPath = new Map<string, Node>();

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
  const exams = await addExams(lang, root, byPath, drafts);
  return { lang, root, lessons, chapters, tests, testsIntro, exams, byPath };
}

/**
 * Gives every lesson that has a file at the same path in tests/ its test, and
 * returns the tests overview's introduction. Mistakes in a test fail the build.
 */
async function addTests(
  lang: Lang,
  byPath: Map<string, Node>,
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

/**
 * Gives each top-level chapter whose lessons have questions in exams/ its exam. The questions
 * are written like tests, and one answer key grades every language, so translations have to
 * ask the same questions with the same answers, in the same order. Mistakes fail the build;
 * the build's messages never say which answers are right.
 */
async function addExams(
  lang: Lang,
  root: Chapter,
  byPath: Map<string, Node>,
  /** Paths of lessons hidden with `draft: true`, whose exam questions are left out too. */
  drafts: Set<string>,
): Promise<Exam[]> {
  const entries = await getCollection('exams', (entry) => !entry.data.draft);
  const parts = new Map<Lesson, ExamPart>();
  /** Which file each question id comes from, since lessons' paths can give the same ids. */
  const ids = new Map<string, ExamNote>();

  for (const [file, versions] of groupTranslations(entries)) {
    // README files describe the repository the questions are kept in.
    if (isIndexFile(file.slice(file.lastIndexOf('/') + 1))) continue;
    const noteLang = pickLang(versions, lang);
    const note = versions.get(noteLang)!;
    const lessonPath = noteUrl(file);
    const lesson = byPath.get(lessonPath);
    if (lesson?.kind !== 'lesson') {
      if (drafts.has(lessonPath)) continue;
      throw new Error(
        `"${note.filePath}" has no lesson to ask about: there's no lesson at ${lessonPath}. ` +
          `Exam questions have the same path in ${EXAMS_DIR}/ as their lesson in ${NOTES_DIR}/, like "${EXAMS_DIR}/vocabulary/sft.md" for "${NOTES_DIR}/vocabulary/sft.md".`,
      );
    }
    if (lesson.parents.length === 0) {
      throw new Error(
        `"${note.filePath}" asks about "${lesson.note.filePath}", which isn't in a chapter. Each exam covers a chapter, so only lessons in a chapter's folder can have exam questions.`,
      );
    }
    const taken = parts.get(lesson);
    if (taken) {
      throw new Error(`"${taken.note.filePath}" and "${note.filePath}" both hold exam questions on "${lesson.note.filePath}". Merge them into one.`);
    }

    // The original first, so the messages below compare translations with it.
    const all = [DEFAULT_LANG, ...LANGS.filter((code) => code !== DEFAULT_LANG)].flatMap((code) => versions.get(code) ?? []);
    const key = sameKey(all).map((question, i) => ({ id: examQuestionId(lessonPath, i + 1), right: question.right }));
    for (const { id } of key) {
      const other = ids.get(id);
      if (other) {
        throw new Error(`"${other.filePath}" and "${note.filePath}" would give their questions the same ids, like "${id}". Rename one of their lessons.`);
      }
      ids.set(id, note);
    }
    parts.set(lesson, { lesson, note, lang: noteLang, versions: all, key });
  }

  const exams: Exam[] = [];
  for (const chapter of root.children) {
    if (chapter.kind !== 'chapter') continue;
    const chapterParts = chapter.lessons.flatMap((lesson) => parts.get(lesson) ?? []);
    if (chapterParts.length === 0) continue;
    const path = examUrl(chapter.path);
    const questions = chapterParts.reduce((sum, part) => sum + part.key.length, 0);
    chapter.exam = {
      kind: 'exam',
      chapter,
      path,
      url: localizeUrl(path, lang),
      title: chapter.title,
      parts: chapterParts,
      questions,
      drawn: Math.min(site.exams.questions, questions),
    };
    byPath.set(path, chapter.exam);
    exams.push(chapter.exam);
  }
  return exams;
}

/** The answer key the language versions of a lesson's exam questions share; throws if they don't. */
function sameKey(versions: ExamNote[]): NonNullable<Quiz['key']> {
  const [first, ...others] = versions.map((note) => ({ note, key: readQuiz(note).key ?? [] }));
  for (const other of others) {
    const [a, b] = [first.note.filePath, other.note.filePath];
    if (other.key.length !== first.key.length) {
      throw new Error(
        `"${a}" has ${first.key.length} questions and its translation "${b}" has ${other.key.length}. Translations of exam questions ask the same questions, in the same order.`,
      );
    }
    first.key.forEach((question, i) => {
      const translated = other.key[i];
      if (translated.answers !== question.answers) {
        throw new Error(
          `Question ${i + 1} has ${question.answers} answers in "${a}" and ${translated.answers} in its translation "${b}". Translations list the same answers, in the same order.`,
        );
      }
      if (translated.right.join() !== question.right.join()) {
        throw new Error(
          `Question ${i + 1} has different right answers in "${a}" and in its translation "${b}". Translations list the same answers in the same order, with the same ones marked "[x]".`,
        );
      }
    });
  }
  return first.key;
}

/** The questions the quizzes plugin (markdown.ts) found in a test or exam file; throws if the file has mistakes. */
function readQuiz(note: TestNote | ExamNote): Quiz {
  const kind = note.collection === 'exams' ? 'set of exam questions' : 'test';
  const frontmatter = note.rendered?.metadata?.frontmatter as { quiz?: Quiz } | undefined;
  const quiz = frontmatter?.quiz;
  if (!quiz) throw new Error(`"${note.filePath}" couldn't be read as a ${kind}. The error above says why.`);
  const problems = quiz.questions.length
    ? quiz.problems
    : ['It has no questions. Start each question with a "## " heading and list its answers under it, like "- [x] a right answer" and "- [ ] a wrong one".'];
  if (problems.length) throw new Error(`"${note.filePath}" isn't a valid ${kind}:\n- ${problems.join('\n- ')}`);
  return quiz;
}

/** Collects each note's language versions under its path without a language code. */
function groupTranslations<T extends Note | TestNote | ExamNote>(entries: T[]): Map<string, Map<Lang, T>> {
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

function claimPath(byPath: Map<string, Node>, node: Chapter | Lesson) {
  const describe = (n: Node) =>
    n.kind === 'chapter' ? `${NOTES_DIR}/${n.dir}/` : n.kind === 'exam' ? `${EXAMS_DIR}/` : n.note.filePath;
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
  if (node.path.startsWith(EXAMS_PATH)) {
    throw new Error(`"${describe(node)}" would be published at ${node.path}, where the chapter exams live. Rename it.`);
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

/** Path of a note inside notes/, a test inside tests/ or exam questions inside exams/, including any language code. */
function entryFile(entry: Note | TestNote | ExamNote): string {
  const dir = { notes: NOTES_DIR, tests: TESTS_DIR, exams: EXAMS_DIR }[entry.collection];
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
