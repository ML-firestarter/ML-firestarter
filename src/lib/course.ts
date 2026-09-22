/**
 * Turns the files in notes/ into a course: folders are chapters, Markdown files are lessons.
 * Numbered files and folders (01-, 02-, …) come first, in number order; the rest follow
 * alphabetically by title. A note's translations sit next to it: `sft.pl.md` is the
 * Polish version of `sft.md`, and pages without a translation show the original.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { DEFAULT_LANG, LANGS, localizeUrl, type Lang } from './i18n.ts';
import {
  NOTES_DIR,
  hasOrder,
  isIndexFile,
  leadingHeading,
  noteUrl,
  prettify,
  splitLang,
  withLang,
} from './paths.ts';

type Note = CollectionEntry<'notes'>;

export interface Lesson {
  kind: 'lesson';
  note: Note;
  /** Language of `note`; not the course's language when the lesson isn't translated yet. */
  lang: Lang;
  /** Path inside notes/ without a language code, e.g. `02-foundations/01-what-is-ml.md`. */
  file: string;
  /** Language-neutral URL, e.g. `/foundations/what-is-ml/`; also the key for progress. */
  path: string;
  /** URL in the course's language, e.g. `/pl/foundations/what-is-ml/`. */
  url: string;
  title: string;
  description?: string;
  minutes: number;
  /** Enclosing chapters, outermost first. */
  parents: Chapter[];
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

export interface Course {
  lang: Lang;
  /** notes/ itself; its README.md is the home page intro. */
  root: Chapter;
  /** Every lesson in reading order. */
  lessons: Lesson[];
  /** Every folder except the root, in reading order. */
  chapters: Chapter[];
  /** Lessons and chapters by language-neutral path. */
  byPath: Map<string, Chapter | Lesson>;
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
  const notes = await getCollection('notes', (note) => !note.data.draft);
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
    // This language if it's there, otherwise the original.
    const noteLang = [lang, DEFAULT_LANG, ...LANGS].find((code) => versions.has(code))!;
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
  const byPath = new Map<string, Chapter | Lesson>();

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

  return { lang, root, lessons: finish(root), chapters, byPath };
}

/** Collects each note's language versions under its path without a language code. */
function groupTranslations(notes: Note[]): Map<string, Map<Lang, Note>> {
  const groups = new Map<string, Map<Lang, Note>>();
  for (const note of notes) {
    const { file, lang } = splitLang(noteFile(note));
    const versions = groups.get(file) ?? new Map<Lang, Note>();
    const taken = versions.get(lang);
    if (taken) {
      throw new Error(`"${taken.filePath}" and "${note.filePath}" are both the "${lang}" version of one note. Delete one of them.`);
    }
    groups.set(file, versions.set(lang, note));
  }
  return groups;
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

function claimPath(byPath: Map<string, Chapter | Lesson>, node: Chapter | Lesson) {
  const describe = (n: Chapter | Lesson) => (n.kind === 'chapter' ? `${NOTES_DIR}/${n.dir}/` : n.note.filePath);
  const prefix = LANGS.find((code) => code !== DEFAULT_LANG && node.path.startsWith(`/${code}/`));
  if (prefix) {
    throw new Error(
      `"${describe(node)}" would be published at ${node.path}, where the "${prefix}" version of the site lives. ` +
        `Rename it. Translations sit next to the original instead, like "sft.${prefix}.md" next to "sft.md".`,
    );
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

/** Path of a note inside notes/, including any language code. */
function noteFile(note: Note): string {
  return (note.filePath ?? '').slice(NOTES_DIR.length + 1);
}

/** Link that opens the note in GitHub's web editor. */
export function editUrl(repo: string, branch: string, note: Note): string {
  return `${repo}/edit/${branch}/${encodePath(note.filePath ?? '')}`;
}

/** Link to GitHub's "new file" page inside a chapter's folder. */
export function newLessonUrl(repo: string, branch: string, chapter: Chapter): string {
  return `${repo}/new/${branch}/${encodePath([NOTES_DIR, chapter.dir].filter(Boolean).join('/'))}`;
}

/** Link to GitHub's "new file" page, named for the note's translation into `lang`. */
export function translateUrl(repo: string, branch: string, note: Note, lang: Lang): string {
  const file = splitLang(noteFile(note)).file;
  const slash = file.lastIndexOf('/');
  const dir = [NOTES_DIR, file.slice(0, Math.max(slash, 0))].filter(Boolean).join('/');
  const name = withLang(file.slice(slash + 1), lang);
  return `${repo}/new/${branch}/${encodePath(dir)}?filename=${encodeURIComponent(name)}`;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}
