/**
 * Turns the files in notes/ into a course: folders are chapters, Markdown files are lessons.
 * Numbered files and folders (01-, 02-, …) come first, in number order; the rest follow
 * alphabetically by title. A note's translations sit next to it: `sft.pl.md` is the
 * Polish version of `sft.md`, and pages without a translation show the original.
 * Tests live in tests/, each at the same path as the lesson it tests. Exam questions live in
 * exams/ the same way, and each top-level chapter with some gets an exam that draws from them;
 * a chapter's folder in exams/ can also hold practical tasks in a `tasks/` folder, which the
 * chapter's exam gives in full. Exercises live in exercises/, each in a folder of its own inside
 * a folder with its lesson's path.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { site } from '../site.config.ts';
import { DEFAULT_LANG, LANGS, localizeUrl, type Lang } from './i18n.ts';
import type { Quiz } from './markdown.ts';
import {
  CERTIFICATES_PATH,
  EXAMS_DIR,
  EXAMS_PATH,
  EXERCISES_DIR,
  EXERCISES_PATH,
  NOTES_DIR,
  TESTS_DIR,
  TESTS_PATH,
  examQuestionId,
  examTaskFile,
  examTaskId,
  examUrl,
  exerciseUrl,
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
type ExamTaskNote = CollectionEntry<'examTasks'>;
type ExerciseNote = CollectionEntry<'exercises'>;

export interface Lesson {
  kind: 'lesson';
  note: Note;
  /** Language of `note`; not the course's language when the lesson isn't translated yet. */
  lang: Lang;
  /** Path inside notes/ without a language code, e.g. `04-foundations/01-what-is-ml.md`. */
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
  /** In order. */
  exercises: Exercise[];
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
  /** Path inside tests/ without a language code, e.g. `04-foundations/02-linear-regression/01-predictions.md`. */
  file: string;
  lesson: Lesson;
  /** Language-neutral URL, e.g. `/tests/foundations/linear-regression/predictions/`. */
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
  /** The chapter's practical tasks, in the order of their folders; every attempt gives all of them. */
  tasks: ExamTask[];
  /** The lessons the exam asks about or has tasks on, in reading order. */
  lessons: Lesson[];
  /** Number of questions in all, which attempts draw from; tasks aren't counted. */
  questions: number;
  /** Number of questions in an attempt: `exams.questions` in site.config.ts, or all of them when there are fewer. Tasks aren't counted. */
  drawn: number;
}

export interface Exercise {
  kind: 'exercise';
  /** The task.md in the course's language, or the original when it isn't translated yet. */
  note: ExerciseNote;
  /** Language of `note`. */
  lang: Lang;
  /** Folder inside exercises/, e.g. `python/01-running-python/01-week`. */
  dir: string;
  lesson: Lesson;
  /** Language-neutral URL, e.g. `/exercises/python/running-python/week/`; also the key for the reader's progress and code. */
  path: string;
  url: string;
  title: string;
  description?: string;
  /** Its place among the lesson's exercises, counted from 1. */
  number: number;
  /** The code the reader starts from: starter.py. */
  starter: string;
  /** The code shown once the reader's passes: solution.py. */
  solution: string;
  /** The source of checks.py, which harness.py runs on the reader's code. */
  checks: string;
  /** Files the code can open, from the exercise's files/ folder, by path inside it, in base64. */
  files: Record<string, string>;
  /** What the input box holds at first; undefined when the code doesn't read input(), and there's no box. */
  input?: string;
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

/** A practical task of an exam: the reader writes Python, and the site checks it by running cases on the code. */
export interface ExamTask {
  /** Like `python-triangles`, the same in every language. */
  id: string;
  /** The task's folder inside exams/, like `02-python/tasks/01-triangles`. */
  dir: string;
  /** The task.md in the course's language, or the original when it isn't translated yet. */
  note: ExamTaskNote;
  /** Language of `note`. */
  lang: Lang;
  title: string;
  /** The lessons it draws on, in reading order, to read again after a mistake. */
  lessons: Lesson[];
  /** The code the reader starts from: starter.py. */
  starter: string;
  /** Files the code can open when the reader runs it, from the task's files/ folder, by path inside it, in base64. */
  files: Record<string, string>;
  /** What the input box holds at first; undefined when the code doesn't read input(), and there's no box. */
  input?: string;
  /** The instances attempts draw from: their cases, the files they read, and what the right code does with them (pool.json). */
  pool: PoolInstance[];
  /** Everything that makes up the task, in every language, as the exam's version has to change with each of it. */
  sources: { path: string; text: string }[];
}

/** One instance of an exam task, from its pool.json. */
export interface PoolInstance {
  /** Python expressions to evaluate in the reader's code, like `triangle_kind(3, 4, 5)`, or `program('3', '4')` to run it as a program. */
  cases: string[];
  /** The files the cases read, by name, as text. */
  files: Record<string, string>;
  /** What the right code does with each case, as `observe` in scripts/harness.py writes it: the right answers, which never leave the server. */
  expected: string[];
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
  /** Every exercise, in the order of the lessons. */
  exercises: Exercise[];
  /** Lessons, chapters, tests, exams and exercises by language-neutral path. */
  byPath: Map<string, Node>;
}

type Node = Chapter | Lesson | Test | Exam | Exercise;

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
      exercises: [],
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
  await addExercises(lang, byPath, drafts);
  const exercises = lessons.flatMap((lesson) => lesson.exercises);
  return { lang, root, lessons, chapters, tests, testsIntro, exams, exercises, byPath };
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
 * Gives each top-level chapter whose lessons have questions in exams/, or that has practical
 * tasks there, its exam. The questions are written like tests, and one answer key grades every
 * language, so translations have to ask the same questions with the same answers, in the same
 * order. Mistakes fail the build; the build's messages never say which answers are right.
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

  const tasks = await readExamTasks(lang, byPath, drafts);
  const exams: Exam[] = [];
  for (const chapter of root.children) {
    if (chapter.kind !== 'chapter') continue;
    const chapterParts = chapter.lessons.flatMap((lesson) => parts.get(lesson) ?? []);
    const chapterTasks = tasks.get(chapter) ?? [];
    if (chapterParts.length === 0 && chapterTasks.length === 0) continue;
    const path = examUrl(chapter.path);
    const questions = chapterParts.reduce((sum, part) => sum + part.key.length, 0);
    chapter.exam = {
      kind: 'exam',
      chapter,
      path,
      url: localizeUrl(path, lang),
      title: chapter.title,
      parts: chapterParts,
      tasks: chapterTasks,
      lessons: chapter.lessons.filter((lesson) => parts.has(lesson) || chapterTasks.some((task) => task.lessons.includes(lesson))),
      questions,
      drawn: Math.min(site.exams.questions, questions),
    };
    byPath.set(path, chapter.exam);
    exams.push(chapter.exam);
  }
  return exams;
}

/** The most cases an instance of an exam task can have, and the longest a case can be, in characters. */
const MAX_TASK_CASES = 40;
const MAX_CASE_LENGTH = 400;

/** How much text the files of one instance of an exam task can hold in all, in characters. */
const MAX_INSTANCE_FILES = 20_000;

/**
 * The practical tasks in the `tasks/` folder of each top-level chapter's folder in exams/, by
 * chapter: a folder for each task, with its task.md and translations, the code the reader
 * starts from in starter.py, the instances attempts draw from in pool.json (`npm run
 * exam-tasks` makes it) and any files the reader's code can open in files/. Mistakes fail the
 * build; `npm run check:exam-tasks` runs the tasks' reference solutions on them.
 */
async function readExamTasks(
  lang: Lang,
  byPath: Map<string, Node>,
  /** Paths of lessons hidden with `draft: true`, which tasks can't draw on. */
  drafts: Set<string>,
): Promise<Map<Chapter, ExamTask[]>> {
  const entries = await getCollection('examTasks', (entry) => !entry.data.draft);
  const tasks = new Map<Chapter, ExamTask[]>();
  const ids = new Map<string, ExamTaskNote>();
  const example = `"${EXAMS_DIR}/02-python/tasks/01-triangles/task.md"`;

  for (const [file, versions] of groupTranslations(entries)) {
    const noteLang = pickLang(versions, lang);
    const note = versions.get(noteLang)!;
    const where = examTaskFile(file)!;
    if (where.file !== 'task.md') {
      throw new Error(`"${note.filePath}" isn't named task.md, or task.pl.md for a translation. A task's folder has one task.md, with its translations next to it.`);
    }
    const original = versions.get(DEFAULT_LANG);
    if (!original) {
      throw new Error(`"${note.filePath}" is a translation of a task that has no task.md in ${DEFAULT_LANG}. Write the original first, like ${example}.`);
    }
    const chapter = byPath.get(noteUrl(where.chapter));
    if (chapter?.kind !== 'chapter' || chapter.parents.length !== 0) {
      throw new Error(
        `"${note.filePath}" has no chapter: there's no folder ${NOTES_DIR}/${where.chapter}/. A task's folder sits in a folder named like its chapter's, in a tasks/ folder, like ${example}.`,
      );
    }

    const lessons: Lesson[] = [];
    for (const lessonFile of original.data.lessons ?? []) {
      const lessonPath = noteUrl(lessonFile);
      const lesson = byPath.get(lessonPath);
      if (lesson?.kind !== 'lesson') {
        if (drafts.has(lessonPath)) continue;
        throw new Error(`"${original.filePath}" draws on "${lessonFile}", but there's no lesson at ${lessonPath}. List the lessons as paths inside ${NOTES_DIR}/, like "${NOTES_DIR}/${chapter.dir}/…".`);
      }
      if (lesson.parents[0] !== chapter) {
        throw new Error(`"${original.filePath}" draws on "${lesson.note.filePath}", which isn't in the chapter's folder. A task can only draw on lessons of its own chapter.`);
      }
      if (!lessons.includes(lesson)) lessons.push(lesson);
    }
    if (lessons.length === 0) {
      throw new Error(`"${original.filePath}" doesn't say which lessons it draws on. List them under "lessons:" in its front matter, as paths inside ${NOTES_DIR}/: the exam links them to readers who get the task wrong.`);
    }
    lessons.sort((a, b) => chapter.lessons.indexOf(a) - chapter.lessons.indexOf(b));

    const folder = path.join(EXAMS_DIR, where.chapter, 'tasks', where.name);
    const read = (name: string) => {
      const code = path.join(folder, name);
      if (!existsSync(code)) {
        throw new Error(`"${folder}/" has no ${name}. Every task has the code the reader starts from in starter.py and the instances attempts draw from in pool.json, which "npm run exam-tasks" makes.`);
      }
      return readFileSync(code, 'utf8');
    };
    const [starter, poolText] = [read('starter.py'), read('pool.json')];
    const files = readFiles(folder);

    const id = examTaskId(where.chapter, where.name);
    const other = ids.get(id);
    if (other) throw new Error(`"${other.filePath}" and "${note.filePath}" would give their tasks the same id, "${id}". Rename one of their folders.`);
    ids.set(id, note);

    const task: ExamTask = {
      id,
      dir: path.posix.join(where.chapter, 'tasks', where.name),
      note,
      lang: noteLang,
      title: note.data.title ?? leadingHeading(note.body) ?? prettify(where.name),
      lessons,
      starter,
      files,
      input: original.data.input ?? (READS_INPUT.test(starter) ? '' : undefined),
      pool: readPool(poolText, folder),
      sources: [
        ...[DEFAULT_LANG, ...LANGS.filter((code) => code !== DEFAULT_LANG)].flatMap((code) => versions.get(code) ?? []).map((version) => ({ path: version.filePath ?? version.id, text: version.body ?? '' })),
        { path: `${folder}/starter.py`, text: starter },
        { path: `${folder}/pool.json`, text: poolText },
        ...Object.entries(files).map(([name, data]) => ({ path: `${folder}/files/${name}`, text: data })),
      ],
    };
    tasks.set(chapter, [...(tasks.get(chapter) ?? []), task]);
  }

  for (const list of tasks.values()) {
    list.sort((a, b) => {
      const [nameA, nameB] = [a.dir.slice(a.dir.lastIndexOf('/') + 1), b.dir.slice(b.dir.lastIndexOf('/') + 1)];
      if (hasOrder(nameA) !== hasOrder(nameB)) return hasOrder(nameA) ? -1 : 1;
      return nameCollator.compare(nameA, nameB);
    });
  }
  return tasks;
}

/** The instances in a task's pool.json; throws if the file isn't what `npm run exam-tasks` writes. Its messages never quote what the right code gives. */
function readPool(text: string, folder: string): PoolInstance[] {
  const fail = (problem: string): never => {
    throw new Error(`"${folder}/pool.json" ${problem}. Run "npm run exam-tasks" to make it again.`);
  };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return fail("isn't JSON");
  }
  const isStrings = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === 'string');
  const instances = (parsed as { instances?: unknown } | null)?.instances;
  if (!Array.isArray(instances) || instances.length === 0) return fail('has no instances');
  return instances.map((instance: Partial<PoolInstance> | null, i) => {
    const { cases, files = {}, expected } = instance ?? {};
    if (!isStrings(cases) || !isStrings(expected)) return fail(`has instance ${i + 1} without a list of cases and a list of what they give`);
    if (cases.length === 0 || cases.length > MAX_TASK_CASES) return fail(`has instance ${i + 1} with ${cases.length} cases, where one has 1 to ${MAX_TASK_CASES}`);
    if (expected.length !== cases.length) return fail(`has instance ${i + 1} with ${cases.length} cases and ${expected.length} results`);
    if (cases.some((item) => item.length > MAX_CASE_LENGTH || !item.trim())) return fail(`has a case in instance ${i + 1} that's empty or longer than ${MAX_CASE_LENGTH} characters`);
    const isFiles = typeof files === 'object' && files !== null && !Array.isArray(files) && Object.values(files).every((item) => typeof item === 'string');
    if (!isFiles) return fail(`has instance ${i + 1} whose files aren't text by name`);
    if (Object.values(files).reduce((sum, item) => sum + item.length, 0) > MAX_INSTANCE_FILES) {
      return fail(`has instance ${i + 1} with more than ${MAX_INSTANCE_FILES} characters of files`);
    }
    return { cases, files, expected };
  });
}

/** Code that reads what's typed in, so its exercise's page gets an input box. */
const READS_INPUT = /\binput\s*\(/;

/** How big an exercise's files can be in all, as they're part of its page. */
const MAX_FILES_BYTES = 1_000_000;

/**
 * Gives lessons their exercises: the folders in exercises/ with a task.md, inside a folder with
 * the lesson's path. Each exercise's folder has its code next to task.md: starter.py,
 * solution.py and checks.py, and files/ with any files the code opens. Mistakes fail the build;
 * `npm run check:exercises` runs the checks.
 */
async function addExercises(
  lang: Lang,
  byPath: Map<string, Node>,
  /** Paths of lessons hidden with `draft: true`, whose exercises are hidden too. */
  drafts: Set<string>,
): Promise<void> {
  const entries = await getCollection('exercises', (entry) => !entry.data.draft);
  const example = `"${EXERCISES_DIR}/python/01-running-python/01-week/task.md" for "${NOTES_DIR}/python/01-running-python.md"`;

  for (const [file, versions] of groupTranslations(entries)) {
    const noteLang = pickLang(versions, lang);
    const note = versions.get(noteLang)!;
    const slash = file.lastIndexOf('/');
    const dir = file.slice(0, Math.max(slash, 0));
    if (file.slice(slash + 1) !== 'task.md') {
      throw new Error(`"${note.filePath}" isn't named task.md, or task.pl.md for a translation. An exercise's folder has one task.md, with its translations next to it.`);
    }
    if (!dir.includes('/')) {
      throw new Error(`"${note.filePath}" isn't in a lesson's folder. An exercise's folder sits in a folder with its lesson's path, like ${example}.`);
    }

    const lessonPath = noteUrl(dir.slice(0, dir.lastIndexOf('/')));
    const lesson = byPath.get(lessonPath);
    if (lesson?.kind !== 'lesson') {
      if (drafts.has(lessonPath)) continue;
      throw new Error(
        `"${note.filePath}" has no lesson: there's no lesson at ${lessonPath}. An exercise's folder sits in a folder with its lesson's path, like ${example}.`,
      );
    }

    const folder = path.join(EXERCISES_DIR, dir);
    const read = (name: string) => {
      const code = path.join(folder, name);
      if (!existsSync(code)) {
        throw new Error(`"${folder}/" has no ${name}. Every exercise has the code the reader starts from in starter.py, an answer in solution.py and the checks in checks.py.`);
      }
      return readFileSync(code, 'utf8');
    };
    const [starter, solution, checks] = [read('starter.py'), read('solution.py'), read('checks.py')];
    const exercisePath = exerciseUrl(dir);
    const taken = byPath.get(exercisePath);
    if (taken?.kind === 'exercise') {
      throw new Error(`"${taken.note.filePath}" and "${note.filePath}" would both be published at ${exercisePath}. Rename one of their folders.`);
    }

    const exercise: Exercise = {
      kind: 'exercise',
      note,
      lang: noteLang,
      dir,
      lesson,
      path: exercisePath,
      url: localizeUrl(exercisePath, lang),
      title: note.data.title ?? leadingHeading(note.body) ?? prettify(dir.slice(dir.lastIndexOf('/') + 1)),
      description: note.data.description,
      number: 0,
      starter,
      solution,
      checks,
      files: readFiles(folder),
      input: note.data.input ?? (READS_INPUT.test(starter) || READS_INPUT.test(solution) ? '' : undefined),
    };
    lesson.exercises.push(exercise);
    byPath.set(exercisePath, exercise);
  }

  for (const node of byPath.values()) {
    if (node.kind !== 'lesson') continue;
    node.exercises.sort((a, b) => {
      const [nameA, nameB] = [a.dir.slice(a.dir.lastIndexOf('/') + 1), b.dir.slice(b.dir.lastIndexOf('/') + 1)];
      if (hasOrder(nameA) !== hasOrder(nameB)) return hasOrder(nameA) ? -1 : 1;
      return nameCollator.compare(nameA, nameB);
    });
    node.exercises.forEach((exercise, i) => (exercise.number = i + 1));
  }
}

/** The files in an exercise's files/ folder, by path inside it, in base64. */
function readFiles(folder: string): Record<string, string> {
  const root = path.join(folder, 'files');
  if (!existsSync(root)) return {};
  const files: Record<string, string> = {};
  let bytes = 0;
  for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    const data = readFileSync(file);
    bytes += data.length;
    files[path.relative(root, file).split(path.sep).join('/')] = data.toString('base64');
  }
  if (bytes > MAX_FILES_BYTES) {
    throw new Error(`The files in "${root}/" come to ${Math.round(bytes / 1000)} kB. They're part of the exercise's page, so keep them under ${MAX_FILES_BYTES / 1000} kB.`);
  }
  return files;
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
function groupTranslations<T extends Note | TestNote | ExamNote | ExamTaskNote | ExerciseNote>(entries: T[]): Map<string, Map<Lang, T>> {
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
  if (node.path.startsWith(CERTIFICATES_PATH)) {
    throw new Error(`"${describe(node)}" would be published at ${node.path}, where the exams' certificates live. Rename it.`);
  }
  if (node.path.startsWith(EXERCISES_PATH)) {
    throw new Error(`"${describe(node)}" would be published at ${node.path}, where the exercises live. Rename it.`);
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

/** Path of a note inside notes/, a test inside tests/, exam questions or an exam task inside exams/ or an exercise's task inside exercises/, including any language code. */
function entryFile(entry: Note | TestNote | ExamNote | ExamTaskNote | ExerciseNote): string {
  const dir = { notes: NOTES_DIR, tests: TESTS_DIR, exams: EXAMS_DIR, examTasks: EXAMS_DIR, exercises: EXERCISES_DIR }[entry.collection];
  return (entry.filePath ?? '').slice(dir.length + 1);
}

/** Id of a top-level chapter's section on the tests overview, like `foundations`. */
export function testGroupId(chapter: Chapter): string {
  return chapter.path.slice(1, -1).replaceAll('/', '-');
}

/** Link that opens the note, test or exercise in GitHub's web editor. */
export function editUrl(repo: string, branch: string, note: Note | TestNote | ExerciseNote): string {
  return `${repo}/edit/${branch}/${encodePath(note.filePath ?? '')}`;
}

/** Link to GitHub's "new file" page inside a chapter's folder. */
export function newLessonUrl(repo: string, branch: string, chapter: Chapter): string {
  return `${repo}/new/${branch}/${encodePath([NOTES_DIR, chapter.dir].filter(Boolean).join('/'))}`;
}

/** Link to GitHub's "new file" page, named for the translation of the note, test or exercise's task into `lang`. */
export function translateUrl(repo: string, branch: string, note: Note | TestNote | ExerciseNote, lang: Lang): string {
  const file = splitLang(note.filePath ?? '').file;
  const slash = file.lastIndexOf('/');
  const name = withLang(file.slice(slash + 1), lang);
  return `${repo}/new/${branch}/${encodePath(file.slice(0, Math.max(slash, 0)))}?filename=${encodeURIComponent(name)}`;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}
